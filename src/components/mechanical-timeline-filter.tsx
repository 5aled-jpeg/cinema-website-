'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Volume2, VolumeX, Sparkles, Calendar } from 'lucide-react';
import { useWebHaptics } from 'web-haptics/react';
import { cn } from '@/lib/utils';

export interface TimelineDateItem {
  id: string; // e.g. "2026-09-28" or "all"
  label: string; // e.g. "Sep 28" or "All Films"
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
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [isDialActive, setIsDialActive] = useState<boolean>(false);
  const [hoverPositionPct, setHoverPositionPct] = useState<number>(0);
  const [cursorPositionPct, setCursorPositionPct] = useState<number>(100);

  // Web Haptics for Mobile & Vibrating Devices (iOS / Android)
  const { trigger } = useWebHaptics();

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const lastHoveredIdxRef = useRef<number>(-1);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        label: 'ALL DATES',
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
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    } catch {}
  }, [soundEnabled]);

  // Audio sample generator reproducing Swiss watch escapement clicks
  const generateAudioSample = useCallback((sampleRate: number, pitch = 1, decay = 1) => {
    const len = Math.round(sampleRate * 0.04 * Math.max(1, decay));
    const buf = new Float32Array(len);
    const hp = 4000;
    const a = (2 * Math.PI * hp * pitch) / sampleRate;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a) / 1.414;
    const [c, l, u] = [(1 + cosA) / 2, -(1 + cosA), (1 + cosA) / 2];
    const [d, f, p] = [1 + sinA, -2 * cosA, 1 - sinA];
    let m = 0,
      h = 0,
      vVal = 0,
      yVal = 0,
      peak = 0;

    const G: [number, number, number][] = [
      [5200, 0.8, 0.6],
      [7400, 0.5, 0.4],
    ];

    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      const noise = Math.random() * 2 - 1;
      const filtered = (c * noise + l * m + u * h - f * vVal - p * yVal) / d;
      h = m;
      m = noise;
      yVal = vVal;
      vVal = filtered;

      let s = 0.12 * filtered * Math.exp(-t / ((0.25 * decay) / 1000)) * 3;
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
  }, []);

  const playTick = useCallback(
    (type: 'fine' | 'line' | 'travel' | 'close' = 'fine') => {
      if (!soundEnabled) return;
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
    [soundEnabled, initAudio, generateAudioSample]
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

    // Old digit rolls away
    ghost.animate(
      [
        { transform: 'perspective(3em) translateZ(-0.54em) rotateX(0deg) translateZ(0.54em)', opacity: '1' },
        { transform: `perspective(3em) translateZ(-0.54em) rotateX(${rollDir * 64}deg) translateZ(0.54em)`, opacity: '0' },
      ],
      { duration: dur, easing, fill: 'forwards' }
    ).finished.then(() => ghost.remove()).catch(() => ghost.remove());

    // New digit rolls in
    digitRef.current.animate(
      [
        { transform: `perspective(3em) translateZ(-0.54em) rotateX(${-rollDir * 64}deg) translateZ(0.54em)`, opacity: '0' },
        { transform: 'perspective(3em) translateZ(-0.54em) rotateX(0deg) translateZ(0.54em)', opacity: '1' },
      ],
      { duration: dur, easing, fill: 'forwards' }
    );
  }, []);

  // Update position from pointer (mouse/touch)
  const updateFromPointer = useCallback(
    (clientX: number, isDrag = false) => {
      if (!trackRef.current) return;
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      setIsDialActive(true);

      const rect = trackRef.current.getBoundingClientRect();
      const offset = clientX - rect.left;
      const rawPct = Math.max(0, Math.min(1, offset / rect.width));

      // Snap to nearest tick
      const tickIdx = Math.round(rawPct * (totalTicks - 1));
      const pct = (tickIdx / (totalTicks - 1)) * 100;

      setHoverPositionPct(pct);

      if (tickIdx !== lastHoveredIdxRef.current) {
        const dir = tickIdx > lastHoveredIdxRef.current ? 1 : -1;
        lastHoveredIdxRef.current = tickIdx;
        const isMajor = tickIdx % majorInterval === 0;
        playTick(isMajor ? 'line' : 'fine');
        try {
          trigger(isMajor ? 'medium' : 'selection');
        } catch {}

        // Map tick to date item
        const itemIdx = Math.round((tickIdx / (totalTicks - 1)) * (timelineItems.length - 1));
        const item = timelineItems[itemIdx];
        if (item) {
          setDateWithOdometer(item.label, dir);
          const dateParam = item.id === 'all' ? null : item.id;
          onSelectDate(dateParam);
        }
      }

      if (isDrag) {
        setCursorPositionPct(pct);
      }
    },
    [totalTicks, timelineItems, playTick, trigger, setDateWithOdometer, onSelectDate]
  );

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

  // Pointer event listeners
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsScrubbing(true);
    playTick('line');
    try {
      trigger('light');
    } catch {}
    updateFromPointer(e.clientX, true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      updateFromPointer(e.clientX, true);
    } else {
      updateFromPointer(e.clientX, false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    setIsScrubbing(false);
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
        e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 20 && e.clientY <= r.bottom + 20;
      if (!inside) {
        setIsDialActive(false);
      }
    }
  };

  const handlePointerLeave = () => {
    if (!isScrubbing) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsDialActive(false);
      }, 300);
    }
  };

  // Mouse wheel support over timeline
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const delta = Math.sign(e.deltaY || e.deltaX);
    if (!delta) return;

    let curIdx = selectedDate ? timelineItems.findIndex((it) => it.id === selectedDate) : 0;
    if (curIdx === -1) curIdx = 0;
    const nextIdx = Math.max(0, Math.min(timelineItems.length - 1, curIdx + delta));
    if (nextIdx !== curIdx) {
      const item = timelineItems[nextIdx];
      const dateParam = item.id === 'all' ? null : item.id;
      playTick(delta > 0 ? 'travel' : 'fine');
      try {
        trigger('selection');
      } catch {}
      onSelectDate(dateParam);
    }
  };

  const activeItem = useMemo(() => {
    if (!selectedDate) return timelineItems[0];
    return timelineItems.find((it) => it.id === selectedDate) || timelineItems[0];
  }, [selectedDate, timelineItems]);

  return (
    <div
      className={cn(
        'relative w-full max-w-2xl mx-auto flex flex-col items-center select-none font-sans',
        className
      )}
    >
      {/* Top Floating Feedback HUD Bar */}
      <div className="w-full flex items-center justify-between px-2 mb-2 text-xs font-mono">
        {/* Selected Date Readout Badge */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider text-neutral-300 font-semibold font-mono">
            {activeItem?.fullFormatted || 'All Theatrical Screenings'}
          </span>
          {activeItem?.count !== undefined && activeItem.count > 0 && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
              {activeItem.count} {activeItem.count === 1 ? 'Showtime' : 'Showtimes'}
            </span>
          )}
        </div>

        {/* Right Controls: Sound Toggle & Quick Reset */}
        <div className="flex items-center gap-2">
          {selectedDate && (
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className="text-[10px] uppercase tracking-wider text-amber-400/80 hover:text-amber-300 px-2 py-0.5 rounded border border-amber-500/20 hover:border-amber-500/40 transition-colors"
            >
              Reset to All
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSoundEnabled((prev) => !prev);
              initAudio();
            }}
            title={soundEnabled ? 'Mechanical Sound: On' : 'Mechanical Sound: Off'}
            className={cn(
              'p-1.5 rounded-full border transition-all duration-200 cursor-pointer',
              soundEnabled
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
            )}
          >
            {soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Mechanical Timeline Dial Container */}
      <div
        ref={zoneRef}
        role="slider"
        aria-label="Mechanical Escapement Timeline Filter"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onWheel={handleWheel}
        className={cn(
          'relative w-full h-14 rounded-2xl bg-black/60 dark:bg-[#0c0d10]/80 border border-white/10 backdrop-blur-xl px-5 flex flex-col justify-end pb-3 cursor-grab active:cursor-grabbing shadow-[0_12px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] group transition-all duration-300',
          isDialActive && 'border-amber-500/30 shadow-[0_12px_36px_rgba(245,158,11,0.12)]'
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

          {/* Active Viewport Dual Ticks (| |) */}
          <div
            className="absolute bottom-0 flex gap-[2.5px] -translate-x-1/2 pointer-events-none z-10 transition-[left] duration-75"
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

          {/* Floating 3D Cylindrical Odometer Typography Directly Above the Orange Tick */}
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

      {/* Subtle Hint Below Ruler */}
      <div className="mt-1.5 flex items-center justify-between w-full px-2 text-[10px] font-mono text-neutral-400">
        <span>← EARLIER DATES</span>
        <span className="text-amber-500/80 uppercase tracking-widest flex items-center gap-1">
          <Calendar className="size-2.5" />
          <span>DRAG RULER TO FILTER SCREENINGS</span>
        </span>
        <span>LATER DATES →</span>
      </div>
    </div>
  );
}

export default MechanicalTimelineFilter;
