"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Home, Film, Clapperboard, Calendar, Sparkles } from "lucide-react"
import { MercuryMenu, type MercuryMenuItem } from "@/registry/crafterui/ui/mercury-menu"
import { useCinemaTransition } from "@/components/cinema-page-curtains"

const glyph = "size-3.5 opacity-80"

export function CinemaFloatingNav() {
  const pathname = usePathname()
  const { navigate } = useCinemaTransition()
  const [homeSection, setHomeSection] = React.useState<"home" | "films" | "curations">("home")

  // Listen to timeline position updates from the Home Page 3D works wheel
  React.useEffect(() => {
    const handleTurnChange = (e: CustomEvent<{ turn: number; active: number }>) => {
      const { turn } = e.detail || { turn: 0 }
      if (turn < 0.6) {
        setHomeSection("home")
      } else if (turn < 4.5) {
        setHomeSection("films")
      } else {
        setHomeSection("curations")
      }
    }

    window.addEventListener(
      "cinema-turn-change" as unknown as keyof WindowEventMap,
      handleTurnChange as EventListener
    )
    return () => {
      window.removeEventListener(
        "cinema-turn-change" as unknown as keyof WindowEventMap,
        handleTurnChange as EventListener
      )
    }
  }, [])

  const isHome = pathname === "/"
  const isMovies = pathname === "/movies"
  const isSchedule = pathname === "/schedule"

  const menuItems: MercuryMenuItem[] = React.useMemo(() => {
    return [
      {
        id: "home",
        label: "Home Page",
        icon: <Home className={glyph} aria-hidden="true" />,
        active: isHome && homeSection === "home",
        onSelect: () => {
          if (isHome) {
            window.dispatchEvent(new CustomEvent("cinema-nav", { detail: "home" }))
            window.scrollTo({ top: 0, behavior: "smooth" })
          } else {
            navigate("/", "Works '26 · Index")
            setTimeout(() => {
              if (typeof window !== "undefined" && window.location.pathname !== "/") {
                window.location.href = "/"
              }
            }, 450)
          }
        },
      },
      {
        id: "featured",
        label: "Featured",
        icon: <Film className={glyph} aria-hidden="true" />,
        active: isHome && homeSection === "films",
        onSelect: () => {
          if (isHome) {
            window.dispatchEvent(new CustomEvent("cinema-nav", { detail: "featured" }))
          } else {
            navigate("/#featured", "Works '26 · Featured")
            setTimeout(() => {
              if (typeof window !== "undefined" && !window.location.pathname.startsWith("/")) {
                window.location.href = "/#featured"
              }
            }, 450)
          }
        },
      },
      {
        id: "movies",
        label: "All Movies",
        icon: <Clapperboard className={glyph} aria-hidden="true" />,
        active: isMovies,
        onSelect: () => {
          if (isMovies) {
            window.scrollTo({ top: 0, behavior: "smooth" })
          } else {
            navigate("/movies", "Complete Cinema Archive")
            setTimeout(() => {
              if (typeof window !== "undefined" && window.location.pathname !== "/movies") {
                window.location.href = "/movies"
              }
            }, 450)
          }
        },
      },
      {
        id: "schedule",
        label: "Schedule",
        icon: <Calendar className={glyph} aria-hidden="true" />,
        active: isSchedule,
        onSelect: () => {
          if (isSchedule) {
            window.scrollTo({ top: 0, behavior: "smooth" })
          } else {
            navigate("/schedule", "Exhibition Schedule")
            setTimeout(() => {
              if (typeof window !== "undefined" && window.location.pathname !== "/schedule") {
                window.location.href = "/schedule"
              }
            }, 450)
          }
        },
      },
      {
        id: "curations",
        label: "Curations",
        icon: <Sparkles className={glyph} aria-hidden="true" />,
        active: isHome && homeSection === "curations",
        onSelect: () => {
          if (isHome) {
            window.dispatchEvent(new CustomEvent("cinema-nav", { detail: "curations" }))
          } else {
            navigate("/#curations", "Archival Curations")
            setTimeout(() => {
              if (typeof window !== "undefined" && !window.location.hash.includes("curations")) {
                window.location.href = "/#curations"
              }
            }, 450)
          }
        },
      },
    ]
  }, [isHome, isMovies, isSchedule, homeSection, navigate])

  return (
    <div className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-50 pointer-events-auto">
      <MercuryMenu
        items={menuItems}
        align="left"
        panelWidth={184}
        size={42}
        label="Cinema Navigation Menu"
      />
    </div>
  )
}

export default CinemaFloatingNav
