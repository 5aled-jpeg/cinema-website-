'use client';

import * as React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import CenterUnderline from '@/components/fancy/text/underline-center';
import ComesInGoesOutUnderline from '@/components/fancy/text/underline-comes-in-goes-out';

export interface CinemaFooterProps {
  onNavigateHome?: () => void;
  onNavigateSchedule?: () => void;
  onNavigateCurations?: () => void;
  onNavigateMovies?: () => void;
}

export function CinemaFooter({
  onNavigateHome,
  onNavigateSchedule,
  onNavigateCurations,
  onNavigateMovies,
}: CinemaFooterProps = {}) {
  return (
    <footer
      id="cinema-footer"
      className="w-full min-h-[420px] sm:min-h-[384px] bg-white dark:bg-[#0b0b0e] flex justify-center items-center border-t border-neutral-200 dark:border-neutral-800/80 transition-colors duration-300 py-10 sm:py-14"
    >
      <div className="relative overflow-hidden w-full h-full flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-12 px-6 sm:px-16 md:px-24 text-neutral-900 dark:text-neutral-100">
        {/* Left: Discover All Movies Vault CTA */}
        <div className="flex flex-col items-start text-left z-10 w-full sm:max-w-md space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-500 font-semibold flex items-center gap-1.5">
            <Sparkles className="size-3" />
            <span>Permanent Repository</span>
          </span>
          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
            Explore The Full Vault
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-serif leading-relaxed">
            Over 30+ archival prints and contemporary masterworks available in our streaming vault.
          </p>
          <button
            type="button"
            onClick={(e) => {
              if (onNavigateMovies) {
                e.preventDefault();
                onNavigateMovies();
              }
            }}
            data-cursor-interactive="true"
            data-cursor-label="All Films"
            className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
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
                onClick={(e) => {
                  if (onNavigateHome) {
                    e.preventDefault();
                    onNavigateHome();
                  }
                }}
                data-cursor-interactive="true"
                data-cursor-label="Home"
                className="hover:text-black dark:hover:text-white cursor-pointer transition-colors inline-block"
              >
                <CenterUnderline>Home</CenterUnderline>
              </a>
            </li>
            <li>
              <a
                href="/movies"
                onClick={(e) => {
                  if (onNavigateMovies) {
                    e.preventDefault();
                    onNavigateMovies();
                  }
                }}
                data-cursor-interactive="true"
                data-cursor-label="All Movies"
                className="hover:text-black dark:hover:text-white cursor-pointer transition-colors inline-block text-amber-500 dark:text-amber-400 font-semibold"
              >
                <CenterUnderline>All Movies</CenterUnderline>
              </a>
            </li>
            <li>
              <a
                href="/schedule"
                onClick={(e) => {
                  if (onNavigateSchedule) {
                    e.preventDefault();
                    onNavigateSchedule();
                  }
                }}
                data-cursor-interactive="true"
                data-cursor-label="Schedule"
                className="hover:text-black dark:hover:text-white cursor-pointer transition-colors inline-block"
              >
                <CenterUnderline>Schedule</CenterUnderline>
              </a>
            </li>
            <li>
              <a
                href="#curations"
                onClick={(e) => {
                  if (onNavigateCurations) {
                    e.preventDefault();
                    onNavigateCurations();
                  }
                }}
                data-cursor-interactive="true"
                data-cursor-label="Films"
                className="hover:text-black dark:hover:text-white cursor-pointer transition-colors inline-block"
              >
                <CenterUnderline>Curations</CenterUnderline>
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

        <h2 className="absolute bottom-0 right-4 sm:left-12 translate-y-1/3 sm:text-[192px] text-[72px] font-black uppercase text-neutral-900/[0.04] dark:text-white/[0.04] select-none pointer-events-none leading-none tracking-tighter">
          cinema
        </h2>
      </div>
    </footer>
  );
}

export default CinemaFooter;
