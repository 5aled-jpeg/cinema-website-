'use client';

import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Images,
  ArrowRight,
} from 'lucide-react';
import { TextReveal } from '@/components/velora/text-reveal';
import type { WorksWheelItem } from '@/registry/crafterui/ui/works-wheel';
import { cn } from '@/lib/utils';

export interface FilmModalViewProps {
  film: WorksWheelItem;
}

export function FilmModalView({ film }: FilmModalViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'screenings'>('overview');

  const screeningsCount = (film.screeningSlots?.length || film.screenings?.length || 0);

  return (
    <div className="w-full flex flex-col">
      {/* Refined Navigation Tab Bar (Apple HIG Segmented Control / Linear Style) */}
      <div className="px-5 sm:px-8 py-3.5 border-b border-[var(--color-border)] sticky top-0 z-20 bg-[var(--color-bg-base)]/95 backdrop-blur-xl flex items-center justify-between gap-4 transition-colors">
        <div className="inline-flex p-1 rounded-xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            data-cursor-interactive="true"
            data-cursor-label="Overview"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer",
              activeTab === 'overview'
                ? "bg-white dark:bg-neutral-800 text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Overview &amp; Stills</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('screenings')}
            data-cursor-interactive="true"
            data-cursor-label="Screenings"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer",
              activeTab === 'screenings'
                ? "bg-white dark:bg-neutral-800 text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <Film className="size-3.5 text-amber-500" />
            <span>Available Screenings</span>
            {screeningsCount > 0 && (
              <span className="ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-500 dark:text-amber-400">
                {screeningsCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick jump to screenings when in overview mode */}
        {activeTab === 'overview' && screeningsCount > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('screenings')}
            data-cursor-interactive="true"
            data-cursor-label="Showtimes"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all cursor-pointer"
          >
            <span>View Showtimes</span>
            <ArrowRight className="size-3" />
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="p-6 sm:p-8">
        {/* Tab 1: Overview & Film Images */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Curator Synopsis */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-500 font-mono block">
                Curator Synopsis
              </span>
              <TextReveal
                text={
                  film.synopsis ||
                  "A premier cinematic masterpiece restored for archival exhibition. Experience the vision with uncompressed reference sound and authentic theatrical presentation."
                }
                as="p"
                className="text-base sm:text-lg leading-relaxed text-[var(--color-text-secondary)] font-serif font-light block"
                stagger={0.02}
                animateOnMount
              />
            </div>

            {/* Film Images & Cinematography Stills Gallery (Seamlessly integrated into Overview) */}
            <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)] flex items-center gap-2">
                    <Images className="size-3.5 text-amber-500" />
                    <span>Film Stills &amp; Cinematography</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                    Official archival captures and cinematography frames from the exhibition print.
                  </p>
                </div>
                {film.stills && film.stills.length > 0 && (
                  <span className="text-xs font-mono text-[var(--color-text-tertiary)] hidden sm:inline">
                    {film.stills.length} Prints
                  </span>
                )}
              </div>

              {/* Stills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
                {film.stills && film.stills.length > 0 ? (
                  film.stills.map((still, idx) => (
                    <div
                      key={idx}
                      className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black/5 dark:bg-white/5 transition-all hover:border-amber-500/40 hover:shadow-lg"
                    >
                      <div
                        className={cn(
                          "overflow-hidden bg-neutral-900 flex items-center justify-center",
                          still.aspectRatio?.includes("2:3") || still.aspectRatio?.includes("Theatrical")
                            ? "aspect-[2/3] max-w-[280px] mx-auto"
                            : "aspect-[16/10]"
                        )}
                      >
                        <img
                          src={still.url}
                          alt={still.caption || `${film.title} Still ${idx + 1}`}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      {still.caption && (
                        <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-base)] flex items-center justify-between gap-2">
                          <span className="text-xs text-[var(--color-text-secondary)] font-medium line-clamp-1">
                            {still.caption}
                          </span>
                          {still.aspectRatio && (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[var(--color-text-tertiary)] shrink-0">
                              {still.aspectRatio}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  /* Fallback to main film artwork still */
                  <div className="col-span-full group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black/5 dark:bg-white/5">
                    <div className="aspect-[2/3] max-h-[440px] mx-auto overflow-hidden bg-neutral-900 flex items-center justify-center">
                      <img
                        src={film.image}
                        alt={film.title}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-base)] flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                        Theatrical Key Visual · {film.title}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">
                        Archival Master
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Next Screening Invitation Bar */}
            {film.screenings && film.screenings.length > 0 && (
              <div className="p-5 rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-500 font-mono block mb-1">
                    Next Available Screening
                  </span>
                  <p className="text-base font-semibold font-mono text-[var(--color-text-primary)]">
                    {film.screenings[0]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('screenings')}
                  data-cursor-interactive="true"
                  data-cursor-label="Showtimes"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>View All Showtimes</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Available Screenings & Showtimes */}
        {activeTab === 'screenings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-500 font-mono block mb-1">
                Showtimes &amp; Admissions
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
                Available Screenings
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                Seating is open admission upon door opening. Choose your preferred screening time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {film.screeningSlots && film.screeningSlots.length > 0 ? (
                film.screeningSlots.map((slot, idx) => {
                  const isFewLeft = slot.availability === 'Few Seats Left';
                  const isFast = slot.availability === 'Selling Fast';

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-[var(--color-border)] bg-black/[0.015] dark:bg-white/[0.025] hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
                            {slot.time}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-semibold",
                              isFewLeft
                                ? "bg-red-500/15 text-red-500 border border-red-500/30"
                                : isFast
                                ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                            )}
                          >
                            {slot.availability}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                          {slot.date}
                        </p>
                        <div className="pt-2 border-t border-[var(--color-border)] text-xs font-mono space-y-1 text-[var(--color-text-tertiary)]">
                          <div className="flex items-center justify-between">
                            <span>Auditorium</span>
                            <span className="font-semibold text-[var(--color-text-primary)]">
                              {slot.auditorium}
                            </span>
                          </div>
                          {slot.format && (
                            <div className="flex items-center justify-between">
                              <span>Presentation</span>
                              <span className="text-amber-500 font-semibold">{slot.format}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full py-2 px-3 rounded-xl text-center text-[11px] font-mono font-medium border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] text-[var(--color-text-secondary)]">
                        Doors open 20m before showtime
                      </div>
                    </div>
                  );
                })
              ) : film.screenings && film.screenings.length > 0 ? (
                film.screenings.map((screening, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-[var(--color-border)] bg-black/[0.015] dark:bg-white/[0.025] hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="text-lg font-bold font-mono text-[var(--color-text-primary)]">
                        {screening}
                      </span>
                      <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                        Main Auditorium · Open Admission
                      </p>
                    </div>
                    <div className="w-full py-1.5 px-3 rounded-xl text-center text-[11px] font-mono border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] text-[var(--color-text-secondary)]">
                      Available Today
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-sm text-[var(--color-text-secondary)] font-mono">
                  Upcoming screening schedule updating shortly.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilmModalView;
