"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Home, Film, Clapperboard, Calendar, Sparkles } from "lucide-react"
import { MercuryMenu, type MercuryMenuItem } from "@/registry/crafterui/ui/mercury-menu"
import { useCinemaTransition } from "@/components/cinema-page-curtains"
import { cn } from "@/lib/utils"

const glyph = "size-3.5 opacity-80"

export function CinemaFloatingNav() {
  const pathname = usePathname()
  const { navigate } = useCinemaTransition()
  const [homeSection, setHomeSection] = React.useState<"home" | "films" | "curations">("home")
  const [turn, setTurn] = React.useState<number>(0)
  const [footerInView, setFooterInView] = React.useState<boolean>(false)

  // Listen to timeline position updates from the Home Page 3D works wheel
  React.useEffect(() => {
    const handleTurnChange = (e: CustomEvent<{ turn: number; active: number }>) => {
      const { turn: t } = e.detail || { turn: 0 }
      setTurn(t)
      if (t < 0.6) {
        setHomeSection("home")
      } else if (t < 4.5) {
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

  // Detect when user reaches the footer across all tabs
  React.useEffect(() => {
    setFooterInView(false)

    const handleScroll = () => {
      if (isHome) return
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      // When within 260px of the document bottom, footer is reached
      if (documentHeight - (scrollY + windowHeight) < 260) {
        setFooterInView(true)
      } else {
        setFooterInView(false)
      }
    }

    const timer = setTimeout(() => {
      const footer = document.getElementById("cinema-footer")
      if (!footer) return

      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry.isIntersecting) {
            setFooterInView(true)
          } else {
            handleScroll()
          }
        },
        {
          root: null,
          threshold: 0.05,
        }
      )

      observer.observe(footer)
      return () => observer.disconnect()
    }, 150)

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [pathname, isHome])

  // Visibility Rules:
  // 1. On Home Page: disappeared on Hero (turn < 0.6) AND disappeared when reaching Footer (turn > 7.1 or footerInView)
  // 2. On other tabs: disappeared when reaching the Footer (footerInView)
  const isVisible = isHome
    ? turn >= 0.6 && turn <= 7.1 && !footerInView
    : !footerInView

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
    <div
      className={cn(
        "fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-50 transition-all duration-300 ease-out",
        isVisible
          ? "opacity-100 pointer-events-auto translate-y-0 scale-100"
          : "opacity-0 pointer-events-none translate-y-4 scale-90"
      )}
      aria-hidden={!isVisible}
    >
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
