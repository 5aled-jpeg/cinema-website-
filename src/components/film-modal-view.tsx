'use client';

import React, { useState } from 'react';
import {
  Film,
  Star,
  Ticket,
  Clock,
  Sparkles,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { TextReveal } from '@/components/velora/text-reveal';
import type { WorksWheelItem } from '@/registry/crafterui/ui/works-wheel';

export interface FilmModalViewProps {
  film: WorksWheelItem;
}

export function FilmModalView({ film }: FilmModalViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stills' | 'reviews' | 'screenings'>('overview');

  return (
    <div className="w-full flex flex-col">
      {/* Navigation Tabs (Apple HIG Segmented Control / Linear Style) */}
      <div className="px-6 pt-4 pb-3 border-b border-[var(--color-border)] sticky top-0 z-20 bg-[var(--color-bg-base)]/90 backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-xl bg-neutral-200/70 dark:bg-neutral-900/80 border border-black/5 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-neutral-800 text-[var(--color-text-primary)] shadow-xs'
                : 'text-neutral-500 hover:text-[var(--color-text-primary)]'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stills')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'stills'
                ? 'bg-white dark:bg-neutral-800 text-[var(--color-text-primary)] shadow-xs'
                : 'text-neutral-500 hover:text-[var(--color-text-primary)]'
            }`}
          >
            Film Stills
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-white dark:bg-neutral-800 text-[var(--color-text-primary)] shadow-xs'
                : 'text-neutral-500 hover:text-[var(--color-text-primary)]'
            }`}
          >
            Reviews
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('screenings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'screenings'
                ? 'bg-white dark:bg-neutral-800 text-[var(--color-text-primary)] shadow-xs'
                : 'text-neutral-500 hover:text-[var(--color-text-primary)]'
            }`}
          >
            Screenings
          </button>
        </div>

        {/* Quick View Screenings Trigger */}
        <button
          type="button"
          onClick={() => setActiveTab('screenings')}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
        >
          <Film className="size-3.5" />
          View Screenings
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6 sm:p-8">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)]">
                Curator Synopsis
              </h3>
              <TextReveal
                text={film.synopsis || "A premier cinematic masterpiece restored for archival exhibition. Experience the vision with uncompressed sound and reference-grade projection master."}
                as="p"
                className="text-base sm:text-lg leading-relaxed text-[var(--color-text-secondary)] font-serif font-light block"
                stagger={0.02}
                animateOnMount
              />
            </div>

            {/* Technical Specifications Grid */}
            <div className="pt-6 border-t border-[var(--color-border)]">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)] mb-4">
                Exhibition Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04]">
                  <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] uppercase block mb-1">
                    Projection
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] font-mono">
                    {film.specs?.format || "Theatrical Presentation"}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04]">
                  <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] uppercase block mb-1">
                    Aspect Ratio
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] font-mono">
                    {film.specs?.aspectRatio || "2.39:1 Anamorphic"}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04]">
                  <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] uppercase block mb-1">
                    Sound System
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] font-mono">
                    {film.specs?.sound || "Dolby Atmos 64ch"}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04]">
                  <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] uppercase block mb-1">
                    Color Process
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] font-mono">
                    {film.specs?.color || "Master Grade"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Screening Bar */}
            {film.screenings && film.screenings.length > 0 && (
              <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-500 block mb-1">
                    Next Available Screening
                  </span>
                  <p className="text-base font-medium font-mono text-[var(--color-text-primary)]">
                    {film.screenings[0]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('screenings')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  View All Showtimes →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Photos from the films / Film Stills */}
        {activeTab === 'stills' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)] mb-1">
                Archival & Production Stills
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Exclusive high-resolution cinematography captures from the archival presentation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {film.stills && film.stills.length > 0 ? (
                film.stills.map((still, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black/10 dark:bg-white/5"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={still.url}
                        alt={still.caption || `${film.title} Still ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    {still.caption && (
                      <div className="p-3.5 border-t border-[var(--color-border)] bg-[var(--color-bg-base)] flex items-center justify-between gap-2">
                        <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                          {still.caption}
                        </span>
                        {still.aspectRatio && (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[var(--color-text-tertiary)]">
                            {still.aspectRatio}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-12 text-center text-sm text-[var(--color-text-secondary)]">
                  Stills gallery being processed from archival projection reels.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)] mb-1">
                Critical Acclaim
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Selected review excerpts from international film festivals and leading critics.
              </p>
            </div>

            <div className="space-y-4">
              {film.reviews && film.reviews.length > 0 ? (
                film.reviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-[var(--color-border)] bg-black/[0.015] dark:bg-white/[0.025] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {rev.critic}
                        </span>
                        <span className="text-xs text-[var(--color-text-tertiary)]">
                          · {rev.publication}
                        </span>
                      </div>
                      {rev.rating && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {rev.rating}
                        </span>
                      )}
                    </div>
                    <blockquote className="text-sm sm:text-base leading-relaxed text-[var(--color-text-secondary)] italic font-serif">
                      &ldquo;{rev.quote}&rdquo;
                    </blockquote>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                  Reviews embargo lifts on festival screening opening night.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Upcoming Screenings & Booking */}
        {activeTab === 'screenings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)] mb-1">
                Available Screenings & Showtimes
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Programmed archival prints and laser master projections. Seating is open admission upon door opening.
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
                      className="p-5 rounded-2xl border border-[var(--color-border)] bg-black/[0.015] dark:bg-white/[0.025] hover:border-black/20 dark:hover:border-white/20 transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
                            {slot.time}
                          </span>
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold ${
                              isFewLeft
                                ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                                : isFast
                                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                            }`}
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
                          <div className="flex items-center justify-between">
                            <span>Format</span>
                            <span className="text-amber-500 font-semibold">{slot.format}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full py-2 px-3 rounded-xl text-center text-[11px] font-mono font-medium border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] text-[var(--color-text-secondary)]">
                        Doors open 20m before showtime
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-sm text-[var(--color-text-secondary)]">
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
