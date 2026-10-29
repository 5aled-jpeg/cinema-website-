"use client"

import * as React from "react"
import { Film } from "lucide-react"

import {
  WorksWheel,
  type WorksWheelItem,
  type WorksWheelHandle,
  type FilmScreeningSlot,
} from "@/registry/crafterui/ui/works-wheel"
import {
  INITIAL_FILMS,
  INITIAL_SCREENINGS,
  CINEMA_HALLS,
  getLocalStore,
  mergeAndSyncStore,
  type CinemaFilm,
  type Screening,
  type CinemaHall,
} from "@/lib/cinema-data"
import { CinemaCursor } from "@/components/cinema-cursor"
import { LandscapeOrbToggle } from "@/components/landscape-orb-toggle"
import { CinemaFooter } from "@/components/cinema-footer"
import { Component as ExperienceHero } from "@/components/ui/experience-hero"
import { useCinemaTransition } from "@/components/cinema-page-curtains"
import { CinemaLogo } from "@/components/cinema-logo"

function mapFilmsToWheelItems(
  films: CinemaFilm[],
  screenings: Screening[],
  hallsMap: Map<string, string>,
  selectedDate: string | null
): WorksWheelItem[] {
  return films.map((f) => {
    // Screenings for this film
    const filmScreenings = screenings.filter((s) => s.filmId === f.id)

    // If a date is selected, filter slots for that date; otherwise show all slots
    const relevantScreenings = selectedDate
      ? filmScreenings.filter((s) => s.date === selectedDate)
      : filmScreenings

    // Sort by date then time
    const sortedSlots = [...relevantScreenings].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.time.localeCompare(b.time)
    })

    const screeningSlots: FilmScreeningSlot[] = sortedSlots.map((s) => ({
      time: s.time,
      date: s.date,
      format: s.format,
      auditorium: hallsMap.get(s.hallId) || s.hallId,
      availability: s.availability,
    }))

    const stringSummaries = sortedSlots.slice(0, 3).map((s) => {
      const hall = hallsMap.get(s.hallId) || s.hallId
      return `${s.time} · ${hall} · ${s.format}`
    })

    return {
      id: f.id,
      title: f.title,
      image: f.image,
      href: `#film-${f.id}`,
      category: f.category,
      imdbRating: f.imdbRating || "8.5",
      director: f.director,
      year: f.year,
      duration: f.duration,
      tagline: f.tagline || "Exclusively in theatrical exhibition.",
      synopsis: f.synopsis || "",
      stills: f.stills?.length
        ? f.stills
        : [{ url: f.image, caption: `${f.title} Key Art`, aspectRatio: "2:3 Theatrical" }],
      screenings: stringSummaries.length > 0 ? stringSummaries : ["Daily Archival Showings"],
      screeningSlots,
    }
  })
}

export default function WorksWheelDemo() {
  const wheelRef = React.useRef<WorksWheelHandle>(null)
  const { navigate } = useCinemaTransition()

  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [allFilms, setAllFilms] = React.useState<CinemaFilm[]>(() => {
    if (typeof window !== "undefined") {
      return getLocalStore().films
    }
    return INITIAL_FILMS
  })
  const [wheelIds, setWheelIds] = React.useState<number[]>(() => {
    if (typeof window !== "undefined") {
      return getLocalStore().wheelIds
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  })
  const [screenings, setScreenings] = React.useState<Screening[]>(() => {
    if (typeof window !== "undefined") {
      return getLocalStore().screenings
    }
    return INITIAL_SCREENINGS
  })
  const [halls, setHalls] = React.useState<CinemaHall[]>(() => {
    if (typeof window !== "undefined") {
      return getLocalStore().halls
    }
    return CINEMA_HALLS
  })

  // Map hall IDs to friendly display names
  const hallsMap = React.useMemo(() => {
    return new Map(halls.map((h) => [h.id, h.shortName || h.name]))
  }, [halls])

  // Extract timeline dates and screening counts
  const { timelineDates, screeningsCountByDate } = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of screenings) {
      counts[s.date] = (counts[s.date] || 0) + 1
    }
    const dates = Object.keys(counts).sort()
    return { timelineDates: dates, screeningsCountByDate: counts }
  }, [screenings])

  // Compute filtered wheel items based on selected date
  const wheelItems = React.useMemo(() => {
    const filmsMap = new Map(allFilms.map((f) => [f.id, f]))

    if (selectedDate) {
      const dateScreeningFilmIds = new Set(
        screenings.filter((s) => s.date === selectedDate).map((s) => s.filmId)
      )

      const inWheelOrdered = wheelIds
        .filter((id) => dateScreeningFilmIds.has(id))
        .map((id) => filmsMap.get(id))
        .filter((f): f is CinemaFilm => Boolean(f))

      const remainingMatching = allFilms.filter(
        (f) => dateScreeningFilmIds.has(f.id) && !wheelIds.includes(f.id)
      )

      const filteredFilms = [...inWheelOrdered, ...remainingMatching]
      return mapFilmsToWheelItems(filteredFilms, screenings, hallsMap, selectedDate)
    }

    const orderedWheel = wheelIds
      .map((id) => filmsMap.get(id))
      .filter((f): f is CinemaFilm => Boolean(f))

    const baseList = orderedWheel.length > 0 ? orderedWheel : allFilms.slice(0, 10)
    return mapFilmsToWheelItems(baseList, screenings, hallsMap, null)
  }, [allFilms, wheelIds, screenings, hallsMap, selectedDate])

  // Fetch live store from server and sync
  React.useEffect(() => {
    const syncStore = (serverData?: any) => {
      const { store } = mergeAndSyncStore(serverData)
      setAllFilms(store.films)
      setWheelIds(store.wheelIds)
      setScreenings(store.screenings)
      setHalls(store.halls)
    }

    fetch("/api/cinema-data")
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && json?.data) {
          syncStore(json.data)
        } else {
          syncStore()
        }
      })
      .catch(() => syncStore())

    const handleUpdate = () => syncStore()
    window.addEventListener("cenima_data_updated", handleUpdate)
    return () => window.removeEventListener("cenima_data_updated", handleUpdate)
  }, [])

  // Handle navigation events
  React.useEffect(() => {
    const handleNav = (e: CustomEvent<string>) => {
      if (e.detail === "home") {
        wheelRef.current?.to(0)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }

    window.addEventListener("cinema-nav" as unknown as keyof WindowEventMap, handleNav as EventListener)

    return () => {
      window.removeEventListener("cinema-nav" as unknown as keyof WindowEventMap, handleNav as EventListener)
    }
  }, [])

  return (
    <main className="relative w-screen h-screen h-[100dvh] overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      {/* Custom Spring Animated Cursor */}
      <CinemaCursor attachToParent={false} />

      {/* Desktop Landscape Orb Dark/Light Theme Toggle (Top-Left Corner - Desktop only) */}
      <div className="fixed top-8 left-8 z-50 hidden md:block">
        <LandscapeOrbToggle size={42} />
      </div>

      {/* Mobile Top Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 md:hidden px-4 flex items-center justify-between bg-[var(--color-bg-base)]/92 backdrop-blur-xl border-b border-[var(--color-border)]/60 transition-colors">
        <button
          type="button"
          onClick={() => wheelRef.current?.to(0)}
          className="flex items-center gap-1.5 cursor-pointer py-1"
        >
          <CinemaLogo size="sm" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/movies", "Complete Cinema Archive")}
            className="px-2.5 py-1.5 rounded-full text-xs font-mono font-medium border border-[var(--color-border)] bg-black/5 dark:bg-white/10 text-[var(--color-text-primary)] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Film className="size-3 text-amber-500" />
            <span>Movies</span>
          </button>

          <div className="pl-0.5">
            <LandscapeOrbToggle size={30} />
          </div>
        </div>
      </header>

      {/* Unified Timeline: Experience Hero (t=0) -> Works Wheel (t=1..10) -> Cinema Footer (t=11) */}
      <WorksWheel
        ref={wheelRef}
        items={wheelItems}
        label="Works '26"
        action="View"
        timelineDates={timelineDates}
        screeningsCountByDate={screeningsCountByDate}
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(d)}
        hero={<ExperienceHero onExplore={() => wheelRef.current?.to(1)} />}
        onDiscoverAll={() => navigate("/movies", "Complete Cinema Archive")}
        onTurnChange={(t, near) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("cinema-turn-change", {
                detail: { turn: t, active: near },
              })
            )
          }
        }}
        footer={
          <CinemaFooter
            onNavigateHome={() => wheelRef.current?.to(0)}
            onNavigateMovies={() => {
              navigate("/movies", "Complete Cinema Archive")
            }}
          />
        }
      />
    </main>
  )
}
