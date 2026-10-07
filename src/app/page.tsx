"use client"

import * as React from "react"
import { Calendar, Film } from "lucide-react"

import {
  WorksWheel,
  type WorksWheelItem,
  type WorksWheelHandle,
} from "@/registry/crafterui/ui/works-wheel"
import { INITIAL_FILMS } from "@/lib/cinema-data"
import { CinemaCursor } from "@/components/cinema-cursor"
import { LandscapeOrbToggle } from "@/components/landscape-orb-toggle"
import { CinemaFooter } from "@/components/cinema-footer"
import { Component as ExperienceHero } from "@/components/ui/experience-hero"
import { useCinemaTransition } from "@/components/cinema-page-curtains"
import { CinemaLogo } from "@/components/cinema-logo"

const WORKS: WorksWheelItem[] = INITIAL_FILMS.slice(0, 10).map((f) => ({
  id: f.id,
  title: f.title,
  image: f.image,
  href: `#film-${f.id}`,
  category: f.category,
  imdbRating: f.imdbRating,
  director: f.director,
  year: f.year,
  duration: f.duration,
  tagline: f.tagline,
  synopsis: f.synopsis,
  stills: f.stills,
  screenings: ['Daily Archival Showings'],
  screeningSlots: [],
}))

export default function WorksWheelDemo() {
  const wheelRef = React.useRef<WorksWheelHandle>(null)
  const { navigate } = useCinemaTransition()
  const [wheelItems, setWheelItems] = React.useState<WorksWheelItem[]>(WORKS)

  // Fetch live wheel items from admin server store
  React.useEffect(() => {
    fetch('/api/cinema-data')
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && Array.isArray(json?.data?.wheelFilms) && json.data.wheelFilms.length > 0) {
          const mapped: WorksWheelItem[] = json.data.wheelFilms.map((f: any) => ({
            id: f.id,
            title: f.title,
            image: f.image,
            href: `#film-${f.id}`,
            category: f.category,
            imdbRating: f.imdbRating || '8.5',
            director: f.director,
            year: f.year,
            duration: f.duration,
            tagline: f.tagline || 'Exclusively in theatrical exhibition.',
            synopsis: f.synopsis || '',
            stills: f.stills?.length ? f.stills : [{ url: f.image, caption: `${f.title} Key Art`, aspectRatio: '2:3 Theatrical' }],
            screenings: ['Daily Archival Showings'],
            screeningSlots: [],
          }))
          setWheelItems(mapped)
        }
      })
      .catch(() => {})
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
    <main className="relative w-screen h-screen overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      {/* Custom Spring Animated Cursor */}
      <CinemaCursor attachToParent={false} />

      {/* Desktop Landscape Orb Dark/Light Theme Toggle (Top-Left Corner - Desktop only) */}
      <div className="fixed top-8 left-8 z-50 hidden md:block">
        <LandscapeOrbToggle size={42} />
      </div>

      {/* Mobile Top Navigation Bar (Mobile only - eliminates floating corner clutter) */}
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

          <button
            type="button"
            onClick={() => navigate("/schedule", "Exhibition Schedule")}
            className="px-2.5 py-1.5 rounded-full text-xs font-mono font-medium border border-[var(--color-border)] bg-black/5 dark:bg-white/10 text-[var(--color-text-primary)] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Calendar className="size-3 text-amber-500" />
            <span>Schedule</span>
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
            onNavigateSchedule={() => {
              navigate("/schedule", "Exhibition Schedule")
            }}
          />
        }
      />
    </main>
  )
}
