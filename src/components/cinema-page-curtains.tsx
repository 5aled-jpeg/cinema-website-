"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Sparkles } from "lucide-react"

export type TransitionStyle = "columns" | "curtain" | "doors"

interface TransitionContextType {
  navigate: (href: string, title?: string, style?: TransitionStyle) => void
  isTransitioning: boolean
}

const TransitionContext = React.createContext<TransitionContextType>({
  navigate: () => {},
  isTransitioning: false,
})

export function useCinemaTransition() {
  return React.useContext(TransitionContext)
}

export interface TransitionLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  title?: string
  transitionStyle?: TransitionStyle
  children: React.ReactNode
}

export function TransitionLink({
  href,
  title,
  transitionStyle = "columns",
  children,
  onClick,
  ...props
}: TransitionLinkProps) {
  const { navigate } = useCinemaTransition()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If opening in new tab or external link, allow default
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      href.startsWith("http") ||
      href.startsWith("//")
    ) {
      onClick?.(e)
      return
    }

    e.preventDefault()
    onClick?.(e)
    navigate(href, title, transitionStyle)
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}

const LUXURY_EASE = [0.76, 0, 0.24, 1] as const

export function CinemaPageCurtainsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const [transitionState, setTransitionState] = React.useState<"idle" | "covering" | "revealing">("idle")
  const [targetTitle, setTargetTitle] = React.useState<string>("Murdjadjo Cinema")
  const [activeStyle, setActiveStyle] = React.useState<TransitionStyle>("columns")

  const targetPathRef = React.useRef<string | null>(null)
  const pendingHrefRef = React.useRef<string | null>(null)
  const isNavigatingRef = React.useRef(false)
  const isCoveredRef = React.useRef(false)

  // Derive readable title if none provided
  const inferTitle = (href: string) => {
    if (href === "/" || href === "") return "Works '26 · Index"
    if (href.includes("schedule")) return "Exhibition Schedule"
    if (href.includes("admin")) return "Cinema Management"
    if (href.includes("#the-godfather")) return "The Godfather"
    if (href.includes("#curations")) return "Archival Curations"
    return "Murdjadjo Cinema"
  }

  // REVEAL LOGIC: Trigger reveal only when route has genuinely committed
  const triggerReveal = React.useCallback(() => {
    setTransitionState("revealing")
    targetPathRef.current = null
    pendingHrefRef.current = null
    isCoveredRef.current = false

    // Curtains drop away to reveal the new page
    const timer = setTimeout(() => {
      setTransitionState("idle")
      setIsTransitioning(false)
      isNavigatingRef.current = false
    }, 420)

    return () => clearTimeout(timer)
  }, [])

  // SYNCHRONIZATION EFFECT: Listen to pathname change
  // When pathname matches the target route, the new page is now 100% mounted!
  React.useEffect(() => {
    if (
      targetPathRef.current &&
      pathname === targetPathRef.current &&
      (transitionState === "covering" || isCoveredRef.current)
    ) {
      // Small double RAF to guarantee the browser painted the new page before curtains part
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          triggerReveal()
        })
      })
    }
  }, [pathname, transitionState, triggerReveal])

  const navigate = React.useCallback(
    (href: string, title?: string, style: TransitionStyle = "columns") => {
      // Don't restart if already transitioning
      if (isNavigatingRef.current) return

      const cleanPath = href.split("?")[0].split("#")[0] || "/"
      if (cleanPath === pathname && !href.includes("#")) return

      isNavigatingRef.current = true
      isCoveredRef.current = false
      setIsTransitioning(true)
      setActiveStyle(style)
      setTargetTitle(title || inferTitle(href))
      targetPathRef.current = cleanPath
      pendingHrefRef.current = href
      setTransitionState("covering")

      // Snappy cover animation: ~340ms to close fully
      setTimeout(() => {
        isCoveredRef.current = true

        // Push new route in React Transition
        React.startTransition(() => {
          router.push(href)
        })

        // If navigating on same pathname (e.g. hash link), pathname won't change
        if (cleanPath === pathname) {
          setTimeout(() => {
            triggerReveal()
          }, 80)
        }

        // Safety fallback: if router takes longer than 1200ms or fails, force reveal
        setTimeout(() => {
          if (isNavigatingRef.current && targetPathRef.current) {
            triggerReveal()
          }
        }, 1200)
      }, 340)
    },
    [pathname, router, triggerReveal]
  )

  const numColumns = 5
  const columns = Array.from({ length: numColumns }, (_, i) => i)

  return (
    <TransitionContext.Provider value={{ navigate, isTransitioning }}>
      {children}

      {/* CURTAIN OVERLAY (Fixed layer above everything) */}
      <AnimatePresence mode="wait">
        {transitionState !== "idle" && (
          <div
            className="fixed inset-0 z-[999999] pointer-events-none select-none overflow-hidden"
            aria-hidden="true"
          >
            {/* Style 1: Staggered Architectural Shutter Columns (Default) */}
            {activeStyle === "columns" && (
              <div className="absolute inset-0 flex w-full h-full">
                {columns.map((colIndex) => {
                  const delay =
                    transitionState === "covering"
                      ? colIndex * 0.025
                      : (numColumns - 1 - colIndex) * 0.025

                  return (
                    <motion.div
                      key={colIndex}
                      initial={{ y: "-100%" }}
                      animate={
                        transitionState === "covering"
                          ? { y: "0%" }
                          : { y: "100%" }
                      }
                      transition={{
                        duration: 0.34,
                        delay,
                        ease: LUXURY_EASE,
                      }}
                      className="relative h-full flex-1 bg-[#09090c] border-r border-white/[0.04] will-change-transform"
                    >
                      {/* Leading edge warm gold light leak line */}
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/20 via-amber-400/90 to-amber-500/20 shadow-[0_2px_16px_rgba(245,176,65,0.7)]" />
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Style 2: Smooth Monolithic Curtain */}
            {activeStyle === "curtain" && (
              <motion.div
                initial={{ y: "-100%" }}
                animate={
                  transitionState === "covering"
                    ? { y: "0%" }
                    : { y: "100%" }
                }
                transition={{
                  duration: 0.36,
                  ease: LUXURY_EASE,
                }}
                className="absolute inset-0 bg-[#09090c] will-change-transform"
              >
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_4px_24px_rgba(245,176,65,0.8)]" />
              </motion.div>
            )}

            {/* Style 3: Theatre Stage Doors Split */}
            {activeStyle === "doors" && (
              <div className="absolute inset-0 flex w-full h-full">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={
                    transitionState === "covering"
                      ? { x: "0%" }
                      : { x: "-100%" }
                  }
                  transition={{
                    duration: 0.34,
                    ease: LUXURY_EASE,
                  }}
                  className="w-1/2 h-full bg-[#09090c] border-r border-amber-500/40 will-change-transform"
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={
                    transitionState === "covering"
                      ? { x: "0%" }
                      : { x: "100%" }
                  }
                  transition={{
                    duration: 0.34,
                    ease: LUXURY_EASE,
                  }}
                  className="w-1/2 h-full bg-[#09090c] border-l border-amber-500/40 will-change-transform"
                />
              </div>
            )}

            {/* Centered Cinema Film Slate Emblem */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={
                transitionState === "covering"
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 1.03 }
              }
              transition={{
                duration: 0.22,
                delay: transitionState === "covering" ? 0.12 : 0,
                ease: "easeOut",
              }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none"
            >
              <div className="px-8 py-6 rounded-3xl border border-amber-500/20 bg-black/75 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] text-center space-y-3 max-w-md w-full">
                {/* Top Eyebrow */}
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500 font-bold">
                  <Sparkles className="size-3 text-amber-400" />
                  <span>Murdjadjo Cinema</span>
                </div>

                {/* Dynamic Destination Title */}
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-sans">
                  {targetTitle}
                </h2>

                {/* Bottom Film Technical Stamp */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>THEATRICAL FEATURE</span>
                  </span>
                  <span>24 FPS · DOLBY ATMOS</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  )
}
