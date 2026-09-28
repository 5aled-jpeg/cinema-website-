'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContainer,
  DialogContent,
  DialogDescription,
  DialogImage,
  DialogTitle,
} from '@/components/ui/linear-modal';
import {
  Calendar,
  Clock,
  Film,
  Sparkles,
  Star,
  Ticket,
  Volume2,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import type { WorksWheelItem } from '@/registry/crafterui/ui/works-wheel';

export interface FilmDetailsModalProps {
  film: WorksWheelItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FilmDetailsModal({
  film,
  isOpen,
  onClose,
}: FilmDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stills' | 'reviews' | 'screenings'>('overview');
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  if (!film) return null;

  const handleBooking = (slotStr: string) => {
    setBookedSlot(slotStr);
    setTimeout(() => {
      setBookedSlot(null);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContainer
        className="w-full max-w-4xl px-4 sm:px-6"
        overlayClassName="bg-black/75 dark:bg-black/85 backdrop-blur-2xl"
      >
        <DialogContent
          style={{ borderRadius: '24px' }}
          className="relative flex flex-col w-full max-h-[88vh] overflow-hidden rounded-[24px] border border-black/10 dark:border-white/12 bg-[var(--color-bg-base)] text-[var(--color-text-primary)] shadow-2xl transition-colors"
        >
          {/* Top Close Button with Esc Hint */}
          <div className="absolute right-5 top-5 z-30 flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-medium border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 text-neutral-500 dark:text-neutral-400">
              ESC
            </span>
            <DialogClose className="static size-8.5 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl text-neutral-800 dark:text-neutral-200 hover:scale-105 active:scale-95 transition-all" />
          </div>

          {/* Scrollable Container */}
          <div className="overflow-y-auto w-full h-full overscroll-contain">
            {/* Header Hero Banner with Film Poster / Image */}
            <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden bg-neutral-900">
              <DialogImage
                src={film.image}
                alt={film.title}
                className="w-full h-full object-cover object-center transform scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-base)]/60 via-transparent to-transparent" />

              {/* Badges on Top-Left */}
              <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-2">
                {film.category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-black/40 dark:bg-white/10 backdrop-blur-md text-white border border-white/20">
                    <Film className="size-3 text-amber-400" />
                    {film.category.split('·')[0].trim()}
                  </span>
                )}
                {film.imdbRating && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 backdrop-blur-md text-amber-500 border border-amber-500/30">
                    <Star className="size-3 fill-amber-500" />
                    {film.imdbRating}
                  </span>
                )}
                {film.specs?.format && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/20 backdrop-blur-md text-emerald-400 border border-emerald-500/30 uppercase">
                    {film.specs.format}
                  </span>
                )}
              </div>

              {/* Bottom Title & Tagline in Hero Header */}
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <DialogTitle className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-[var(--color-text-primary)]">
                  {film.title}
                </DialogTitle>
                {film.tagline && (
                  <p className="mt-2 text-sm sm:text-base italic text-neutral-600 dark:text-neutral-400 font-serif">
                    &ldquo;{film.tagline}&rdquo;
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm font-mono text-[var(--color-text-secondary)]">
                  {film.director && (
                    <span>
                      Directed by <strong className="text-[var(--color-text-primary)] font-semibold">{film.director}</strong>
                    </span>
                  )}
                  {film.year && <span>· {film.year}</span>}
                  {film.duration && <span>· {film.duration}</span>}
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Apple HIG Segmented Control / Linear Style) */}
            <div className="px-6 pt-5 pb-3 border-b border-[var(--color-border)] sticky top-0 z-20 bg-[var(--color-bg-base)]/90 backdrop-blur-xl flex items-center justify-between gap-4">
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

              {/* Book Tickets Quick Trigger */}
              <button
                type="button"
                onClick={() => setActiveTab('screenings')}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                <Ticket className="size-3.5" />
                Reserve Seats
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 sm:p-8">
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  <DialogDescription>
                    <div className="space-y-4">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)]">
                        Curator Synopsis
                      </h3>
                      <p className="text-base sm:text-lg leading-relaxed text-[var(--color-text-secondary)] font-serif font-light">
                        {film.synopsis ||
                          "A premier cinematic masterpiece restored for archival exhibition. Experience the vision with uncompressed sound and reference-grade projection master."}
                      </p>
                    </div>
                  </DialogDescription>

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
                          {film.specs?.format || "70mm / 4K Laser"}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04]">
                        <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] uppercase block mb-1">
                          Aspect Ratio
                        </span>
                        <span className="text-sm font-semibold text-[var(--color-text-primary)] font-mono">
                          {film.specs?.aspectRatio || "1.85:1 Academy"}
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
                          {film.specs?.color || "Technicolor 4K HDR"}
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
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
                      >
                        View All Showtimes →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Film Stills Gallery */}
              {activeTab === 'stills' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)]">
                      Archival Stills &amp; Cinematography
                    </h3>
                    <span className="text-xs font-mono text-[var(--color-text-tertiary)]">
                      {(film.stills?.length || 1) + 1} Stills Captured
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary Still */}
                    <div className="group relative rounded-2xl overflow-hidden border border-[var(--color-border)] bg-neutral-900 aspect-video shadow-md">
                      <img
                        src={film.image}
                        alt="Primary Exhibition Still"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                        <span className="text-xs font-mono text-white font-medium">
                          Master Exhibition Print Still · {film.specs?.aspectRatio || '1.85:1'}
                        </span>
                      </div>
                    </div>

                    {/* Secondary Stills */}
                    {film.stills && film.stills.length > 0 ? (
                      film.stills.map((still, idx) => (
                        <div
                          key={idx}
                          className="group relative rounded-2xl overflow-hidden border border-[var(--color-border)] bg-neutral-900 aspect-video shadow-md"
                        >
                          <img
                            src={still.url}
                            alt={still.caption || `Still ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                            <span className="text-xs font-mono text-white font-medium">
                              {still.caption || `Production Still #${idx + 2}`} {still.aspectRatio && `· ${still.aspectRatio}`}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 flex flex-col items-center justify-center text-center text-neutral-500">
                        <Film className="size-8 mb-2 opacity-50" />
                        <p className="text-xs font-mono">Additional 70mm archival frame scans loaded during physical screening.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)]">
                      Critical Consensus &amp; Acclaim
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-amber-500 font-semibold">
                      <Star className="size-3.5 fill-amber-500" />
                      Certified Masterpiece
                    </div>
                  </div>

                  <div className="space-y-4">
                    {film.reviews && film.reviews.length > 0 ? (
                      film.reviews.map((rev, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] space-y-3"
                        >
                          <p className="text-base font-serif italic text-[var(--color-text-primary)] leading-relaxed">
                            &ldquo;{rev.quote}&rdquo;
                          </p>
                          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)]">
                            <div>
                              <span className="font-semibold text-[var(--color-text-primary)]">
                                {rev.critic}
                              </span>
                              <span className="opacity-70"> — {rev.publication}</span>
                            </div>
                            {rev.rating && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                                {rev.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] space-y-2">
                        <p className="text-base font-serif italic text-[var(--color-text-primary)]">
                          &ldquo;A triumph of singular directorial vision and peerless visual storytelling.&rdquo;
                        </p>
                        <span className="text-xs font-mono text-[var(--color-text-secondary)] block">
                          Sight &amp; Sound International Film Critics
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Screenings & Booking */}
              {activeTab === 'screenings' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)]">
                        Available Screening Showtimes
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        Select a screening slot below to reserve your auditorium seat.
                      </p>
                    </div>
                  </div>

                  {bookedSlot && (
                    <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                      <CheckCircle2 className="size-5 shrink-0" />
                      <span>
                        Reservation confirmed for <strong>{bookedSlot}</strong>. E-ticket dispatched to passbook!
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {film.screeningSlots && film.screeningSlots.length > 0 ? (
                      film.screeningSlots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] flex flex-col justify-between gap-4 hover:border-black/20 dark:hover:border-white/20 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-base font-bold text-[var(--color-text-primary)]">
                                  {slot.time}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase bg-black/5 dark:bg-white/10 text-[var(--color-text-primary)]">
                                  {slot.format}
                                </span>
                              </div>
                              <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-1 block">
                                {slot.date} · {slot.auditorium}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                                slot.availability === 'Selling Fast'
                                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                  : slot.availability === 'Few Seats Left'
                                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              }`}
                            >
                              {slot.availability}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleBooking(`${slot.date} at ${slot.time} (${slot.format})`)}
                            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Ticket className="size-3.5" />
                            Book This Showtime
                          </button>
                        </div>
                      ))
                    ) : (
                      film.screenings?.map((screening, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-[var(--color-text-primary)]">
                              <Calendar className="size-4" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold font-mono text-[var(--color-text-primary)] block">
                                {screening}
                              </span>
                              <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                                Auditorium A · Assigned Seating
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleBooking(screening)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                          >
                            Book
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[var(--color-border)] bg-black/[0.02] dark:bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Murdjadjo Cinema Curations · 70mm &amp; Archival Series</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Sound Mix: Uncompressed 24-bit 96kHz</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogContainer>
    </Dialog>
  );
}
