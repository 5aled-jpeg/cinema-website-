"use client"

// A portfolio index built as a wheel you turn.
//
// At rest the work sits in a ring around a title, each card tangent to the
// circle. The first notch of scroll blows the ring open into a vertical drum:
// the card at the front lies flat and full size, the ones above and below
// rotate away into hard perspective and run off the top and bottom of the
// frame. Keep turning and the drum carries the next piece round to the front.
//
// UNIFIED TIMELINE:
// 1. Hero Page (t = 0): 3D Experience Hero with Liquid WebGL & Monolith
//    * Transition to Part 2 (t: 0 -> 1): 3D Perspective Card Stacking:
//      - Hero scales [1 -> 0.8], rotates [0 -> -5deg], dims [1 -> 0.25]
//      - Works Wheel slides up [100% -> 0%], scales [0.8 -> 1], rotates [5deg -> 0deg]
// 2. Works Wheel (t = 1 .. count): Interactive 3D film carousel
// 3. Cinema Footer (t = count + 1): Smooth curtain reveal underneath
// Zero native scrollbars, zero skips or jumps.
import * as React from "react"

import { cn } from "@/lib/utils"
import MouseTiltCard from "@/ui/components/cards/MouseTiltCard"
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
import { TextReveal } from "@/components/velora/text-reveal"
import { Film, Plus, Star, Sparkles } from "lucide-react"

export interface FilmStill {
  url: string
  caption?: string
  aspectRatio?: string
}

export interface FilmScreeningSlot {
  time: string
  date: string
  format: string
  auditorium: string
  availability: "Selling Fast" | "Available" | "Few Seats Left"
}

export interface WorksWheelItem {
  id?: string | number
  /** Project name. Shown beside the front card and in the index. */
  title: string
  /** Cover art. Any src an <img> takes. */
  image: string
  /** Where the card links to. Omit for a wheel that only browses. */
  href?: string
  /** Film category / genres */
  category?: string
  /** Film rating from IMDb */
  imdbRating?: string
  /** Film director */
  director?: string
  /** Release year */
  year?: number | string
  /** Film runtime / duration */
  duration?: string
  /** Tagline */
  tagline?: string
  /** Editorial synopsis */
  synopsis?: string
  /** Archival & production film stills */
  stills?: FilmStill[]
  /** Upcoming screening times */
  screenings?: string[]
  /** Detailed screening time slots */
  screeningSlots?: FilmScreeningSlot[]
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[]
  /** Sits in the middle of the ring. @default undefined */
  label?: string
  /** Label on the card's hover affordance. Omit to drop it. @default undefined */
  action?: string
  /** Optional Experience Hero section shown at t = 0 */
  hero?: React.ReactNode
  /** Optional sticky curtain reveal footer shown after the wheel completes */
  footer?: React.ReactNode
  /** Optional navigation menu anchored to the bottom-left of the stage */
  menu?: React.ReactNode
  /** Optional callback when an active film card is clicked */
  onItemClick?: (item: WorksWheelItem, index: number) => void
  /** Optional callback to discover all films in repository */
  onDiscoverAll?: () => void
  /** Optional callback fired when timeline position or active card changes */
  onTurnChange?: (turn: number, activeIndex: number) => void
}

export interface WorksWheelHandle {
  to: (target: number) => void
  getTarget: () => number
}

/* Geometry optimized for authentic 2:3 portrait theatrical posters (full image backgrounds without cropping) */
const CARD_H = 0.54 // front card height, ratio of stage
const CARD_MAX_W = 0.38 // max width ratio of stage
const CARD_RATIO = 0.68 // card width / height (exact 2:3 cinematic theatrical poster aspect ratio)
const STEP = 36 // degrees between cards on the drum (360 / 10 = 36)
const DRUM = 2.05 // drum radius, in card heights
const LENS = 2.8 // perspective distance
const RING_R = 1.15 // ring radius
const BOW = 1.6
const TITLE = 0.085 // ring label and front-card title
const INDEX = 0.036 // index down the right-hand side
const CULL = 1.8

const WHEEL_UNITS = 650
const DRAG_UNITS = 350
const SETTLE = 220
const EASE = 0.18

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

type Stage = { w: number; h: number }

const rad = (deg: number) => (deg * Math.PI) / 180
const bowAt = (drumDeg: number, bow: number) => -bow * (1 - Math.cos(rad(drumDeg)))

function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  )
}

export const WorksWheel = React.forwardRef<WorksWheelHandle, WorksWheelProps>(
  function WorksWheel(
    {
      items,
      label = "Works '26",
      action = "View",
      hero,
      footer,
      menu,
      onItemClick,
      onDiscoverAll,
      onTurnChange,
      className,
      ...props
    },
    ref
  ) {
    const containerRef = React.useRef<HTMLElement>(null)
    const heroRef = React.useRef<HTMLDivElement>(null)
    const mainStageRef = React.useRef<HTMLDivElement>(null)
    const footerRef = React.useRef<HTMLDivElement>(null)
    const stageRef = React.useRef<HTMLDivElement>(null)
    const wheelRef = React.useRef<HTMLDivElement>(null)
    const cardRefs = React.useRef<(HTMLElement | null)[]>([])
    const overlayRefs = React.useRef<(HTMLDivElement | null)[]>([])
    const labelRef = React.useRef<HTMLDivElement>(null)
    const titleRef = React.useRef<HTMLDivElement>(null)
    const indexRef = React.useRef<HTMLOListElement>(null)
    const metaRef = React.useRef<HTMLDivElement>(null)
    const menuWrapperRef = React.useRef<HTMLDivElement>(null)
    const onTurnChangeRef = React.useRef(onTurnChange)
    onTurnChangeRef.current = onTurnChange

    // Initial timeline starts at 0 (Hero section)
    const turn = React.useRef(0)
    const target = React.useRef(0)
    const [active, setActive] = React.useState(0)
    const activeRef = React.useRef(0)
    const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 })

    // Performance: tracks whether hero is visible to pause Three.js when off-screen
    const heroActiveRef = React.useRef(true)

    const frameRef = React.useRef(0)

    const count = items.length
    const last = Math.max(count - 1, 0)
    // Timeline extends to count + 1 when footer is present
    const maxTarget = footer ? count + 1 : count
    const hasHero = Boolean(hero)

    const [isLanded, setIsLanded] = React.useState(!hasHero)
    const isLandedRef = React.useRef(!hasHero)

    const [reduced, setReduced] = React.useState(false)
    React.useEffect(() => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)")
      const read = () => setReduced(query.matches)
      read()
      query.addEventListener("change", read)
      return () => query.removeEventListener("change", read)
    }, [])

    const metrics = React.useMemo(() => {
      const { w, h } = stage
      const isMobile = w > 0 && w < 640
      const cardMaxW = isMobile ? 0.74 : CARD_MAX_W
      const cardHRatio = isMobile ? 0.50 : CARD_H
      const cardW = Math.min(h * cardHRatio * CARD_RATIO, w * cardMaxW)
      const cardH = cardW / CARD_RATIO
      const drumR = cardH * DRUM
      const ringR = cardH * RING_R
      const ringScale = count
        ? clamp(((2 * Math.PI * ringR) / count) * 0.78 / (cardW || 1), 0.2, 0.95)
        : 1
      return {
        cardW,
        cardH,
        ringR,
        ringScale,
        drumR,
        bow: cardH * BOW,
        depth: cardH * LENS,
        title: cardH * (isMobile ? 0.08 : TITLE),
        index: cardH * INDEX,
        isMobile,
      }
    }, [stage, count])

    const metricsRef = React.useRef(metrics)
    metricsRef.current = metrics

    const drawRef = React.useRef<() => void>(() => {})

    const draw = React.useCallback(() => {
      const gap = target.current - turn.current
      if (Math.abs(gap) < 0.0005) {
        turn.current = target.current
      } else {
        turn.current += gap * (reduced ? 1 : EASE)
        frameRef.current = requestAnimationFrame(() => drawRef.current())
      }

      const t = turn.current
      const m = clamp(t, 0, 1)
      const pos = clamp(t - 1, 0, last)

      // Track landing on Works Wheel: activates once stage is in view (t >= 0.7)
      const landed = hasHero ? t >= 0.7 : true
      if (landed !== isLandedRef.current) {
        isLandedRef.current = landed
        setIsLanded(landed)
      }

      // Throttle hero Three.js when scrolling past 0.05 to dedicate full GPU to transition
      const isHeroVisible = t < 0.05
      if (isHeroVisible !== heroActiveRef.current) {
        heroActiveRef.current = isHeroVisible
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("cinema-hero-active", {
              detail: { active: isHeroVisible },
            })
          )
        }
      }

      const { ringR, ringScale, drumR, bow } = metricsRef.current

      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos
        const card = cardRefs.current[i]
        if (card) {
          // Card culling: during hero transition (m < 0.7), render at most first 2 cards to save 80% 3D GPU load
          const isHidden = (m < 0.7 && i > 1) || (m >= 0.7 && Math.abs(d) > CULL)
          if (isHidden) {
            card.style.display = "none"
          } else {
            card.style.display = "block"
            const drumDeg = d * STEP
            card.style.transform = place(
              d * (360 / count),
              drumDeg,
              ringR,
              drumR,
              bow,
              m
            )
            card.style.opacity = "1"
            card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2))
            const face = card.firstElementChild as HTMLElement | null
            if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`

            // Ambient depth shadow on background cards: increases as cards recede into 3D background
            const overlay = overlayRefs.current[i]
            if (overlay) {
              const depthShadow = clamp(Math.abs(d) * 0.52 * m, 0, 0.72)
              overlay.style.opacity = String(depthShadow)
            }
          }
        }
      }

      const near = clamp(Math.round(pos), 0, last)
      if (activeRef.current !== near) {
        activeRef.current = near
        setActive(near)
      }
      onTurnChangeRef.current?.(t, near)

      // 1. Hardware-Accelerated Perspective Stacking Transition between Hero and Works Wheel (t: 0 -> 1)
      if (heroRef.current && mainStageRef.current) {
        if (t < 0.01) {
          // Hero rest state: hide stage completely from browser compositor to eliminate 100% background GPU/CPU overhead
          mainStageRef.current.style.visibility = "hidden"
          mainStageRef.current.style.transform = "translate3d(0, 100%, 0)"

          heroRef.current.style.transform = "scale3d(1, 1, 1)"
          heroRef.current.style.opacity = "1"
          heroRef.current.style.visibility = "visible"
          heroRef.current.style.pointerEvents = "auto"

          if (footerRef.current) {
            footerRef.current.style.pointerEvents = "none"
            footerRef.current.style.visibility = "hidden"
          }
        } else if (t < 1) {
          mainStageRef.current.style.visibility = "visible"
          const p = clamp(t, 0, 1)

          // Section 1 (Hero): scale [1 -> 0.92], fade [1 -> 0.35] (Pure GPU composite, zero main-thread repaint)
          const heroScale = lerp(1, 0.92, p)
          const heroOpacity = lerp(1, 0.35, p)

          heroRef.current.style.transform = `scale3d(${heroScale}, ${heroScale}, 1)`
          heroRef.current.style.opacity = String(heroOpacity)
          heroRef.current.style.visibility = "visible"
          heroRef.current.style.pointerEvents = p > 0.35 ? "none" : "auto"

          // Section 2 (Works Wheel Stage): translateY [100% -> 0%] with hardware-composited translate3d
          const stageY = (1 - p) * 100
          mainStageRef.current.style.transform = `translate3d(0, ${stageY}%, 0)`

          if (footerRef.current) {
            footerRef.current.style.pointerEvents = "none"
            footerRef.current.style.visibility = "hidden"
          }
        } else {
          mainStageRef.current.style.visibility = "visible"
          // Once t >= 1, Hero is hidden behind the stage
          heroRef.current.style.visibility = "hidden"
          heroRef.current.style.pointerEvents = "none"

          // 2. Footer Curtain Reveal (t: count -> count + 1): lifts mainStageRef upwards
          if (footerRef.current && t > count) {
            const footerProgress = clamp(t - count, 0, 1)
            const footerH = footerRef.current.clientHeight || 360
            mainStageRef.current.style.transform = `translate3d(0, ${-footerProgress * footerH}px, 0)`

            footerRef.current.style.pointerEvents = footerProgress > 0.1 ? "auto" : "none"
            footerRef.current.style.visibility = footerProgress > 0 ? "visible" : "hidden"
          } else {
            mainStageRef.current.style.transform = "translate3d(0, 0px, 0)"
            if (footerRef.current) {
              footerRef.current.style.pointerEvents = "none"
              footerRef.current.style.visibility = "hidden"
            }
          }
        }
      }

      // Works wheel UI fade: hidden on hero, fades in as stage settles
      const wheelUIFade = hasHero ? clamp((t - 0.4) / 0.6, 0, 1) : 1

      if (labelRef.current) labelRef.current.style.opacity = String((1 - m) * wheelUIFade)
      if (titleRef.current) titleRef.current.style.opacity = String(m * wheelUIFade)

      const footerProgress = clamp(t - count, 0, 1)
      const sideFade = String(Math.max(0, wheelUIFade * (1 - footerProgress * 2)))

      if (metaRef.current) {
        metaRef.current.style.opacity = sideFade
        metaRef.current.style.pointerEvents = (footerProgress > 0.5 || t < 0.5) ? "none" : "auto"
      }
      if (indexRef.current) {
        indexRef.current.style.opacity = sideFade
        indexRef.current.style.pointerEvents = (footerProgress > 0.5 || t < 0.5) ? "none" : "auto"
      }
    }, [count, last, reduced, hasHero])

    drawRef.current = draw

    const scheduleDraw = React.useCallback(() => {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = requestAnimationFrame(() => drawRef.current())
    }, [])

    const to = React.useCallback(
      (next: number) => {
        target.current = clamp(next, 0, maxTarget)
        scheduleDraw()
      },
      [maxTarget, scheduleDraw]
    )

    React.useImperativeHandle(
      ref,
      () => ({
        to,
        getTarget: () => target.current,
      }),
      [to]
    )

    React.useEffect(() => {
      const el = stageRef.current
      if (!el) return
      const read = () => {
        const w = el.clientWidth
        const h = el.clientHeight
        setStage((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
        scheduleDraw()
      }
      read()
      const ro = new ResizeObserver(read)
      ro.observe(el)
      return () => ro.disconnect()
    }, [scheduleDraw])

    // Mount & stage dimensions initial draw
    React.useEffect(() => {
      scheduleDraw()
      return () => cancelAnimationFrame(frameRef.current)
    }, [scheduleDraw])

    React.useEffect(() => {
      if (!stage.h) return
      scheduleDraw()
    }, [stage.h, scheduleDraw])

    const settling = React.useRef(0)
    const drag = React.useRef<{ x: number; y: number } | null>(null)
    const pointerStartRef = React.useRef<{ x: number; y: number; id: number } | null>(null)
    const isDraggingRef = React.useRef(false)
    const isModalOpenRef = React.useRef(false)

    // Wheel event listener across the entire window
    React.useEffect(() => {
      const onWheel = (event: WheelEvent) => {
        const targetEl = event.target as HTMLElement | null

        // 1. Check if the mouse wheel event occurred inside any open modal drawer or dialog
        const isOverModal = Boolean(
          targetEl?.closest('[role="dialog"]') ||
          targetEl?.closest('.dialog-scroll-container') ||
          targetEl?.closest('[data-dialog-scroll="true"]') ||
          targetEl?.closest('[data-dialog-container]')
        )

        // 2. Check if any dialog is currently active in the page
        const isModalActive =
          isModalOpenRef.current ||
          document.body.getAttribute('data-dialog-open') === 'true' ||
          Boolean(document.querySelector('[role="dialog"]')) ||
          document.body.style.overflow === "hidden"

        // If hovering over the modal drawer, DO NOT call event.preventDefault() and DO NOT rotate the wheel!
        // This allows the modal drawer content to scroll natively, smoothly, and responsively!
        if (isOverModal) {
          return
        }

        // If a modal is open but user is scrolling outside (e.g. over backdrop),
        // prevent page scrolling but do NOT turn the background 3D wheel.
        if (isModalActive) {
          event.preventDefault()
          return
        }

        event.preventDefault()
        const next = target.current + event.deltaY / WHEEL_UNITS
        to(next)
        window.clearTimeout(settling.current)
        settling.current = window.setTimeout(
          () => to(Math.round(target.current)),
          SETTLE
        )
      }

      window.addEventListener("wheel", onWheel, { passive: false })
      return () => {
        window.removeEventListener("wheel", onWheel)
        window.clearTimeout(settling.current)
      }
    }, [to])

    // Keyboard navigation (Arrow keys, PageUp/Down)
    React.useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          return
        }

        const isModalActive =
          isModalOpenRef.current ||
          document.body.getAttribute('data-dialog-open') === 'true' ||
          Boolean(document.querySelector('[role="dialog"]')) ||
          document.body.style.overflow === "hidden"

        if (isModalActive) {
          return
        }

        if (event.key === "ArrowDown" || event.key === "PageDown") {
          event.preventDefault()
          to(Math.round(target.current) + 1)
        } else if (event.key === "ArrowUp" || event.key === "PageUp") {
          event.preventDefault()
          to(Math.round(target.current) - 1)
        }
      }
      window.addEventListener("keydown", onKeyDown)
      return () => window.removeEventListener("keydown", onKeyDown)
    }, [to])

    // Global mobile touch gesture handling across the unified timeline (Hero, Wheel, Footer)
    React.useEffect(() => {
      let touchStartY = 0
      let touchStartX = 0
      let isTouching = false

      const onTouchStart = (e: TouchEvent) => {
        const targetEl = e.target as HTMLElement | null
        const isOverModal = Boolean(
          targetEl?.closest('[role="dialog"]') ||
          targetEl?.closest('.dialog-scroll-container') ||
          targetEl?.closest('[data-dialog-scroll="true"]') ||
          targetEl?.closest('[data-dialog-container]')
        )
        const isModalActive =
          isModalOpenRef.current ||
          document.body.getAttribute('data-dialog-open') === 'true' ||
          Boolean(document.querySelector('[role="dialog"]'))

        if (isOverModal || isModalActive) return

        if (e.touches.length === 1) {
          touchStartY = e.touches[0].clientY
          touchStartX = e.touches[0].clientX
          isTouching = true
        }
      }

      const onTouchMove = (e: TouchEvent) => {
        if (!isTouching || e.touches.length !== 1) return

        const targetEl = e.target as HTMLElement | null
        const isOverModal = Boolean(
          targetEl?.closest('[role="dialog"]') ||
          targetEl?.closest('.dialog-scroll-container') ||
          targetEl?.closest('[data-dialog-scroll="true"]') ||
          targetEl?.closest('[data-dialog-container]')
        )
        const isModalActive =
          isModalOpenRef.current ||
          document.body.getAttribute('data-dialog-open') === 'true' ||
          Boolean(document.querySelector('[role="dialog"]'))

        if (isOverModal || isModalActive) return

        const currentY = e.touches[0].clientY
        const currentX = e.touches[0].clientX
        const deltaY = touchStartY - currentY
        const deltaX = touchStartX - currentX

        const delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX

        if (Math.abs(delta) > 5) {
          isDraggingRef.current = true
          if (e.cancelable) e.preventDefault()
          const step = delta / DRAG_UNITS
          to(target.current + step)
          touchStartY = currentY
          touchStartX = currentX
        }
      }

      const onTouchEnd = () => {
        if (isTouching) {
          isTouching = false
          if (isDraggingRef.current) {
            to(Math.round(target.current))
            setTimeout(() => {
              isDraggingRef.current = false
            }, 80)
          }
        }
      }

      window.addEventListener("touchstart", onTouchStart, { passive: true })
      window.addEventListener("touchmove", onTouchMove, { passive: false })
      window.addEventListener("touchend", onTouchEnd, { passive: true })
      window.addEventListener("touchcancel", onTouchEnd, { passive: true })

      return () => {
        window.removeEventListener("touchstart", onTouchStart)
        window.removeEventListener("touchmove", onTouchMove)
        window.removeEventListener("touchend", onTouchEnd)
        window.removeEventListener("touchcancel", onTouchEnd)
      }
    }, [to])

    const activeItem = items[active]

    return (
      <section
        ref={containerRef}
        aria-label={label}
        className={cn(
          "relative h-screen w-screen overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)] select-none [perspective:1400px] transition-colors duration-400",
          className
        )}
        {...props}
      >
        {/* Bento Grid Film Texture Mask */}
        <div className="fixed inset-0 pointer-events-none bento-mask opacity-10 z-[100]" />

        {/* 3. Pinned Footer sitting underneath the stage (z-0) */}
        {footer && (
          <div
            ref={footerRef}
            className="absolute bottom-0 left-0 w-full z-0 pointer-events-none"
            style={{ visibility: "hidden" }}
          >
            {footer}
          </div>
        )}

        {/* 1. Hero Layer (z-10): starts at t = 0, scales down [1 -> 0.92] as works wheel sweeps in */}
        {hero && (
          <div
            ref={heroRef}
            className="absolute inset-0 z-10 w-full h-full will-change-transform origin-center overflow-hidden pointer-events-auto"
          >
            {hero}
          </div>
        )}

        {/* 2. Main Stage (z-20): slides up [100% -> 0%] over the receded Hero, then turns 3D drum */}
        <div
          ref={mainStageRef}
          className="relative z-20 w-full h-full bg-[var(--color-bg-base)] border-t border-white/10 dark:border-white/10 shadow-[0_-16px_40px_rgba(0,0,0,0.45)] will-change-transform origin-center overflow-hidden"
          style={{
            visibility: hasHero ? "hidden" : "visible",
            transform: hasHero
              ? "translate3d(0, 100%, 0)"
              : "translate3d(0, 0px, 0)",
          }}
        >
          <div
            ref={stageRef}
            tabIndex={0}
            role="listbox"
            aria-label={label}
            aria-activedescendant={`works-wheel-${active}`}
            className="focus-visible:outline-[var(--color-text-primary)] absolute inset-0 cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 active:cursor-grabbing"
            style={{ perspective: `${metrics.depth}px` }}
            onPointerDown={(event) => {
              if (event.pointerType === "touch") return
              pointerStartRef.current = {
                x: event.clientX,
                y: event.clientY,
                id: event.pointerId,
              }
              drag.current = { x: event.clientX, y: event.clientY }
              isDraggingRef.current = false
            }}
            onPointerMove={(event) => {
              if (event.pointerType === "touch") return
              if (drag.current === null || !pointerStartRef.current) return

              const dx = Math.abs(event.clientX - pointerStartRef.current.x)
              const dy = Math.abs(event.clientY - pointerStartRef.current.y)

              if (!isDraggingRef.current) {
                if (Math.hypot(dx, dy) > 6) {
                  isDraggingRef.current = true
                  try {
                    event.currentTarget.setPointerCapture(event.pointerId)
                  } catch {
                    // Ignore capture errors on unsupported pointers
                  }
                }
              }

              if (isDraggingRef.current) {
                const stepX = drag.current.x - event.clientX
                const stepY = drag.current.y - event.clientY
                // Support both horizontal and vertical swipes
                const step = Math.abs(stepX) > Math.abs(stepY) ? stepX : stepY
                to(target.current + step / DRAG_UNITS)
                drag.current = { x: event.clientX, y: event.clientY }
              }
            }}
            onPointerUp={(event) => {
              if (event.pointerType === "touch") return
              if (isDraggingRef.current) {
                if (
                  pointerStartRef.current &&
                  event.currentTarget.hasPointerCapture(pointerStartRef.current.id)
                ) {
                  try {
                    event.currentTarget.releasePointerCapture(pointerStartRef.current.id)
                  } catch {
                    // Ignore if already released
                  }
                }
                to(Math.round(target.current))
              }
              drag.current = null
              pointerStartRef.current = null
              setTimeout(() => {
                isDraggingRef.current = false
              }, 50)
            }}
            onPointerCancel={(event) => {
              if (event.pointerType === "touch") return
              if (
                pointerStartRef.current &&
                event.currentTarget.hasPointerCapture(pointerStartRef.current.id)
              ) {
                try {
                  event.currentTarget.releasePointerCapture(pointerStartRef.current.id)
                } catch {
                  // Ignore
                }
              }
              drag.current = null
              pointerStartRef.current = null
              isDraggingRef.current = false
              to(Math.round(target.current))
            }}
          >
            {/* Ambient ground shadow beneath carousel cards - GPU-accelerated static radial gradient */}
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 rounded-full -z-10"
              style={{
                width: Math.max(metrics.cardW * 2.2, 300),
                height: Math.max(metrics.cardH * 1.2, 160),
                transform: "translate(-50%, -35%)",
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 45%, transparent 72%)",
              }}
            />

            <div
              ref={wheelRef}
              className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
            >
              {items.map((item, i) => {
                return (
                  <div
                    key={item.title}
                    id={`works-wheel-${i}`}
                    data-cursor-interactive="true"
                    data-cursor-label={i === active ? "Details" : "Focus"}
                    ref={(node: HTMLElement | null) => {
                      cardRefs.current[i] = node
                    }}
                    className="group absolute [backface-visibility:hidden] select-none"
                    style={{
                      width: metrics.cardW,
                      height: metrics.cardH,
                      marginLeft: -metrics.cardW / 2,
                      marginTop: -metrics.cardH / 2,
                    }}
                  >
                    <Dialog
                      transition={{
                        type: "spring",
                        bounce: 0.05,
                        duration: 0.5,
                      }}
                      onOpenChange={(open) => {
                        isModalOpenRef.current = open
                      }}
                    >
                      <MouseTiltCard
                        tiltIntensity={12}
                        scale={1.03}
                        glareIntensity={0.12}
                        className="size-full"
                      >
                        <DialogTrigger
                          id={`works-wheel-trigger-${i}`}
                          style={{
                            borderRadius: "16px",
                          }}
                          className="relative block size-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] shadow-[0_16px_36px_-8px_rgba(0,0,0,0.45)] dark:shadow-[0_20px_48px_-10px_rgba(0,0,0,0.85)] transition-shadow duration-300 cursor-pointer"
                          onClick={(e) => {
                            if (isDraggingRef.current) {
                              e.preventDefault()
                              return
                            }

                            const isFront =
                              i === activeRef.current ||
                              i === active ||
                              Math.abs(turn.current - (i + 1)) < 0.35

                            if (!isFront) {
                              e.preventDefault()
                              to(i + 1)
                            } else {
                              onItemClick?.(item, i)
                            }
                          }}
                        >
                          <DialogImage
                            src={item.image}
                            alt={item.title}
                            className="size-full object-cover object-center"
                          />
                          {/* Ambient Depth Shadow for Background Cards */}
                          <div
                            ref={(node) => {
                              overlayRefs.current[i] = node
                            }}
                            className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-75"
                            style={{ opacity: 0 }}
                          />
                          {/* Inner Edge Bevel / Rim Lighting */}
                          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15 dark:ring-white/10" />

                          {/* Card Header & View Pill Reveal */}
                          <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between pointer-events-none">
                            <div className="translate-y-0.5 group-hover:translate-y-0 transition-transform duration-200">
                              <DialogTitle className="text-white font-serif font-semibold text-base sm:text-lg tracking-tight drop-shadow-sm">
                                {item.title}
                              </DialogTitle>
                              {item.category && (
                                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-amber-400/90 block mt-0.5">
                                  {item.category.split("·")[0].trim()} {item.imdbRating ? `· ★ ${item.imdbRating}` : ''}
                                </span>
                              )}
                            </div>

                            {/* Restored classic 'View' pill affordance — permanently visible on mobile, hover-revealed on desktop */}
                            {action && (
                              <span
                                className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white/85 dark:bg-black/85 px-3 py-1.5 text-[0.72rem] font-medium text-[var(--color-text-primary)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-md backdrop-saturate-150 transition-all duration-200 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                              >
                                <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
                                  <path
                                    d="M3 9 9 3M4 3h5v5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                {action}
                              </span>
                            )}
                          </div>
                        </DialogTrigger>
                      </MouseTiltCard>

                      {/* Linear App Animated Modal Container & Content */}
                      <DialogContainer
                        className="pt-12 sm:pt-16 pb-8"
                        overlayClassName="dark:bg-black/85 bg-black/75 backdrop-blur-md"
                      >
                        <DialogContent
                          style={{
                            borderRadius: "24px",
                          }}
                          className="relative flex flex-col w-[92%] sm:w-[90%] lg:w-[920px] max-h-[88vh] mx-auto overflow-hidden rounded-[24px] border border-black/10 dark:border-white/10 bg-[var(--color-bg-base)] text-[var(--color-text-primary)] shadow-2xl"
                        >
                          {/* Top Close Button with Esc Hint - Always accessible */}
                          <div className="absolute right-5 top-5 z-30 flex items-center gap-2">
                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-medium border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 text-neutral-500 dark:text-neutral-400">
                              ESC
                            </span>
                            <DialogClose className="static size-8.5 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl text-neutral-800 dark:text-neutral-200 hover:scale-105 active:scale-95 transition-all" />
                          </div>

                          {/* Scrollable Container with native smooth scrolling & overscroll containment */}
                          <div
                            data-dialog-scroll="true"
                            className="dialog-scroll-container overflow-y-auto overflow-x-hidden w-full h-full overscroll-contain focus:outline-none"
                            tabIndex={0}
                          >
                            {/* Modal Image Reveal */}
                            <div className="relative w-full h-72 sm:h-80 md:h-96 shrink-0 overflow-hidden bg-neutral-900">
                              <DialogImage
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover object-center"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-transparent to-transparent" />
                              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-base)]/50 via-transparent to-transparent" />

                              {/* Badges in top-left */}
                              <div className="absolute top-5 left-5 z-10 flex flex-wrap items-center gap-2">
                                {item.category && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-black/50 dark:bg-white/10 backdrop-blur-md text-white border border-white/20">
                                    <Film className="size-3 text-amber-400" />
                                    {item.category.split("·")[0].trim()}
                                  </span>
                                )}
                                {item.imdbRating && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 backdrop-blur-md text-amber-400 border border-amber-500/30">
                                    <Star className="size-3 fill-amber-400" />
                                    IMDb {item.imdbRating}
                                  </span>
                                )}
                              </div>

                              {/* Bottom Title & Tagline in Hero Banner */}
                              <div className="absolute bottom-5 left-6 right-6 z-10">
                                <DialogTitle className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-[var(--color-text-primary)]">
                                  {item.title}
                                </DialogTitle>
                                {item.tagline && (
                                  <p className="mt-1.5 text-sm sm:text-base italic text-neutral-600 dark:text-neutral-400 font-serif">
                                    &ldquo;{item.tagline}&rdquo;
                                  </p>
                                )}
                                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono text-[var(--color-text-secondary)]">
                                  {item.director && (
                                    <span>
                                      Directed by <strong className="text-[var(--color-text-primary)] font-semibold">{item.director}</strong>
                                    </span>
                                  )}
                                  {item.year && <span>· {item.year}</span>}
                                  {item.duration && <span>· {item.duration}</span>}
                                </div>
                              </div>
                            </div>

                            {/* Framer Motion Description Transition with Elegant Reveal */}
                            <DialogDescription
                              disableLayoutAnimation
                              variants={{
                                initial: { opacity: 0, scale: 0.8, y: -40 },
                                animate: { opacity: 1, scale: 1, y: 0 },
                                exit: { opacity: 0, scale: 0.8, y: -50 },
                              }}
                            >
                              <FilmModalView film={item} />
                            </DialogDescription>
                          </div>
                        </DialogContent>
                      </DialogContainer>
                    </Dialog>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ring Title (Dead Center of the Ring) with Word-by-Word Blur Reveal */}
          <div
            ref={labelRef}
            className="pointer-events-none absolute inset-0 tracking-tight font-serif text-[var(--color-text-primary)]"
            style={{
              fontSize: metrics.title,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "grid",
              placeItems: "center",
            }}
          >
            {label && (
              <TextReveal
                text={label}
                className="font-serif tracking-tight drop-shadow-sm font-light"
                stagger={0.08}
                animateOnMount
              />
            )}
          </div>

          {/* Front-card Title & Tagline (Left-hand side) with Word-by-Word Blur Reveal - Desktop Only to prevent mobile overlap */}
          <div
            ref={titleRef}
            className="pointer-events-none absolute tracking-tight opacity-0 font-serif text-[var(--color-text-primary)] font-light max-w-sm sm:max-w-md select-none hidden md:block"
            style={{
              fontSize: metrics.title,
              top: "50%",
              left: "8%",
              transform: "translateY(-50%)",
            }}
          >
            {items[active] && (
              <div key={items[active].title} className="flex flex-col gap-1.5">
                <TextReveal
                  text={items[active].title}
                  as="h2"
                  className="font-serif leading-[1.05] tracking-tight drop-shadow-sm font-normal text-left"
                  stagger={0.05}
                  trigger={isLanded}
                  delay={0.1}
                />
                {items[active].tagline && (
                  <TextReveal
                    text={items[active].tagline}
                    as="p"
                    className="font-sans text-xs sm:text-sm tracking-normal text-[var(--color-text-tertiary)] italic font-light max-w-xs text-left"
                    delay={0.25}
                    stagger={0.035}
                    trigger={isLanded}
                  />
                )}
              </div>
            )}
          </div>

          {/* Index List (Top-Right Corner) - Desktop Only */}
          <ol
            ref={indexRef}
            className="absolute text-right leading-[1.75] transition-opacity duration-300 hidden md:block"
            style={{
              fontSize: metrics.index,
              top: "7.5%",
              right: "2.5%",
            }}
          >
            {items.map((item, i) => (
              <li key={item.title}>
                <button
                  type="button"
                  onClick={() => to(i + 1)}
                  className={cn(
                    "cursor-pointer transition-colors outline-none focus-visible:outline-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]",
                    i === active &&
                      target.current >= 0.5 &&
                      target.current < count + 0.5 &&
                      "text-[var(--color-text-primary)] font-semibold"
                  )}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ol>

          {/* Pure Text Metadata Block in the Circled Area - Desktop Only */}
          {activeItem && (
            <div
              ref={metaRef}
              className="pointer-events-none absolute text-right hidden md:flex flex-col items-end transition-opacity duration-300"
              style={{
                bottom: "2.5rem",
                right: "2.5%",
                maxWidth: "320px",
              }}
            >
              {/* Film Category */}
              {activeItem.category && (
                <span className="text-[12px] uppercase tracking-[0.25em] font-semibold text-[var(--color-text-tertiary)] mb-1">
                  {activeItem.category}
                </span>
              )}

              {/* Rating, Year, Duration */}
              <div className="flex items-center justify-end gap-2 text-sm font-mono text-[var(--color-text-secondary)] tabular-nums mb-1.5">
                {activeItem.imdbRating && (
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    IMDb {activeItem.imdbRating} ★
                  </span>
                )}
                {activeItem.year && <span>·</span>}
                {activeItem.year && <span>{activeItem.year}</span>}
                {activeItem.duration && <span>·</span>}
                {activeItem.duration && <span>{activeItem.duration}</span>}
              </div>

              {/* Directed by */}
              {activeItem.director && (
                <p className="text-sm text-[var(--color-text-secondary)] mb-3 leading-snug">
                  Directed by{" "}
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {activeItem.director}
                  </span>
                </p>
              )}

              {/* Upcoming Screenings */}
              {activeItem.screenings && activeItem.screenings.length > 0 && (
                <div className="pt-3 border-t border-[var(--color-border)] w-full flex flex-col items-end">
                  <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)] mb-1.5">
                    Upcoming Screenings
                  </span>
                  <div className="flex flex-col items-end gap-1 text-[13px] font-mono text-[var(--color-text-secondary)] tabular-nums">
                    {activeItem.screenings.map((screening, idx) => (
                      <span key={idx} className="leading-tight">
                        {screening}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Linear Card Film Details & Discover All Movies */}
              <div className="pointer-events-auto mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const trigger = document.getElementById(`works-wheel-trigger-${active}`)
                    if (trigger) {
                      trigger.click()
                    } else {
                      onItemClick?.(activeItem, active)
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer shadow-sm"
                >
                  <span>Explore Film Details</span>
                  <span aria-hidden="true">→</span>
                </button>
                {onDiscoverAll && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDiscoverAll()
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/60 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer backdrop-blur-sm"
                  >
                    <span>Discover All</span>
                    <span aria-hidden="true">↗</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MercuryMenu anchored in the bottom-left of the stage (Desktop only) */}
          {menu && (
            <div
              ref={menuWrapperRef}
              className="absolute bottom-8 left-8 z-40 transition-opacity duration-300 pointer-events-auto hidden md:block"
            >
              {menu}
            </div>
          )}


        </div>
      </section>
    )
  }
)

WorksWheel.displayName = "WorksWheel"
