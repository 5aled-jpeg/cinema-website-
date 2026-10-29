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

  // Web Haptics for Mobile & Vibrating Devices (iOS / Android)
  const { trigger } = useWebHaptics();

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const lastHoveredIdxRef = useRef<number>(-1);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // DOM Refs
  const zoneRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefixRef = useRef<HTMLSpanElement>(null);
  const reelRef = useRef<HTMLSpanElement>(null);
  const digitRef = useRef<HTMLSpanElement>(null);
  const lastDateTextRef = useRef<string>('');

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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } catch {}
  }, []);

  const generateAudioSample = useCallback((sampleRate: number, pitch = 1.0, decay = 1.0) => {
    const len = Math.round(sampleRate * 0.045);
    const buf = new Float32Array(len);
    const f1 = 5200 * pitch;
    const f2 = 7400 * pitch;
    let y1 = 0, y2 = 0, v1 = 0, v2 = 0;
    const w1 = (2 * Math.PI * f1) / sampleRate;
    const w2 = (2 * Math.PI * f2) / sampleRate;
    const d1 = Math.exp((-320 * decay) / sampleRate);
    const d2 = Math.exp((-480 * decay) / sampleRate);
    let hp = 0;
    let peak = 0;

    for (let i = 0; i < len; i++) {
      const noise = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.0035));
      const impulse = i === 0 ? 1.0 : (i === 3 ? -0.4 : 0);
      const input = impulse + noise * 0.45;

      v1 = v1 * d1 + (input - y1) * w1;
      y1 += v1 * w1;
      v2 = v2 * d2 + (input - y2) * w2;
      y2 += v2 * w2;

      hp = 0.85 * (hp + input);
      const s = y1 * 0.6 + y2 * 0.4 + hp * 0.15;
      buf[i] = s;
      if (Math.abs(s) > peak) peak = Math.abs(s);
    }

    const fade = Math.round(sampleRate * 0.005);
    for (let i = 0; i < fade; i++) {
      buf[len - 1 - i] *= i / fade;
    }
    for (let i = 0; i < len; i++) {
      buf[i] /= peak || 1;
    }
    return buf;
  }, []);

  const playTick = useCallback(
    (type: 'fine' | 'line' | 'travel' | 'close' = 'fine') => {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state !== 'running') return;

      const profiles = {
        fine: { pitch: 1.0, decay: 0.5, level: 0.28 },
        line: { pitch: 0.9, decay: 0.7, level: 0.35 },
        travel: { pitch: 1.1, decay: 0.6, level: 0.32 },
        close: { pitch: 1.2, decay: 0.85, level: 0.4 },
      };

      const profile = profiles[type] || profiles.fine;
      if (!audioBuffersRef.current[type]) {
        const raw = generateAudioSample(ctx.sampleRate, profile.pitch, profile.decay);
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
    [initAudio, generateAudioSample]
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
        { transform: 'perspective(3em) translateZ(-0.54em) rotateX(0deg) translateZ(0.54em)', opacity: '1' },
        { transform: `perspective(3em) translateZ(-0.54em) rotateX(${rollDir * 64}deg) translateZ(0.54em)`, opacity: '0' },
      ],
      { duration: dur, easing, fill: 'forwards' }
    ).finished.then(() => ghost.remove()).catch(() => ghost.remove());

    digitRef.current.animate(
      [
        { transform: `perspective(3em) translateZ(-0.54em) rotateX(${-rollDir * 64}deg) translateZ(0.54em)`, opacity: '0' },
        { transform: 'perspective(3em) translateZ(-0.54em) rotateX(0deg) translateZ(0.54em)', opacity: '1' },
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

  // Compute tick and item at pointer position
  const getItemAtClientX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return null;
      const rect = trackRef.current.getBoundingClientRect();
      const offset = clientX - rect.left;
      const rawPct = Math.max(0, Math.min(1, offset / rect.width));
      const tickIdx = Math.round(rawPct * (totalTicks - 1));
      const pct = (tickIdx / (totalTicks - 1)) * 100;
      const itemIdx = Math.round((tickIdx / (totalTicks - 1)) * (timelineItems.length - 1));
      const item = timelineItems[itemIdx] || timelineItems[0];
      return { tickIdx, pct, itemIdx, item };
    },
    [totalTicks, timelineItems]
  );

  // Update hover preview (NO SWITCH on hover — only visual preview & audio tick)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setIsDialActive(true);

    const info = getItemAtClientX(e.clientX);
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

      // Preview date in odometer label ONLY — NEVER switch on hover
      setDateWithOdometer(info.item.label, dir);

      // If user is actively dragging/scrubbing with mouse button held down, commit date
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

    const info = getItemAtClientX(e.clientX);
    if (info) {
      setHoverPositionPct(info.pct);
      setCursorPositionPct(info.pct);
      lastHoveredIdxRef.current = info.tickIdx;
      playTick('line');
      try {
        trigger('light');
      } catch {}
      setDateWithOdometer(info.item.label, 0);

      // SWITCH IS EXCLUSIVELY ON CLICK / DRAG!
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

    if (zoneRef.current) {
      const r = zoneRef.current.getBoundingClientRect();
      const inside =
        e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 15 && e.clientY <= r.bottom + 15;
      if (!inside) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsDialActive(false);
          const cur = selectedDate ? timelineItems.find((it) => it.id === selectedDate) : timelineItems[0];
          if (cur) setDateWithOdometer(cur.label, 0);
        }, 250);
      }
    }
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsDialActive(false);
        const cur = selectedDate ? timelineItems.find((it) => it.id === selectedDate) : timelineItems[0];
        if (cur) setDateWithOdometer(cur.label, 0);
      }, 350);
    }
  };

  return (
    <div
      ref={zoneRef}
      role="slider"
      aria-label="Mechanical Escapement Timeline Filter"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className={cn(
        'relative w-full max-w-md mx-auto h-11 flex flex-col justify-end pb-2 cursor-pointer select-none',
        className
      )}
    >
      <div ref={trackRef} className="relative w-full h-5">
        {/* Static Background Ruler Ticks */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: totalTicks }).map((_, i) => {
            const isMajor = i % majorInterval === 0;
            const pct = (i / (totalTicks - 1)) * 100;
            return (
              <div
                key={i}
                className={cn(
                  'absolute bottom-0 -translate-x-1/2 rounded-full transition-colors duration-200',
                  isMajor ? 'w-[1.5px] h-3.5 bg-white/45' : 'w-[1px] h-2 bg-white/20'
                )}
                style={{ left: `${pct}%` }}
              />
            );
          })}
        </div>

        {/* Active Viewport Dual Ticks (| |) representing committed date */}
        <div
          className="absolute bottom-0 flex gap-[2.5px] -translate-x-1/2 pointer-events-none z-10 transition-[left] duration-150 ease-out"
          style={{ left: `${cursorPositionPct}%` }}
        >
          <div className="w-[2px] h-4 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
          <div className="w-[2px] h-4 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
        </div>

        {/* Vibrant Amber/Gold Scrub Indicator Tick */}
        <div
          className={cn(
            'absolute bottom-0 w-[2px] h-5 bg-amber-500 rounded-full -translate-x-1/2 pointer-events-none z-20 shadow-[0_0_8px_rgba(245,158,11,0.85)] transition-opacity duration-150',
            isDialActive ? 'opacity-100' : 'opacity-0'
          )}
          style={{ left: `${hoverPositionPct}%` }}
        />

        {/* Floating 3D Cylindrical Odometer Typography Directly Above the Amber Tick */}
        <div
          className={cn(
            'absolute bottom-6 -translate-x-1/2 text-white font-serif text-sm font-semibold tracking-tight whitespace-pre pointer-events-none z-30 transition-opacity duration-150 flex items-baseline drop-shadow-md select-none',
            isDialActive ? 'opacity-100' : 'opacity-0'
          )}
          style={{ left: `${hoverPositionPct}%` }}
        >
          <span ref={prefixRef} className="inline-block text-amber-400 font-mono text-xs uppercase mr-0.5">
            OCT{' '}
          </span>
          <span
            ref={reelRef}
            className="inline-block relative h-[1.3em] min-w-[1.6em] align-baseline [perspective:3em] overflow-visible"
          >
            <span
              ref={digitRef}
              className="absolute inset-0 leading-tight origin-center [backface-visibility:hidden] will-change-transform text-white font-mono text-xs font-bold"
            >
              19
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
