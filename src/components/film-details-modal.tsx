'use client';

import React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContainer,
  DialogContent,
  DialogImage,
  DialogTitle,
} from '@/components/ui/linear-modal';
import {
  Film,
  Star,
} from 'lucide-react';
import type { WorksWheelItem } from '@/registry/crafterui/ui/works-wheel';
import { FilmModalView } from '@/components/film-modal-view';

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
  if (!film) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContainer
        className="w-full max-w-4xl px-4 sm:px-6 pt-12 sm:pt-16 pb-8"
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

            {/* Modular Tab View with Overview & Stills and Available Screenings */}
            <FilmModalView film={film} />
          </div>
        </DialogContent>
      </DialogContainer>
    </Dialog>
  );
}

export default FilmDetailsModal;
