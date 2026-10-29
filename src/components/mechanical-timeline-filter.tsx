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

// Exact Swiss Escapement Synthesizer from Peng Zheng's portfolio
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
  const SVG_W = 340;
  const SVG_H = 100;
  const CX = 170;
  const R = 260;
  const CY = 292; // Apex at (170, 32)
  const STEP_DEG = 14; // Degrees between date markers
  const SUB_STEP_DEG = 3.5; // Degrees between minor ticks (4 intervals per date)

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

    const dur = 220;
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

  // Update odometer when nearest item changes
  const checkTickCrossed = useCallback(
    (currentAngle: number) => {
      // Each sub-tick is SUB_STEP_DEG
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
        if (Math.abs(diff) < 0.1) {
          setPhi(targetPhi.current);
          phiRef.current = targetPhi.current;
          checkTickCrossed(targetPhi.current);
          onComplete?.();
        } else {
          const next = current + diff * 0.22;
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
    startPointerX.current = e.clientX;
    startPhi.current = phiRef.current;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startPointerX.current;
    // Dragging left moves to later dates; dragging right moves to earlier dates
    const angleDelta = -(deltaX / (R * 0.75)) * (180 / Math.PI);
    const nextPhi = Math.max(-5, Math.min(maxPhi + 5, startPhi.current + angleDelta));
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
    commitNearestDate();
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

  // Click direct date marker on wheel to rotate to it
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

  // Calculate visible rotating ticks and date marks along the arch
  const { visibleTicks, visibleDates } = useMemo(() => {
    const ticks = [];
    const dateMarks = [];
    const totalSubTicks = (timelineItems.length - 1) * 4;

    for (let j = 0; j <= totalSubTicks; j++) {
      const angleDeg = j * SUB_STEP_DEG - phi;
      // Only render ticks within the visible arch aperture [-50 deg, +50 deg]
      if (angleDeg >= -52 && angleDeg <= 52) {
        const isDate = j % 4 === 0;
        const dateIdx = j / 4;
        const theta = (angleDeg * Math.PI) / 180;
        const L = isDate ? 13 : 6.5;

        const rInner = R - L / 2;
        const rOuter = R + L / 2;
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);

        const x1 = CX + rInner * sin;
        const y1 = CY - rInner * cos;
        const x2 = CX + rOuter * sin;
        const y2 = CY - rOuter * cos;

        const isCenter = Math.abs(angleDeg) < 3.5;

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
          // Position label slightly inside the rim
          const labelR = R - 18;
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
      aria-label="Rotary Timeline Wheel"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className={cn(
        'relative w-[340px] max-w-[94vw] h-[105px] select-none cursor-grab active:cursor-grabbing flex flex-col items-center justify-end touch-none',
        className
      )}
    >
      {/* 3D Cylindrical Odometer Rolling Date (Anchored in Upper Center) */}
      <div className="absolute top-[2px] inset-x-0 flex flex-col items-center justify-center pointer-events-none z-30">
        <div className="flex items-baseline text-white font-serif tracking-tight drop-shadow-md select-none">
          <span
            ref={prefixRef}
            className="inline-block text-amber-400 font-mono text-[11px] sm:text-xs uppercase mr-0.5 tracking-wider font-semibold"
          >
            ALL{' '}
          </span>
          <span
            ref={reelRef}
            className="inline-block relative h-[1.3em] min-w-[1.6em] align-baseline [perspective:3em] overflow-visible"
          >
            <span
              ref={digitRef}
              className="absolute inset-0 leading-tight origin-center [backface-visibility:hidden] will-change-transform text-white font-mono text-sm sm:text-base font-bold"
            >
              FILMS
            </span>
          </span>
        </div>

        {/* Selected Status Indicator */}
        <span className="text-[8.5px] font-mono tracking-[0.2em] uppercase text-neutral-400/80 -mt-0.5">
          {activeDateItem?.count !== undefined && activeDateItem.count > 0
            ? `${activeDateItem.count} Showtimes`
            : activeDateItem?.fullFormatted || 'All Theatrical Screenings'}
        </span>
      </div>

      {/* SVG Arched Rotating Timeline Dial (curves upward like Image 3) */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-full overflow-visible pointer-events-none z-10"
      >
        <defs>
          <filter id="rotary-amber-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Circular Rim Arc (Gold/Amber Arched Crest matching Image 3) */}
        <path
          d={`M ${CX - 150} 78 A ${R} ${R} 0 0 1 ${CX + 150} 78`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.8"
          strokeOpacity="0.85"
        />

        {/* Rotating Radial Ticks */}
        {visibleTicks.map((t) => (
          <line
            key={`tick-${t.j}`}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={
              t.isCenter
                ? '#f59e0b'
                : t.isDate
                ? '#ffffff'
                : 'rgba(255, 255, 255, 0.35)'
            }
            strokeWidth={t.isCenter ? 2.2 : t.isDate ? 1.7 : 1}
            strokeLinecap="round"
          />
        ))}

        {/* Rotating Date Labels along Rim */}
        {visibleDates.map((d) => (
          <text
            key={`date-lbl-${d.dateIdx}`}
            x={d.lx}
            y={d.ly}
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(${d.angleDeg}, ${d.lx}, ${d.ly})`}
            fill={d.isCenter ? '#f59e0b' : 'rgba(255, 255, 255, 0.65)'}
            fontSize="8.5"
            fontFamily="monospace"
            fontWeight={d.isCenter ? 'bold' : 'normal'}
            letterSpacing="0.05em"
            onClick={(e) => handleTickClick(d.dateIdx, e)}
            className="pointer-events-auto cursor-pointer hover:fill-amber-400 select-none"
          >
            {d.item.label}
          </text>
        ))}

        {/* Fixed 12 O'Clock Center Apex Needle (The Anchor Marker) */}
        <line
          x1={CX}
          y1={24}
          x2={CX}
          y2={40}
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#rotary-amber-glow)"
        />
        <circle cx={CX} cy={22} r={2} fill="#f59e0b" filter="url(#rotary-amber-glow)" />
      </svg>
    </div>
  );
}

export default MechanicalTimelineFilter;
