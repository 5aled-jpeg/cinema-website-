'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useCinemaTransition } from '@/components/cinema-page-curtains';
import CenterUnderline from '@/components/fancy/text/underline-center';
import ComesInGoesOutUnderline from '@/components/fancy/text/underline-comes-in-goes-out';
import { cn } from '@/lib/utils';

export interface CinemaFooterProps {
  onNavigateHome?: () => void;
  onNavigateSchedule?: () => void;
  onNavigateMovies?: () => void;
}

export function CinemaFooter({
  onNavigateHome,
  onNavigateSchedule,
  onNavigateMovies,
}: CinemaFooterProps = {}) {
  const pathname = usePathname();
  const { navigate } = useCinemaTransition();

  const isHome = pathname === '/';
  const isMovies = pathname === '/movies';
  const isSchedule = pathname === '/schedule';

  const handleGoMovies = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateMovies) {
      onNavigateMovies();
    } else {
      navigate('/movies', 'Complete Cinema Archive');
    }
  };

  const handleGoHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      navigate('/', "Works '26 · Index");
    }
  };

  const handleGoSchedule = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateSchedule) {
      onNavigateSchedule();
    } else {
      navigate('/schedule', 'Exhibition Schedule');
    }
  };

  return (
    <footer
      id="cinema-footer"
      className="w-full min-h-[380px] bg-white dark:bg-[#0b0b0e] flex justify-center items-center border-t border-neutral-200 dark:border-neutral-800/80 transition-colors duration-300 py-12 sm:py-16 relative"
    >
      <div className="relative overflow-hidden w-full max-w-7xl flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-12 px-6 sm:px-16 md:px-24 text-neutral-900 dark:text-neutral-100">
        {/* Left: Discover All Movies Vault CTA */}
        <div className="flex flex-col items-start text-left z-10 w-full sm:max-w-md space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-500 font-semibold flex items-center gap-1.5">
            <Sparkles className="size-3" />
            <span>Permanent Repository</span>
          </span>
          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
            Explore The Full Vault
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-serif leading-relaxed max-w-sm">
            12 timeless cinematic masterworks and archival prints in our permanent exhibition repertory.
          </p>
          <button
            type="button"
            onClick={handleGoMovies}
            data-cursor-interactive="true"
            data-cursor-label="All Films"
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <span>Discover All Movies</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* Right: Navigation & External Links */}
        <div className="flex flex-row space-x-12 sm:space-x-16 md:space-x-24 text-sm sm:text-base md:text-lg font-medium tracking-tight z-10 text-left sm:text-right w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[var(--color-border)]/40 pt-6 sm:pt-0">
          <ul className="space-y-3 text-neutral-700 dark:text-neutral-300">
            <li>
              <a
                href="#home"
                onClick={handleGoHome}
                data-cursor-interactive="true"
                data-cursor-label="Home"
                className={cn(
                  "cursor-pointer transition-colors inline-block",
                  isHome
                    ? "text-amber-500 dark:text-amber-400 font-semibold"
                    : "hover:text-black dark:hover:text-white"
                )}
              >
                <CenterUnderline>Home</CenterUnderline>
              </a>
            </li>
            <li>
              <a
                href="/movies"
                onClick={handleGoMovies}
                data-cursor-interactive="true"
                data-cursor-label="All Movies"
                className={cn(
                  "cursor-pointer transition-colors inline-block",
                  isMovies
                    ? "text-amber-500 dark:text-amber-400 font-semibold"
                    : "hover:text-black dark:hover:text-white"
                )}
              >
                <CenterUnderline>All Movies</CenterUnderline>
              </a>
            </li>
            <li>
              <a
                href="/schedule"
                onClick={handleGoSchedule}
                data-cursor-interactive="true"
                data-cursor-label="Schedule"
                className={cn(
                  "cursor-pointer transition-colors inline-block",
                  isSchedule
                    ? "text-amber-500 dark:text-amber-400 font-semibold"
                    : "hover:text-black dark:hover:text-white"
                )}
              >
                <CenterUnderline>Schedule</CenterUnderline>
              </a>
            </li>
          </ul>

          <ul className="space-y-3 text-neutral-700 dark:text-neutral-300">
            <li>
              <a
                href="https://letterboxd.com"
                target="_blank"
                rel="noreferrer"
                data-cursor-interactive="true"
                data-cursor-label="Letterboxd"
                className="hover:text-black dark:hover:text-white cursor-pointer transition-colors inline-block"
              >
                <ComesInGoesOutUnderline direction="right">
                  Letterboxd
                </ComesInGoesOutUnderline>
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                data-cursor-interactive="true"
                data-cursor-label="Instagram"
                className="hover:text-black dark:hover:text-white cursor-pointer transition-colors inline-block"
              >
                <ComesInGoesOutUnderline direction="left">
                  Instagram
                </ComesInGoesOutUnderline>
              </a>
            </li>
            <li>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                data-cursor-interactive="true"
                data-cursor-label="X"
                className="hover:text-black dark:hover:text-white cursor-pointer transition-colors inline-block"
              >
                <ComesInGoesOutUnderline direction="right">
                  X (Twitter)
                </ComesInGoesOutUnderline>
              </a>
            </li>
          </ul>
        </div>

        <h2 className="absolute -bottom-2 sm:bottom-0 right-4 sm:left-12 sm:text-[180px] text-[72px] font-black uppercase text-neutral-900/[0.03] dark:text-white/[0.03] select-none pointer-events-none leading-none tracking-tighter">
          cinema
        </h2>
      </div>
    </footer>
  );
}

export default CinemaFooter;
