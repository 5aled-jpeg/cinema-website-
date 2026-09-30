"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  ArrowLeft,
  Calendar,
  Film,
  SlidersHorizontal,
  Sparkles,
  Info,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SuperHoverList,
  type SuperHoverListItem,
} from "@/registry/crafterui/ui/super-hover-list"
import { ARCHIVE_FILMS, type ArchiveFilmItem } from "@/lib/archive-films"
import { CinemaCursor } from "@/components/cinema-cursor"
import { LandscapeOrbToggle } from "@/components/landscape-orb-toggle"
import { CinemaFooter } from "@/components/cinema-footer"
import { useCinemaTransition } from "@/components/cinema-page-curtains"
import { FilmModalView } from "@/components/film-modal-view"

export default function MoviesArchivePage() {
  const { navigate } = useCinemaTransition()
  const mode: "super" | "native" = "native"
  const autoplay = true
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [activeFilmForModal, setActiveFilmForModal] = React.useState<ArchiveFilmItem | null>(null)

  const categories = React.useMemo(
    () => [
      { id: "all", label: "All Films" },
      { id: "crime", label: "Crime & Noir" },
      { id: "scifi", label: "Sci-Fi & Cyberpunk" },
      { id: "horror", label: "Horror & Midnight" },
      { id: "drama", label: "Drama & Romance" },
    ],
    []
  )

  const filteredFilms = React.useMemo(() => {
    if (selectedCategory === "all") return ARCHIVE_FILMS
    return ARCHIVE_FILMS.filter((film) => {
      const cat = (film.category + " " + film.subtitle).toLowerCase()
      if (selectedCategory === "crime") return cat.includes("crime") || cat.includes("noir")
      if (selectedCategory === "scifi") return cat.includes("sci-fi") || cat.includes("cyberpunk")
      if (selectedCategory === "horror") return cat.includes("horror") || cat.includes("thriller")
      if (selectedCategory === "drama") return cat.includes("drama") || cat.includes("romance")
      return true
    })
  }, [selectedCategory])

  const superHoverItems: SuperHoverListItem[] = React.useMemo(
    () =>
      filteredFilms.map((film, index) => ({
        id: film.id,
        title: film.title,
        subtitle: film.subtitle,
        meta: film.meta,
        image: film.image,
        onClick: () => setActiveFilmForModal(film),
      })),
    [filteredFilms]
  )

  return (
    <div className="relative w-full min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] antialiased transition-colors duration-300 flex flex-col justify-between">
      {/* Custom Spring Cursor */}
      <CinemaCursor attachToParent={false} />

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[var(--color-bg-base)]/98 sm:bg-[var(--color-bg-base)]/85 border-b border-[var(--color-border)] px-4 sm:px-8 py-3 flex items-center justify-between transition-colors shadow-xs">
        {/* Left: Home Navigation */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate("/", "Works '26 · Index")}
            data-cursor-interactive="true"
            data-cursor-label="Home"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--color-text-primary)] group cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>Murdjadjo Cinema</span>
          </button>

          <span className="hidden md:inline-block text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--color-text-tertiary)] pl-4 border-l border-[var(--color-border)]">
            Complete Archival Catalogue
          </span>
        </div>

        {/* Center: Live Total Archive Counter */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs font-mono font-medium">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>{ARCHIVE_FILMS.length} TITLES IN PERMANENT REPOSITORY</span>
        </div>

        {/* Right Actions: Schedule Shortcut & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate("/schedule", "Exhibition Schedule")}
            data-cursor-interactive="true"
            data-cursor-label="Schedule"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all bg-black/[0.02] dark:bg-white/[0.04] cursor-pointer"
          >
            <Calendar className="size-3.5" />
            <span className="hidden sm:inline">Schedule</span>
          </button>

          <div className="pl-0.5">
            <LandscapeOrbToggle size={30} />
          </div>
        </div>
      </header>

      {/* Main Archive Index Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-12 flex-1 flex flex-col space-y-6 sm:space-y-8 pb-20">
        {/* Page Hero Title & Description */}
        <div className="space-y-2 sm:space-y-3 pb-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-amber-500 font-semibold">
            <Film className="size-3.5" />
            <span>Full Repository</span>
          </div>
          <h1 className="text-2xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase">
            All Available Films
          </h1>
          <p className="text-xs sm:text-base text-[var(--color-text-secondary)] font-serif leading-relaxed">
            Browse our complete collection of films available for exhibition.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] mr-2 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="size-3.5" />
            <span>Category:</span>
          </span>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              data-cursor-interactive="true"
              data-cursor-label="Filter"
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all shrink-0 cursor-pointer",
                selectedCategory === cat.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs"
                  : "border border-[var(--color-border)] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Table Column Header Guide - Visible on tablet/desktop */}
        <div className="w-full hidden sm:grid grid-cols-[3rem_minmax(0,42%)_minmax(0,1fr)_minmax(3.5rem,16%)_3.5rem] text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-tertiary)] px-4 sm:px-8 border-b border-[var(--color-border)] pb-2 select-none">
          <div>Index</div>
          <div>Film Title</div>
          <div>Director / Genre</div>
          <div className="text-center">Art Reveal</div>
          <div className="text-right">Year</div>
        </div>

        {/* THE SUPER HOVER LIST (Core CrafterUI Component) */}
        <div className="h-[620px] w-full rounded-2xl border border-[var(--color-border)] bg-black/[0.015] dark:bg-white/[0.02] shadow-inner overflow-hidden">
          <SuperHoverList
            items={superHoverItems}
            mode={mode}
            autoplay={autoplay}
            speed={0.4}
            artworkSize={132}
            className="h-full"
            onItemClick={(item, index) => {
              const fullFilm = ARCHIVE_FILMS.find((f) => f.id === item.id)
              if (fullFilm) setActiveFilmForModal(fullFilm)
            }}
          />
        </div>
      </main>

      {/* Film Detail Modal when row is clicked */}
      {activeFilmForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--color-bg-base)] border border-[var(--color-border)] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-amber-500 font-semibold block">
                  Archive Master File
                </span>
                <h3 className="text-2xl font-bold tracking-tight">
                  {activeFilmForModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveFilmForModal(null)}
                data-cursor-interactive="true"
                data-cursor-label="Close"
                className="p-2 rounded-full border border-[var(--color-border)] hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer font-mono text-xs"
              >
                ✕ Close
              </button>
            </div>

            <FilmModalView
              film={{
                id: activeFilmForModal.id,
                title: activeFilmForModal.title,
                image: activeFilmForModal.image,
                category: activeFilmForModal.category,
                imdbRating: activeFilmForModal.imdbRating,
                director: activeFilmForModal.subtitle.split("·")[0]?.trim() || "Archival Master",
                year: activeFilmForModal.meta,
                duration: activeFilmForModal.duration,
                tagline: activeFilmForModal.tagline,
                synopsis: activeFilmForModal.synopsis,
                specs: {
                  format: "Theatrical Exhibition",
                  aspectRatio: "2.39:1 Anamorphic",
                  sound: "Dolby Atmos Discrete Array",
                  color: "Original Studio Color Reversal",
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <CinemaFooter
        onNavigateHome={() => navigate("/", "Works '26 · Index")}
        onNavigateSchedule={() => navigate("/schedule", "Exhibition Schedule")}
        onNavigateCurations={() => navigate("/#curations", "Archival Curations")}
      />
    </div>
  )
}
