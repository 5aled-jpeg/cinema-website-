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
import { CinemaCursor } from "@/components/cinema-cursor"
import { LandscapeOrbToggle } from "@/components/landscape-orb-toggle"
import { CinemaFooter } from "@/components/cinema-footer"
import { useCinemaTransition } from "@/components/cinema-page-curtains"
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
  const [selectedHall, setSelectedHall] = React.useState<string>("all")
  const [selectedTag, setSelectedTag] = React.useState<string>("all")
  const [activeFilmForModal, setActiveFilmForModal] = React.useState<CinemaFilm | null>(null)

  // Listen to client updates from localStorage or custom events
  React.useEffect(() => {
    const loadData = () => {
      setFilms(getFilms())
      setScreenings(getScreenings())
    }
    loadData()
    window.addEventListener("murdjadjo_data_updated", loadData)
    return () => window.removeEventListener("murdjadjo_data_updated", loadData)
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

  // Filtered screenings based on Hall and Tag filters
  const filteredScreenings = React.useMemo(() => {
    return dayScreenings.filter((s) => {
      const matchHall = selectedHall === "all" || s.hallId === selectedHall
      const matchTag =
        selectedTag === "all" ||
        (selectedTag === "vip" && s.tag === "VIP Salle") ||
        (selectedTag === "kids" && s.tag === "Kids Only") ||
        (selectedTag === "70mm" && s.tag === "70mm Archival") ||
        (selectedTag === "standard" && s.tag === "Standard") ||
        (selectedTag === "midnight" && s.tag === "Midnight Special")
      return matchHall && matchTag
    })
  }, [dayScreenings, selectedHall, selectedTag])

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
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[var(--color-bg-base)]/85 border-b border-[var(--color-border)] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
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
            Daily Exhibition Schedule
          </span>
        </div>

        {/* Center: Live Date Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs font-mono font-medium">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>AUTUMN PROGRAMME '26</span>
        </div>

        {/* Right: Actions (Theme Toggle & Admin Portal Link) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin", "Cinema Management")}
            data-cursor-interactive="true"
            data-cursor-label="Admin"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all bg-black/[0.02] dark:bg-white/[0.04] cursor-pointer"
          >
            <Shield className="size-3.5" />
            <span>Admin</span>
          </button>

          <div className="pl-1">
            <LandscapeOrbToggle size={36} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 space-y-10">
        {/* Page Hero Editorial Title */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-amber-500 font-semibold">
            <Sparkles className="size-3.5" />
            <span>Curated Screenings</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase">
            The Exhibition Schedule
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] font-serif max-w-2xl leading-relaxed">
            Master prints projected in genuine 70mm, 4K reference laser, and intimate VIP salon presentations. Seating is open admission upon door opening.
          </p>
        </div>

        {/* DATE SELECTION RIBBON (THE DATE PICKER) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] font-semibold">
                Select Date
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--color-text-secondary)]">
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
                className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
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
                className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrolling Ribbon */}
          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth">
            {availableDates.map((dateStr) => {
              const { dayName, dayNum, monthName } = formatDayParts(dateStr)
              const isSelected = dateStr === selectedDate
              const isToday = dateStr === "2026-09-28"
              const count = screenings.filter((s) => s.date === dateStr).length

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  data-cursor-interactive="true"
                  data-cursor-label={dayName}
                  className={`relative shrink-0 flex flex-col items-center justify-between w-24 sm:w-28 h-28 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "border-amber-500 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-lg scale-[1.03]"
                      : "border-[var(--color-border)] bg-black/[0.015] dark:bg-white/[0.025] hover:border-black/30 dark:hover:border-white/30 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {/* Top Badge: Today or Screenings Count */}
                  <div className="w-full flex items-center justify-between text-[10px] font-mono">
                    <span className="font-semibold">{dayName}</span>
                    {isToday && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full uppercase tracking-widest text-[9px] font-bold ${
                          isSelected
                            ? "bg-amber-500 text-neutral-950"
                            : "bg-amber-500/20 text-amber-500"
                        }`}
                      >
                        Today
                      </span>
                    )}
                  </div>

                  {/* Big Date Number */}
                  <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight my-0.5">
                    {dayNum}
                  </span>

                  {/* Bottom: Month & Count */}
                  <div className="w-full flex items-center justify-between text-[10px] font-mono opacity-80">
                    <span>{monthName}</span>
                    <span className="tabular-nums">{count} shows</span>
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

        {/* HALL & EXPERIENCE FILTER CONTROLS */}
        <section className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-black/[0.015] dark:bg-white/[0.02] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Hall Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] mr-2 flex items-center gap-1.5">
              <SlidersHorizontal className="size-3.5" />
              <span>Halls</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedHall("all")}
              data-cursor-interactive="true"
              data-cursor-label="Filter"
              className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer ${
                selectedHall === "all"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs"
                  : "border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)]"
              }`}
            >
              All Halls
            </button>

            {CINEMA_HALLS.map((hall) => {
              const isActive = selectedHall === hall.id
              return (
                <button
                  key={hall.id}
                  type="button"
                  onClick={() => setSelectedHall(hall.id)}
                  data-cursor-interactive="true"
                  data-cursor-label="Filter"
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer ${
                    isActive
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs"
                      : "border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)]"
                  }`}
                >
                  {hall.shortName}
                </button>
              )
            })}
          </div>

          {/* Experience / Tag Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] mr-2">
              Experience
            </span>

            {[
              { id: "all", label: "All Formats" },
              { id: "vip", label: "VIP Salle" },
              { id: "70mm", label: "70mm Archival" },
              { id: "kids", label: "Kids Only" },
            ].map((tag) => {
              const isActive = selectedTag === tag.id
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTag(tag.id)}
                  data-cursor-interactive="true"
                  data-cursor-label="Filter"
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer ${
                    isActive
                      ? "bg-amber-500 text-neutral-950 font-bold shadow-xs"
                      : "border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)]"
                  }`}
                >
                  {tag.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* SCREENINGS LIST FOR SELECTED DATE */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Films Programmed on {selectedDateInfo.fullFormatted}
            </h2>
            <span className="text-xs font-mono text-[var(--color-text-tertiary)]">
              {groupedByFilm.length} {groupedByFilm.length === 1 ? "Film" : "Films"} ·{" "}
              {filteredScreenings.length} {filteredScreenings.length === 1 ? "Screening" : "Screenings"}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {groupedByFilm.length > 0 ? (
              <motion.div
                key={`${selectedDate}-${selectedHall}-${selectedTag}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {groupedByFilm.map(({ film, screenings }) => (
                  <article
                    key={film.id}
                    className="p-5 sm:p-7 rounded-3xl border border-[var(--color-border)] bg-black/[0.015] dark:bg-white/[0.02] hover:border-black/20 dark:hover:border-white/20 transition-all flex flex-col lg:flex-row gap-6 lg:gap-8 items-start"
                  >
                    {/* Film Thumbnail & Quick Overview */}
                    <div className="w-full lg:w-72 shrink-0 space-y-3">
                      <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 group">
                        <img
                          src={film.image}
                          alt={film.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-black/60 text-white backdrop-blur-md border border-white/10">
                            ★ {film.imdbRating}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-black/60 text-neutral-300 backdrop-blur-md border border-white/10">
                            {film.year}
                          </span>
                        </div>

                        {/* Bottom Tagline on Image */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-xs text-white/90 font-serif italic truncate">
                            &ldquo;{film.tagline}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Film Meta details */}
                      <div className="space-y-1">
                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                          {film.title}
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                          Dir. {film.director} · {film.duration}
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          {film.category}
                        </p>
                      </div>

                      {/* View Film Details Button */}
                      <button
                        type="button"
                        onClick={() => setActiveFilmForModal(film)}
                        data-cursor-interactive="true"
                        data-cursor-label="Details"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <Info className="size-3.5" />
                        <span>Curator Notes & Specs</span>
                      </button>
                    </div>

                    {/* Showtimes Grid for this Film */}
                    <div className="flex-1 w-full space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] font-semibold">
                          Available Screenings
                        </span>
                        <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                          Doors open 20 mins prior
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                        {screenings.map((screening) => {
                          const hall = CINEMA_HALLS.find((h) => h.id === screening.hallId)
                          const isVip = screening.tag === "VIP Salle"
                          const isKids = screening.tag === "Kids Only"
                          const is70mm = screening.tag === "70mm Archival"
                          const isMidnight = screening.tag === "Midnight Special"

                          return (
                            <div
                              key={screening.id}
                              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                                isVip
                                  ? "border-amber-500/40 bg-amber-500/[0.04] dark:bg-amber-500/[0.06]"
                                  : isKids
                                  ? "border-sky-500/40 bg-sky-500/[0.04] dark:bg-sky-500/[0.06]"
                                  : is70mm
                                  ? "border-rose-500/40 bg-rose-500/[0.04] dark:bg-rose-500/[0.06]"
                                  : "border-[var(--color-border)] bg-black/[0.02] dark:bg-white/[0.03]"
                              }`}
                            >
                              <div className="space-y-2">
                                {/* Time & Tag Header */}
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-2xl font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
                                    {screening.time}
                                  </span>

                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                      isVip
                                        ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                        : isKids
                                        ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                        : is70mm
                                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                        : isMidnight
                                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                        : "bg-white/10 text-neutral-300 border border-white/20"
                                    }`}
                                  >
                                    {screening.tag}
                                  </span>
                                </div>

                                {/* Room / Hall */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-primary)]">
                                    <MapPin className="size-3 text-amber-500 shrink-0" />
                                    <span>{hall?.shortName || screening.hallId}</span>
                                  </div>
                                  <p className="text-[11px] font-mono text-[var(--color-text-tertiary)]">
                                    {screening.format}
                                  </p>
                                </div>

                                {screening.notes && (
                                  <p className="text-[11px] text-[var(--color-text-secondary)] italic font-serif pt-1 border-t border-[var(--color-border)] line-clamp-2">
                                    {screening.notes}
                                  </p>
                                )}
                              </div>

                              {/* Status and Open Admission Notice (Zero Book Button!) */}
                              <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-mono">
                                <span
                                  className={
                                    screening.availability === "Few Seats Left"
                                      ? "text-red-400 font-semibold"
                                      : screening.availability === "Selling Fast"
                                      ? "text-amber-400 font-semibold"
                                      : "text-emerald-400 font-medium"
                                  }
                                >
                                  {screening.availability}
                                </span>
                                <span className="text-[var(--color-text-tertiary)]">
                                  Box Office Admission
                                </span>
                              </div>
                            </div>
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
                className="p-12 sm:p-16 rounded-3xl border border-dashed border-[var(--color-border)] text-center space-y-4"
              >
                <div className="size-12 rounded-2xl mx-auto flex items-center justify-center bg-black/5 dark:bg-white/5 text-[var(--color-text-tertiary)]">
                  <CalendarIcon className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">No Screenings Found</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
                    No screenings match your current date or hall filters. Try clearing the filter or picking another date on the calendar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHall("all")
                    setSelectedTag("all")
                  }}
                  data-cursor-interactive="true"
                  data-cursor-label="Reset"
                  className="px-4 py-2 rounded-full text-xs font-semibold font-mono bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:scale-105 transition-all cursor-pointer"
                >
                  Reset Hall & Format Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* HALL SPECIFICATIONS AT-A-GLANCE (EDITORIAL STRIP) */}
        <section className="pt-10 border-t border-[var(--color-border)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-[var(--color-text-tertiary)] font-semibold">
              The Auditoriums
            </h3>
            <span className="text-xs font-mono text-amber-500">
              Reference Projection Standards
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CINEMA_HALLS.map((hall) => (
              <div
                key={hall.id}
                className="p-4 rounded-2xl border border-[var(--color-border)] bg-black/[0.015] dark:bg-white/[0.02] space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {hall.shortName}
                  </span>
                  <span className="text-[var(--color-text-tertiary)]">
                    {hall.capacity} seats
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {hall.description}
                </p>
                <div className="pt-2 border-t border-[var(--color-border)] text-[11px] font-mono text-amber-500">
                  {hall.projection}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

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
