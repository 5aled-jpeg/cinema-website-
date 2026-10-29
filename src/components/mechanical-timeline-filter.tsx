'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useWebHaptics } from 'web-haptics/react';
import { cn } from '@/lib/utils';

export interface TimelineDateItem {
  id: string; // e.g. "2026-09-28" or "all"
  label: string; // e.g. "Sep 28" or "ALL FILMS"
  rimLabel: string; // e.g. "28" or "ALL"
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

// Format "2026-09-28" into { prefix: "SEP ", digit: "28", full: "28 Sep 2026", rim: "28" }
function parseDateForOdometer(dateStr: string | null) {
  if (!dateStr || dateStr === 'all') {
    return { prefix: 'ALL ', digit: 'FILMS', full: 'All Theatrical Screenings', rim: 'ALL' };
  }
  const parts = dateStr.split('-');
  if (parts.length < 3) {
    return { prefix: 'DATE ', digit: '01', full: dateStr, rim: '01' };
  }
  const [y, m, d] = parts.map(Number);
  const dateObj = new Date(y, m - 1, d);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthName = months[dateObj.getMonth()] || 'OCT';
  const dayStr = String(d).padStart(2, '0');
  return {
    prefix: `${monthName} `,
    digit: dayStr,
    full: `${dayStr} ${monthName} ${y}`,
    rim: dayStr,
  };
}

// Authentic Swiss Escapement Synthesizer from Peng Zheng's portfolio
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
  // Web Haptics for Mobile & Tablets
  const { trigger } = useWebHaptics();

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const lastTickIndexCrossed = useRef<number>(-1);

  // Geometry Constants for the Arched Rotary Wheel
  const SVG_W = 320;
  const SVG_H = 76;
  const CX = 160;
  const R = 230;
  const CY = 262; // Apex is at (160, 32)
  const STEP_DEG = 15; // Degrees between dates
  const SUB_STEP_DEG = 3.75; // Degrees between minor ticks (4 intervals per date)

  // Timeline Items (first item is "All", followed by sorted dates)
  const timelineItems: TimelineDateItem[] = useMemo(() => {
    const list: TimelineDateItem[] = [
      {
        id: 'all',
        label: 'ALL FILMS',
        rimLabel: 'ALL',
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
        rimLabel: parsed.rim,
        fullFormatted: parsed.full,
        count: screeningsCountByDate[d] || 0,
      });
    });

    return list;
  }, [dates, screeningsCountByDate]);

  const maxPhi = Math.max(0, (timelineItems.length - 1) * STEP_DEG);

  // Dial rotation angle state (in degrees)
  const [phi, setPhi] = useState<number>(() => {
    if (!selectedDate) return 0;
    const idx = timelineItems.findIndex((it) => it.id === selectedDate);
    return idx >= 0 ? idx * STEP_DEG : 0;
  });

  const phiRef = useRef(phi);
  phiRef.current = phi;

  // Interaction refs
  const isDragging = useRef(false);
  const startPointerX = useRef(0);
  const startPhi = useRef(0);
  const hasMovedRef = useRef(false);
  const rafId = useRef<number | null>(null);
  const targetPhi = useRef(phi);

  // DOM Refs for rolling odometer
  const prefixRef = useRef<HTMLSpanElement>(null);
  const reelRef = useRef<HTMLSpanElement>(null);
  const digitRef = useRef<HTMLSpanElement>(null);
  const lastDateTextRef = useRef<string>('');

  // Initialize Web Audio
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

  // Unlock audio on first touch
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
        gain.gain.value = (profile.level || 1) * 0.55;
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

    const match = fullDateStr.match(/^(.*?)(\d+|FILMS)$/);
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
    ghost.className =
      'tl-reel-ghost absolute inset-0 flex items-center justify-center leading-none text-neutral-900 dark:text-white font-mono text-sm sm:text-base font-bold';
    ghost.textContent = oldDigit;
    reelRef.current.appendChild(ghost);

    digitRef.current.textContent = newDigit;

    const dur = 200;
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

  // Check and play escapement sound when dial crosses ticks
  const checkTickCrossed = useCallback(
    (currentAngle: number) => {
      const subTickIdx = Math.round(currentAngle / SUB_STEP_DEG);
      if (subTickIdx !== lastTickIndexCrossed.current) {
        const isMajor = subTickIdx % 4 === 0;
        lastTickIndexCrossed.current = subTickIdx;
        playTick(isMajor ? 'line' : 'fine');
        try {
          trigger(isMajor ? 'medium' : 'selection');
        } catch {}

        const nearestItemIdx = Math.max(
          0,
          Math.min(timelineItems.length - 1, Math.round(currentAngle / STEP_DEG))
        );
        const item = timelineItems[nearestItemIdx];
        if (item) {
          setDateWithOdometer(item.label, currentAngle > phiRef.current ? 1 : -1);
        }
      }
    },
    [timelineItems, playTick, trigger, setDateWithOdometer]
  );

  // Smooth animation loop to target angle
  const animateTo = useCallback(
    (target: number, onComplete?: () => void) => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      targetPhi.current = Math.max(0, Math.min(maxPhi, target));

      const step = () => {
        const current = phiRef.current;
        const diff = targetPhi.current - current;
        if (Math.abs(diff) < 0.08) {
          setPhi(targetPhi.current);
          phiRef.current = targetPhi.current;
          checkTickCrossed(targetPhi.current);
          onComplete?.();
        } else {
          const next = current + diff * 0.24;
          setPhi(next);
          phiRef.current = next;
          checkTickCrossed(next);
          rafId.current = requestAnimationFrame(step);
        }
      };
      rafId.current = requestAnimationFrame(step);
    },
    [maxPhi, checkTickCrossed]
  );

  // Sync external selectedDate changes
  useEffect(() => {
    if (timelineItems.length === 0) return;
    let targetIdx = 0;
    if (selectedDate) {
      targetIdx = timelineItems.findIndex((it) => it.id === selectedDate);
      if (targetIdx === -1) targetIdx = 0;
    }
    const targetAngle = targetIdx * STEP_DEG;
    animateTo(targetAngle);
    const item = timelineItems[targetIdx];
    if (item) {
      setDateWithOdometer(item.label, 0);
    }
  }, [selectedDate, timelineItems, animateTo, setDateWithOdometer]);

  // Pointer drag to rotate timeline wheel
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    isDragging.current = true;
    hasMovedRef.current = false;
    startPointerX.current = e.clientX;
    startPhi.current = phiRef.current;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startPointerX.current;
    if (Math.abs(deltaX) > 3) {
      hasMovedRef.current = true;
    }
    // Dragging left moves to later dates; dragging right moves to earlier dates
    const angleDelta = -(deltaX / (R * 0.72)) * (180 / Math.PI);
    const nextPhi = Math.max(-4, Math.min(maxPhi + 4, startPhi.current + angleDelta));
    setPhi(nextPhi);
    phiRef.current = nextPhi;
    checkTickCrossed(nextPhi);
  };

  const commitNearestDate = useCallback(() => {
    const nearestIdx = Math.max(
      0,
      Math.min(timelineItems.length - 1, Math.round(phiRef.current / STEP_DEG))
    );
    const snappedAngle = nearestIdx * STEP_DEG;
    animateTo(snappedAngle, () => {
      const selectedItem = timelineItems[nearestIdx];
      if (selectedItem) {
        playTick('close');
        try {
          trigger('light');
        } catch {}
        const dateParam = selectedItem.id === 'all' ? null : selectedItem.id;
        onSelectDate(dateParam);
      }
    });
  }, [timelineItems, animateTo, playTick, trigger, onSelectDate]);

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    if (hasMovedRef.current) {
      commitNearestDate();
    }
  };

  // Mouse wheel rotation over dial
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const delta = Math.sign(e.deltaY || e.deltaX);
    if (!delta) return;
    const curIdx = Math.round(phiRef.current / STEP_DEG);
    const nextIdx = Math.max(0, Math.min(timelineItems.length - 1, curIdx + delta));
    if (nextIdx !== curIdx) {
      animateTo(nextIdx * STEP_DEG, () => {
        const item = timelineItems[nextIdx];
        if (item) {
          playTick('close');
          try {
            trigger('light');
          } catch {}
          onSelectDate(item.id === 'all' ? null : item.id);
        }
      });
    }
  };

  // Direct click on tick or date label: snaps dial and switches date immediately
  const handleTickClick = (dateIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetAngle = dateIdx * STEP_DEG;
    animateTo(targetAngle, () => {
      const item = timelineItems[dateIdx];
      if (item) {
        playTick('close');
        try {
          trigger('light');
        } catch {}
        onSelectDate(item.id === 'all' ? null : item.id);
      }
    });
  };

  // Calculate visible ticks and date numbers along the arch
  const { visibleTicks, visibleDates } = useMemo(() => {
    const ticks = [];
    const dateMarks = [];
    const totalSubTicks = (timelineItems.length - 1) * 4;

    for (let j = 0; j <= totalSubTicks; j++) {
      const angleDeg = j * SUB_STEP_DEG - phi;
      // Only render ticks within the visible aperture [-46 deg, +46 deg]
      if (angleDeg >= -48 && angleDeg <= 48) {
        const isDate = j % 4 === 0;
        const dateIdx = j / 4;
        const theta = (angleDeg * Math.PI) / 180;
        const L = isDate ? 11 : 5.5;

        const rInner = R - L / 2;
        const rOuter = R + L / 2;
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);

        const x1 = CX + rInner * sin;
        const y1 = CY - rInner * cos;
        const x2 = CX + rOuter * sin;
        const y2 = CY - rOuter * cos;

        const isCenter = Math.abs(angleDeg) < 2.5;

        ticks.push({
          j,
          isDate,
          angleDeg,
          x1,
          y1,
          x2,
          y2,
          isCenter,
        });

        if (isDate) {
          const item = timelineItems[dateIdx];
          // Position label slightly below the tick mark along the radius
          const labelR = R - 14.5;
          const lx = CX + labelR * sin;
          const ly = CY - labelR * cos;
          dateMarks.push({
            dateIdx,
            item,
            angleDeg,
            lx,
            ly,
            isCenter,
          });
        }
      }
    }

    return { visibleTicks: ticks, visibleDates: dateMarks };
  }, [phi, timelineItems]);

  const nearestActiveIdx = Math.max(
    0,
    Math.min(timelineItems.length - 1, Math.round(phi / STEP_DEG))
  );
  const activeDateItem = timelineItems[nearestActiveIdx] || timelineItems[0];

  return (
    <div
      data-timeline-zone="true"
      role="slider"
      aria-label="Mechanical Timeline Escapement"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className={cn(
        'relative w-[320px] max-w-[92vw] h-[72px] select-none cursor-grab active:cursor-grabbing flex flex-col items-center justify-end touch-none',
        className
      )}
    >
      {/* 3D Cylindrical Odometer Rolling Date (Anchored in Upper Center) */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-center pointer-events-none z-30">
        <div className="flex items-center justify-center text-neutral-900 dark:text-white tracking-tight drop-shadow-sm select-none">
          <span
            ref={prefixRef}
            className="inline-flex items-center text-amber-500 font-mono text-[11px] sm:text-xs uppercase mr-1 tracking-wider font-semibold"
          >
            ALL{' '}
          </span>
          <span
            ref={reelRef}
            className="inline-flex items-center justify-center relative h-[1.35em] min-w-[1.6em] [perspective:3em] overflow-visible"
          >
            <span
              ref={digitRef}
              className="absolute inset-0 flex items-center justify-center leading-none origin-center [backface-visibility:hidden] will-change-transform text-neutral-900 dark:text-white font-mono text-sm sm:text-base font-bold"
            >
              FILMS
            </span>
          </span>
        </div>
      </div>

      {/* SVG Arched Rotary Timeline Dial (Pure mechanical tick marks, zero clutter) */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-full overflow-visible pointer-events-none z-10 text-neutral-900 dark:text-white"
      >
        <defs>
          <filter id="escapement-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Subtle Hairline Base Arch Track (Ultra-refined luxury guideline) */}
        <path
          d={`M ${CX - 130} 66 A ${R} ${R} 0 0 1 ${CX + 130} 66`}
          fill="none"
          stroke="currentColor"
          className="text-neutral-900/10 dark:text-white/10"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* Rotating Radial Ticks: Black on light mode, White on dark mode, Amber when centered */}
        {visibleTicks.map((t) => (
          <line
            key={`tick-${t.j}`}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="currentColor"
            className={
              t.isCenter
                ? 'text-amber-500'
                : t.isDate
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-900/25 dark:text-white/20'
            }
            strokeWidth={t.isCenter ? 2.2 : t.isDate ? 1.6 : 1}
            strokeLinecap="round"
          />
        ))}

        {/* Clean Day Numbers on Major Ticks: Dark on light mode, White on dark mode, Amber when centered */}
        {visibleDates.map((d) => (
          <text
            key={`date-lbl-${d.dateIdx}`}
            x={d.lx}
            y={d.ly}
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(${d.angleDeg * 0.75}, ${d.lx}, ${d.ly})`}
            fontSize="8"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
            letterSpacing="0.04em"
            onClick={(e) => handleTickClick(d.dateIdx, e)}
            className={cn(
              'pointer-events-auto cursor-pointer select-none transition-colors',
              d.isCenter
                ? 'fill-amber-500 font-bold'
                : 'fill-neutral-800 dark:fill-neutral-200 hover:fill-amber-500'
            )}
          >
            {d.item.rimLabel}
          </text>
        ))}

        {/* Fixed 12 O'Clock Dual Viewport Cursor (Peng Zheng Escapement Dual Bar) */}
        <line
          x1={CX - 1.5}
          y1={24}
          x2={CX - 1.5}
          y2={38}
          stroke="#f59e0b"
          strokeWidth="1.8"
          strokeLinecap="round"
          filter="url(#escapement-glow)"
        />
        <line
          x1={CX + 1.5}
          y1={24}
          x2={CX + 1.5}
          y2={38}
          stroke="#f59e0b"
          strokeWidth="1.8"
          strokeLinecap="round"
          filter="url(#escapement-glow)"
        />
      </svg>
    </div>
  );
}

export default MechanicalTimelineFilter;
