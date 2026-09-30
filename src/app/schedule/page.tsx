"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Film,
  Sparkles,
  Volume2,
  SlidersHorizontal,
  Info,
  Shield,
  ArrowLeft,
  Tv,
  Check,
  MapPin,
  ExternalLink,
} from "lucide-react"

import {
  CINEMA_HALLS,
  INITIAL_FILMS,
  INITIAL_SCREENINGS,
  getFilms,
  getScreenings,
  type CinemaFilm,
  type CinemaHall,
  type Screening,
} from "@/lib/cinema-data"
import { cn } from "@/lib/utils"
import { TextReveal } from "@/components/velora/text-reveal"
import { CinemaCursor } from "@/components/cinema-cursor"
import { LandscapeOrbToggle } from "@/components/landscape-orb-toggle"
import { CinemaFooter } from "@/components/cinema-footer"
import { useCinemaTransition } from "@/components/cinema-page-curtains"
import { CinemaLogo } from "@/components/cinema-logo"
import { Schedule3DStage } from "@/components/schedule-3d-stage"
import CenterUnderline from "@/components/fancy/text/underline-center"
import ComesInGoesOutUnderline from "@/components/fancy/text/underline-comes-in-goes-out"
import {
  Dialog,
  DialogClose,
  DialogContainer,
  DialogContent,
  DialogDescription,
  DialogImage,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/linear-modal"
import { FilmModalView } from "@/components/film-modal-view"

// Format helper for calendar display
function formatDayParts(dateStr: string) {
  // dateStr is "YYYY-MM-DD"
  const [y, m, d] = dateStr.split("-").map(Number)
  const dateObj = new Date(y, m - 1, d)
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()
  const monthName = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
  return {
    dayName,
    dayNum: String(d).padStart(2, "0"),
    monthName,
    fullFormatted: dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  }
}

export default function SchedulePage() {
  const { navigate } = useCinemaTransition()
  const [films, setFilms] = React.useState<CinemaFilm[]>(INITIAL_FILMS)
  const [screenings, setScreenings] = React.useState<Screening[]>(INITIAL_SCREENINGS)
  const [selectedDate, setSelectedDate] = React.useState<string>("2026-09-28")
  const [selectedExperience, setSelectedExperience] = React.useState<string>("all")
  const [activeFilmForModal, setActiveFilmForModal] = React.useState<CinemaFilm | null>(null)

  // Listen to client updates from localStorage or custom events
  React.useEffect(() => {
    const loadData = () => {
      setFilms(getFilms())
      setScreenings(getScreenings())
    }
    loadData()
    window.addEventListener("cenima_data_updated", loadData)
    return () => window.removeEventListener("cenima_data_updated", loadData)
  }, [])

  // Calculate distinct available dates sorted
  const availableDates = React.useMemo(() => {
    const set = new Set<string>()
    screenings.forEach((s) => set.add(s.date))
    return Array.from(set).sort()
  }, [screenings])

  // Current screenings for selected date
  const dayScreenings = React.useMemo(() => {
    return screenings.filter((s) => s.date === selectedDate)
  }, [screenings, selectedDate])

  // Filtered screenings based on Experience / Hall
  const filteredScreenings = React.useMemo(() => {
    return dayScreenings.filter((s) => {
      if (selectedExperience === "all") return true
      if (selectedExperience === "screen-1") return s.hallId === "screen-1"
      if (selectedExperience === "vip") return s.tag === "VIP Salle" || s.hallId === "vip-salle"
      if (selectedExperience === "auditorium-2") return s.hallId === "auditorium-2"
      if (selectedExperience === "kids") return s.tag === "Kids Only" || s.hallId === "kids-arena"
      return true
    })
  }, [dayScreenings, selectedExperience])

  // Group filtered screenings by Film
  const groupedByFilm = React.useMemo(() => {
    const map = new Map<number, { film: CinemaFilm; screenings: Screening[] }>()
    filteredScreenings.forEach((s) => {
      const film = films.find((f) => f.id === s.filmId)
      if (!film) return
      if (!map.has(film.id)) {
        map.set(film.id, { film, screenings: [] })
      }
      map.get(film.id)!.screenings.push(s)
    })

    // Sort screenings within each film by time
    map.forEach((item) => {
      item.screenings.sort((a, b) => a.time.localeCompare(b.time))
    })

    return Array.from(map.values())
  }, [filteredScreenings, films])

  // Date index navigation
  const currentIndex = availableDates.indexOf(selectedDate)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < availableDates.length - 1

  const handlePrevDate = () => {
    if (canGoPrev) setSelectedDate(availableDates[currentIndex - 1])
  }

  const handleNextDate = () => {
    if (canGoNext) setSelectedDate(availableDates[currentIndex + 1])
  }

  const selectedDateInfo = formatDayParts(selectedDate)

  return (
    <div className="relative w-full min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] antialiased transition-colors duration-300">
      {/* Custom Spring Cursor */}
      <CinemaCursor attachToParent={false} />

      {/* Top Fixed Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[var(--color-bg-base)]/98 sm:bg-[var(--color-bg-base)]/85 border-b border-[var(--color-border)] px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between transition-colors shadow-xs">
        {/* Left: Home Navigation */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate("/", "Works '26 · Index")}
            data-cursor-interactive="true"
            data-cursor-label="Home"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-[var(--color-text-primary)] group cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <CinemaLogo size="md" />
          </button>

          <span className="hidden md:inline-block text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--color-text-tertiary)] pl-4 border-l border-[var(--color-border)]">
            Daily Exhibition Schedule
          </span>
        </div>

        {/* Center: Live Date Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs font-mono font-medium">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>AUTUMN PROGRAMME '26</span>
        </div>

        {/* Right: Actions (Theme Toggle) */}
        <div className="flex items-center">
          <LandscapeOrbToggle size={32} />
        </div>
      </header>

      {/* 3D Interactive Stage Canvas */}
      <Schedule3DStage>
        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-14 space-y-10 sm:space-y-14 pb-28">
          {/* Page Hero Editorial Title */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-amber-500 font-semibold">
            <Sparkles className="size-3.5" />
            <span>Curated Screenings</span>
          </div>
          <TextReveal
            text="The Exhibition Schedule"
            as="h1"
            animateOnMount
            stagger={0.06}
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase"
          />
        </div>

        {/* DATE SELECTION RIBBON (AIRY & GENEROUS DATE PICKER) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[var(--color-text-tertiary)] font-semibold">
                Select Date
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[var(--color-text-secondary)]">
                {selectedDateInfo.fullFormatted}
              </span>
            </div>

            {/* Prev / Next Chevrons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevDate}
                disabled={!canGoPrev}
                data-cursor-interactive="true"
                data-cursor-label="Prev"
                className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNextDate}
                disabled={!canGoNext}
                data-cursor-interactive="true"
                data-cursor-label="Next"
                className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrolling Ribbon - Comfortable Proportions */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-2.5 px-0.5 no-scrollbar scroll-smooth">
            {availableDates.map((dateStr) => {
              const { dayName, dayNum, monthName } = formatDayParts(dateStr)
              const isSelected = dateStr === selectedDate
              const isToday = dateStr === "2026-09-28"

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  data-cursor-interactive="true"
                  data-cursor-label={dayName}
                  className={`relative shrink-0 flex flex-col items-center justify-between w-20 sm:w-24 h-24 sm:h-28 p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "border-amber-500/80 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-lg scale-[1.02]"
                      : "border-[var(--color-border)] bg-black/[0.02] dark:bg-white/[0.03] hover:border-black/30 dark:hover:border-white/30 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {/* Top: Day Name & Dot */}
                  <div className="w-full flex items-center justify-between text-xs font-mono font-medium leading-none">
                    <span>{dayName}</span>
                    {isToday && (
                      <span className="size-1.5 rounded-full bg-amber-500" title="Today" />
                    )}
                  </div>

                  {/* Date Number */}
                  <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight leading-none my-auto">
                    {dayNum}
                  </span>

                  {/* Bottom: Month */}
                  <div className="w-full flex items-center justify-center text-[10px] sm:text-[11px] font-mono uppercase tracking-widest opacity-60 leading-none">
                    <span>{monthName}</span>
                  </div>

                  {/* Subtle selection glow border */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-date-border"
                      className="absolute inset-0 rounded-2xl ring-2 ring-amber-500/40 pointer-events-none"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* EXPERIENCE FILTER PILLS (UNBOXED & AIRY) */}
        <section className="py-1">
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] shrink-0 mr-2 font-medium flex items-center gap-1.5">
              <SlidersHorizontal className="size-3.5" />
              <span>Experience</span>
            </span>

            {[
              { id: "all", label: "All Screenings" },
              { id: "screen-1", label: "Screen 1" },
              { id: "vip", label: "VIP Salle" },
              { id: "auditorium-2", label: "Auditorium 2" },
              { id: "kids", label: "Kids Arena" },
            ].map((item) => {
              const isActive = selectedExperience === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedExperience(item.id)}
                  data-cursor-interactive="true"
                  data-cursor-label="Filter"
                  className={cn(
                    "px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-mono font-medium transition-all shrink-0 cursor-pointer select-none",
                    isActive
                      ? "bg-amber-500 text-neutral-950 font-bold shadow-sm scale-[1.02]"
                      : "border border-[var(--color-border)] bg-black/[0.02] dark:bg-white/[0.03] hover:border-black/30 dark:hover:border-white/30 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* SCREENINGS LIST FOR SELECTED DATE */}
        <section className="space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
              Films Programmed on {selectedDateInfo.fullFormatted}
            </h2>
            <span className="text-xs sm:text-sm font-mono text-[var(--color-text-tertiary)]">
              {groupedByFilm.length} {groupedByFilm.length === 1 ? "Film" : "Films"} ·{" "}
              {filteredScreenings.length} {filteredScreenings.length === 1 ? "Screening" : "Screenings"}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {groupedByFilm.length > 0 ? (
              <motion.div
                key={`${selectedDate}-${selectedExperience}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 sm:space-y-8"
              >
                {groupedByFilm.map(({ film, screenings }) => (
                  <article
                    key={film.id}
                    className="p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-base)]/90 dark:bg-[var(--color-bg-base)]/80 backdrop-blur-md hover:border-amber-500/40 hover:shadow-2xl transition-all duration-300 flex flex-col lg:flex-row gap-5 sm:gap-8 items-start lg:items-center justify-between shadow-xs overflow-hidden"
                  >
                    {/* Film Thumbnail & Info */}
                    <div className="flex flex-row items-center sm:items-center gap-4 sm:gap-6 min-w-0 w-full lg:w-auto flex-1">
                      {/* Cinematic Poster Image */}
                      <div className="relative w-20 sm:w-28 md:w-32 h-28 sm:h-40 md:h-46 rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 border border-black/10 dark:border-white/10 shrink-0 shadow-md group">
                        <img
                          src={film.image}
                          alt={film.title}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      {/* Film Meta details */}
                      <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                        {/* Rating, Year, Duration metadata row */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-[var(--color-text-secondary)]">
                          <span className="text-amber-500 font-bold flex items-center gap-1">
                            ★ {film.imdbRating}
                          </span>
                          <span className="text-[var(--color-text-tertiary)] opacity-60">·</span>
                          <span>{film.year}</span>
                          <span className="text-[var(--color-text-tertiary)] opacity-60">·</span>
                          <span>{film.duration}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] leading-snug">
                          {film.title}
                        </h3>

                        {/* Director and Category */}
                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-1">
                          Dir. {film.director} · <span className="text-[var(--color-text-tertiary)]">{film.category}</span>
                        </p>

                        {/* Curator Notes link */}
                        <div className="pt-0.5">
                          <button
                            type="button"
                            onClick={() => setActiveFilmForModal(film)}
                            data-cursor-interactive="true"
                            data-cursor-label="Details"
                            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            <Info className="size-3.5" />
                            <span>Curator Notes &amp; Specs</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Showtime Pills */}
                    <div className="w-full lg:w-auto lg:max-w-xl flex flex-col lg:items-end gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-[var(--color-border)]/50 shrink-0">
                      <div className="flex items-center justify-between lg:justify-end gap-3 text-xs font-mono text-[var(--color-text-tertiary)] uppercase tracking-[0.15em] w-full">
                        <span>Showtimes ({screenings.length})</span>
                        <span className="normal-case tracking-normal opacity-70">Open Admission</span>
                      </div>

                      <div className="flex flex-wrap items-center lg:justify-end gap-2 sm:gap-2.5">
                        {screenings.map((s) => {
                          const hall = CINEMA_HALLS.find((h) => h.id === s.hallId)
                          const isVip = s.tag === "VIP Salle"
                          const isKids = s.tag === "Kids Only"
                          const isMidnight = s.tag === "Midnight Special"
                          const isFewLeft = s.availability === "Few Seats Left"
                          const isSellingFast = s.availability === "Selling Fast"

                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setActiveFilmForModal(film)}
                              data-cursor-interactive="true"
                              data-cursor-label="View Specs"
                              className={cn(
                                "group inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer select-none",
                                isVip
                                  ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                  : isKids
                                  ? "border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
                                  : isMidnight
                                  ? "border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                                  : "border-[var(--color-border)] bg-black/[0.02] dark:bg-white/[0.04] text-[var(--color-text-primary)] hover:border-black/30 dark:hover:border-white/30 hover:bg-black/5 dark:hover:bg-white/10"
                              )}
                            >
                              <span className="font-mono font-bold tracking-tight">{s.time}</span>
                              <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                                {hall?.shortName || s.hallId}
                              </span>
                              {s.tag !== "Standard" && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 dark:bg-white/10 opacity-80">
                                  {s.tag}
                                </span>
                              )}
                              {(isFewLeft || isSellingFast) && (
                                <span
                                  className={cn(
                                    "size-1.5 rounded-full shrink-0",
                                    isFewLeft ? "bg-rose-500 animate-pulse" : "bg-amber-400"
                                  )}
                                  title={s.availability}
                                />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </article>
                ))}
              </motion.div>
            ) : (
              /* EMPTY STATE */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-16 sm:p-24 rounded-3xl border border-dashed border-[var(--color-border)] text-center space-y-5"
              >
                <div className="size-14 rounded-2xl mx-auto flex items-center justify-center bg-black/5 dark:bg-white/5 text-[var(--color-text-tertiary)]">
                  <CalendarIcon className="size-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">No Screenings Found</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
                    No screenings match your current date or hall filters. Try clearing the filter or picking another date on the calendar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedExperience("all")}
                  data-cursor-interactive="true"
                  data-cursor-label="Reset"
                  className="px-5 py-2.5 rounded-full text-xs font-semibold font-mono bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:scale-105 transition-all cursor-pointer shadow-sm"
                >
                  Reset Experience Filter
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>
      </Schedule3DStage>

      {/* Film Detail Modal (When user clicks curator notes) */}
      {activeFilmForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--color-bg-base)] border border-[var(--color-border)] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-amber-500 font-semibold block">
                  Exhibition Archive
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
                director: activeFilmForModal.director,
                year: activeFilmForModal.year,
                duration: activeFilmForModal.duration,
                tagline: activeFilmForModal.tagline,
                synopsis: activeFilmForModal.synopsis,
                stills: activeFilmForModal.stills,
                reviews: activeFilmForModal.reviews,
                specs: activeFilmForModal.specs,
                screeningSlots: dayScreenings
                  .filter((s) => s.filmId === activeFilmForModal.id)
                  .map((s) => ({
                    time: s.time,
                    date: selectedDateInfo.dayName + " " + selectedDateInfo.monthName + " " + selectedDateInfo.dayNum,
                    format: s.format,
                    auditorium: CINEMA_HALLS.find((h) => h.id === s.hallId)?.name || s.hallId,
                    availability: s.availability,
                  })),
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <CinemaFooter
        onNavigateHome={() => navigate("/", "Works '26 · Index")}
        onNavigateSchedule={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onNavigateCurations={() => navigate("/#the-godfather", "Archival Curations")}
      />
    </div>
  )
}
