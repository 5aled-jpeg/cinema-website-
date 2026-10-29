'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useWebHaptics } from 'web-haptics/react';
import { cn } from '@/lib/utils';

export interface TimelineDateItem {
  id: string; // e.g. "2026-09-28" or "all"
  label: string; // e.g. "Sep 28" or "ALL FILMS"
  fullFormatted: string; // e.g. "28 Sep 2026"
  count?: number; // number of screenings on this date
}

export interface MechanicalTimelineFilterProps {
  dates: string[]; // List of unique dates e.g. ["2026-09-28", "2026-09-29", ...]
  screeningsCountByDate?: Record<string, number>;
  selectedDate: string | null; // e.g. "2026-09-28" or null for all
  onSelectDate: (date: string | null) => void;
  className?: string;
}

// Format "2026-09-28" into { prefix: "Sep ", digit: "28", full: "28 Sep 2026" }
function parseDateForOdometer(dateStr: string | null) {
  if (!dateStr || dateStr === 'all') {
    return { prefix: 'ALL ', digit: 'FILMS', full: 'All Theatrical Screenings' };
  }
  const parts = dateStr.split('-');
  if (parts.length < 3) {
    return { prefix: 'DATE ', digit: '01', full: dateStr };
  }
  const [y, m, d] = parts.map(Number);
  const dateObj = new Date(y, m - 1, d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[dateObj.getMonth()] || 'Oct';
  const dayStr = String(d).padStart(2, '0');
  return {
    prefix: `${monthName} `,
    digit: dayStr,
    full: `${dayStr} ${monthName} ${y}`,
  };
}

// Escapement Resonators & Filters (Restored from Peng Zheng's exact implementation)
const G: [number, number, number][] = [
  [5200, 0.8, 0.6],
  [7400, 0.5, 0.4],
];
const FILT = { hp: 4000, gain: 0.12, decay: 0.25 };
const PROFILES = {
  fine: { pitch: 1.0, decay: 0.5, level: 0.28 },
  line: { pitch: 0.9, decay: 0.7, level: 0.35 },
  travel: { pitch: 1.1, decay: 0.6, level: 0.32 },
  close: { pitch: 1.2, decay: 0.85, level: 0.4 },
};

function generateEscapementSample(sampleRate: number, pitch = 1, decay = 1) {
  const len = Math.round(sampleRate * 0.04 * Math.max(1, decay));
  const buf = new Float32Array(len);
  const a = (2 * Math.PI * FILT.hp * pitch) / sampleRate;
  const cosA = Math.cos(a);
  const sinA = Math.sin(a) / 1.414;
  const [c, l, u] = [(1 + cosA) / 2, -(1 + cosA), (1 + cosA) / 2];
  const [d, f, p] = [1 + sinA, -2 * cosA, 1 - sinA];
  let m = 0,
    h = 0,
    vVal = 0,
    yVal = 0,
    peak = 0;

  for (let i = 0; i < len; i++) {
    const t = i / sampleRate;
    const noise = Math.random() * 2 - 1;
    const filtered = (c * noise + l * m + u * h - f * vVal - p * yVal) / d;
    h = m;
    m = noise;
    yVal = vVal;
    vVal = filtered;

    let s = FILT.gain * filtered * Math.exp(-t / ((FILT.decay * decay) / 1000)) * 3;
    for (const [freq, q, amp] of G) {
      s += amp * Math.sin(2 * Math.PI * freq * pitch * t) * Math.exp(-t / ((q * decay) / 1000));
    }
    buf[i] = s * Math.min(1, t / 0.0001);
    peak = Math.max(peak, Math.abs(buf[i]));
  }

  const fade = Math.round(sampleRate * 0.005);
  for (let i = 0; i < fade; i++) {
    buf[len - 1 - i] *= i / fade;
  }
  for (let i = 0; i < len; i++) {
    buf[i] /= peak || 1;
  }
  return buf;
}

export function MechanicalTimelineFilter({
  dates,
  screeningsCountByDate = {},
  selectedDate,
  onSelectDate,
  className,
}: MechanicalTimelineFilterProps) {
  const [isDialActive, setIsDialActive] = useState<boolean>(false);
  const [hoverPositionPct, setHoverPositionPct] = useState<number>(0);
  const [cursorPositionPct, setCursorPositionPct] = useState<number>(0);

  // Web Haptics for Mobile & Tablets
  const { trigger } = useWebHaptics();

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const lastHoveredIdxRef = useRef<number>(-1);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // DOM Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const prefixRef = useRef<HTMLSpanElement>(null);
  const reelRef = useRef<HTMLSpanElement>(null);
  const digitRef = useRef<HTMLSpanElement>(null);
  const lastDateTextRef = useRef<string>('');

  // Geometry Constants for the Half-Circle Arc
  const SVG_W = 340;
  const SVG_H = 150;
  const CX = 170;
  const CY = 138;
  const R = 120;

  // Timeline Items (first item is "All", followed by sorted dates)
  const timelineItems: TimelineDateItem[] = useMemo(() => {
    const list: TimelineDateItem[] = [
      {
        id: 'all',
        label: 'ALL FILMS',
        fullFormatted: 'All Curated Films',
        count: Object.values(screeningsCountByDate).reduce((a, b) => a + b, 0),
      },
    ];

    const sortedDates = [...dates].sort();
    sortedDates.forEach((d) => {
      const parsed = parseDateForOdometer(d);
      list.push({
        id: d,
        label: `${parsed.prefix}${parsed.digit}`,
        fullFormatted: parsed.full,
        count: screeningsCountByDate[d] || 0,
      });
    });

    return list;
  }, [dates, screeningsCountByDate]);

  const totalTicks = Math.max(48, timelineItems.length * 5);
  const majorInterval = 6;

  // Initialize Web Audio Escapement Synthesizer
  const initAudio = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } catch {}
  }, []);

  // Auto unlock audio on first user touch / pointer gesture (critical for mobile iOS/Android)
  useEffect(() => {
    const unlock = () => initAudio();
    const evts = ['pointerdown', 'touchstart', 'wheel', 'keydown', 'pointermove'];
    evts.forEach((evt) => {
      window.addEventListener(evt, unlock, { capture: true, once: true });
    });
    return () => {
      evts.forEach((evt) => window.removeEventListener(evt, unlock, { capture: true }));
    };
  }, [initAudio]);

  const playTick = useCallback(
    (type: 'fine' | 'line' | 'travel' | 'close' = 'fine') => {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state !== 'running') return;

      const profile = PROFILES[type] || PROFILES.fine;
      if (!audioBuffersRef.current[type]) {
        const raw = generateEscapementSample(ctx.sampleRate, profile.pitch, profile.decay);
        const b = ctx.createBuffer(1, raw.length, ctx.sampleRate);
        b.getChannelData(0).set(raw);
        audioBuffersRef.current[type] = b;
      }

      try {
        const src = ctx.createBufferSource();
        src.buffer = audioBuffersRef.current[type];
        const gain = ctx.createGain();
        gain.gain.value = (profile.level || 1) * 0.6;
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start();
      } catch {}
    },
    [initAudio]
  );

  // 3D Perspective Cylindrical Odometer Date Roll
  const setDateWithOdometer = useCallback((fullDateStr: string, dir = 1) => {
    if (fullDateStr === lastDateTextRef.current) return;

    const match = fullDateStr.match(/^(.*?)(\d+)$/);
    let prefix = fullDateStr;
    let digitStr = '';

    if (match) {
      prefix = match[1];
      digitStr = match[2];
    } else {
      prefix = fullDateStr;
      digitStr = '';
    }

    if (prefixRef.current) {
      prefixRef.current.textContent = prefix;
    }

    if (!digitRef.current || !reelRef.current) return;

    if (!lastDateTextRef.current || digitStr === digitRef.current.textContent || dir === 0) {
      digitRef.current.textContent = digitStr;
      lastDateTextRef.current = fullDateStr;
      return;
    }

    const oldDigit = digitRef.current.textContent || '';
    const newDigit = digitStr;
    lastDateTextRef.current = fullDateStr;

    reelRef.current.querySelectorAll('.tl-reel-ghost').forEach((g) => g.remove());

    const ghost = document.createElement('span');
    ghost.className = 'tl-reel-ghost absolute inset-0';
    ghost.textContent = oldDigit;
    reelRef.current.appendChild(ghost);

    digitRef.current.textContent = newDigit;

    const dur = 240;
    const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
    const rollDir = dir >= 0 ? 1 : -1;

    ghost.animate(
      [
        {
          transform: 'perspective(3em) translateZ(-0.54em) rotateX(0deg) translateZ(0.54em)',
          opacity: '1',
        },
        {
          transform: `perspective(3em) translateZ(-0.54em) rotateX(${rollDir * 64}deg) translateZ(0.54em)`,
          opacity: '0',
        },
      ],
      { duration: dur, easing, fill: 'forwards' }
    ).finished.then(() => ghost.remove()).catch(() => ghost.remove());

    digitRef.current.animate(
      [
        {
          transform: `perspective(3em) translateZ(-0.54em) rotateX(${-rollDir * 64}deg) translateZ(0.54em)`,
          opacity: '0',
        },
        {
          transform: 'perspective(3em) translateZ(-0.54em) rotateX(0deg) translateZ(0.54em)',
          opacity: '1',
        },
      ],
      { duration: dur, easing, fill: 'forwards' }
    );
  }, []);

  // Sync cursor position whenever selectedDate prop changes externally
  useEffect(() => {
    if (timelineItems.length === 0) return;
    let targetIdx = 0;
    if (selectedDate) {
      targetIdx = timelineItems.findIndex((it) => it.id === selectedDate);
      if (targetIdx === -1) targetIdx = 0;
    }
    const pct = (targetIdx / (timelineItems.length - 1)) * 100;
    setCursorPositionPct(pct);
    setHoverPositionPct(pct);
    const item = timelineItems[targetIdx];
    if (item) {
      setDateWithOdometer(item.label, 0);
    }
  }, [selectedDate, timelineItems, setDateWithOdometer]);

  // Compute angle and item at pointer position along the half-circle arc
  const getItemAtClientPos = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const scale = SVG_W / rect.width;
      const localX = (clientX - rect.left) * scale;
      const localY = (clientY - rect.top) * scale;

      const dx = localX - CX;
      const dy = CY - localY; // positive when above center

      let angle = Math.atan2(dy, dx);
      // Clamp angle to half-circle (0 to pi)
      if (angle < 0) {
        angle = dx < 0 ? Math.PI : 0;
      }

      // Fractional progress: 0 (left/pi) to 1 (right/0)
      const rawT = Math.max(0, Math.min(1, (Math.PI - angle) / Math.PI));
      const tickIdx = Math.round(rawT * (totalTicks - 1));
      const pct = (tickIdx / (totalTicks - 1)) * 100;
      const itemIdx = Math.round((tickIdx / (totalTicks - 1)) * (timelineItems.length - 1));
      const item = timelineItems[itemIdx] || timelineItems[0];
      return { tickIdx, pct, itemIdx, item };
    },
    [totalTicks, timelineItems]
  );

  // Update hover preview (PREVIEW ONLY — NO SWITCH ON HOVER)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setIsDialActive(true);

    const info = getItemAtClientPos(e.clientX, e.clientY);
    if (!info) return;

    setHoverPositionPct(info.pct);

    if (info.tickIdx !== lastHoveredIdxRef.current) {
      const dir = info.tickIdx > lastHoveredIdxRef.current ? 1 : -1;
      lastHoveredIdxRef.current = info.tickIdx;
      const isMajor = info.tickIdx % majorInterval === 0;
      playTick(isMajor ? 'line' : 'fine');
      try {
        trigger(isMajor ? 'medium' : 'selection');
      } catch {}

      // Preview date in odometer label ONLY
      setDateWithOdometer(info.item.label, dir);

      // If dragging with button held down, update committed position
      if (isDraggingRef.current) {
        setCursorPositionPct(info.pct);
        const dateParam = info.item.id === 'all' ? null : info.item.id;
        onSelectDate(dateParam);
      }
    }
  };

  // Commit on click / pointer down
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDialActive(true);
    isDraggingRef.current = true;

    const info = getItemAtClientPos(e.clientX, e.clientY);
    if (info) {
      setHoverPositionPct(info.pct);
      setCursorPositionPct(info.pct);
      lastHoveredIdxRef.current = info.tickIdx;
      playTick('line');
      try {
        trigger('light');
      } catch {}
      setDateWithOdometer(info.item.label, 0);

      // SWITCH IS STRICTLY ON CLICK!
      const dateParam = info.item.id === 'all' ? null : info.item.id;
      onSelectDate(dateParam);
    }

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    playTick('close');
    try {
      trigger('rigid');
    } catch {}
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    hideTimeoutRef.current = setTimeout(() => {
      setIsDialActive(false);
      const cur = selectedDate
        ? timelineItems.find((it) => it.id === selectedDate)
        : timelineItems[0];
      if (cur) setDateWithOdometer(cur.label, 0);
    }, 400);
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsDialActive(false);
        const cur = selectedDate
          ? timelineItems.find((it) => it.id === selectedDate)
          : timelineItems[0];
        if (cur) setDateWithOdometer(cur.label, 0);
      }, 400);
    }
  };

  // Calculate arc tick points
  const ticksData = useMemo(() => {
    const list = [];
    for (let i = 0; i < totalTicks; i++) {
      const isMajor = i % majorInterval === 0;
      const t = i / (totalTicks - 1);
      const theta = Math.PI * (1 - t);
      const L = isMajor ? 12 : 6.5;

      const rInner = R - L / 2;
      const rOuter = R + L / 2;

      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      const x1 = CX + rInner * cos;
      const y1 = CY - rInner * sin;
      const x2 = CX + rOuter * cos;
      const y2 = CY - rOuter * sin;

      list.push({ i, isMajor, x1, y1, x2, y2 });
    }
    return list;
  }, [totalTicks]);

  // Dual committed cursor lines
  const committedCursorLines = useMemo(() => {
    const t = cursorPositionPct / 100;
    const centerTheta = Math.PI * (1 - t);
    const dTheta = 0.024;
    const L = 16;
    const rInner = R - L / 2;
    const rOuter = R + L / 2;

    const makeLine = (angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x1: CX + rInner * cos,
        y1: CY - rInner * sin,
        x2: CX + rOuter * cos,
        y2: CY - rOuter * sin,
      };
    };

    return [makeLine(centerTheta - dTheta), makeLine(centerTheta + dTheta)];
  }, [cursorPositionPct]);

  // Amber indicator tick
  const hoverIndicatorLine = useMemo(() => {
    const t = hoverPositionPct / 100;
    const theta = Math.PI * (1 - t);
    const L = 20;
    const rInner = R - L / 2;
    const rOuter = R + L / 2;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    return {
      x1: CX + rInner * cos,
      y1: CY - rInner * sin,
      x2: CX + rOuter * cos,
      y2: CY - rOuter * sin,
    };
  }, [hoverPositionPct]);

  return (
    <div
      data-timeline-zone="true"
      role="slider"
      aria-label="Half-Circle Escapement Timeline Filter"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className={cn(
        'relative w-[340px] max-w-[92vw] h-[142px] select-none cursor-pointer flex flex-col items-center justify-end touch-none',
        className
      )}
    >
      {/* Half-Circle SVG Radial Arc */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-full overflow-visible pointer-events-none"
      >
        <defs>
          <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="white-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Circular Guide Arc Hairline */}
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth="1"
          strokeDasharray="2 4"
        />

        {/* Radial Escapement Ticks */}
        {ticksData.map((t) => (
          <line
            key={t.i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.isMajor ? 'rgba(255, 255, 255, 0.52)' : 'rgba(255, 255, 255, 0.24)'}
            strokeWidth={t.isMajor ? 1.6 : 1}
            strokeLinecap="round"
          />
        ))}

        {/* Active Committed Dual Ticks (| |) */}
        {committedCursorLines.map((line, idx) => (
          <line
            key={`cur-${idx}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#white-glow)"
          />
        ))}

        {/* Vibrant Amber/Gold Scrub Indicator Tick */}
        <line
          x1={hoverIndicatorLine.x1}
          y1={hoverIndicatorLine.y1}
          x2={hoverIndicatorLine.x2}
          y2={hoverIndicatorLine.y2}
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#amber-glow)"
          className="transition-opacity duration-150"
          opacity={isDialActive ? 1 : 0}
        />
      </svg>

      {/* 3D Cylindrical Odometer Rolling Date (Anchored in Center Under the Arch) */}
      <div className="absolute top-[48px] inset-x-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="flex items-baseline text-white font-serif tracking-tight drop-shadow-md select-none">
          <span
            ref={prefixRef}
            className="inline-block text-amber-400 font-mono text-[11px] sm:text-xs uppercase mr-0.5 tracking-wider font-semibold"
          >
            OCT{' '}
          </span>
          <span
            ref={reelRef}
            className="inline-block relative h-[1.3em] min-w-[1.6em] align-baseline [perspective:3em] overflow-visible"
          >
            <span
              ref={digitRef}
              className="absolute inset-0 leading-tight origin-center [backface-visibility:hidden] will-change-transform text-white font-mono text-sm sm:text-base font-bold"
            >
              19
            </span>
          </span>
        </div>

        {/* Subtle Arch Complication Label */}
        <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-neutral-400/80 mt-1">
          {selectedDate ? 'Filter Active' : 'Curated Wheel'}
        </span>
      </div>
    </div>
  );
}

export default MechanicalTimelineFilter;
