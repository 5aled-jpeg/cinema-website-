"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface Schedule3DStageProps {
  children: React.ReactNode
  className?: string
}

export function Schedule3DStage({ children, className }: Schedule3DStageProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const bgRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Target rotation angles (degrees)
  const targetX = React.useRef(0)
  const targetY = React.useRef(0)

  // Current interpolated rotation angles (degrees)
  const currentX = React.useRef(0)
  const currentY = React.useRef(0)

  // Glow position percentages (0 to 100)
  const targetGlowX = React.useRef(50)
  const targetGlowY = React.useRef(30)
  const currentGlowX = React.useRef(50)
  const currentGlowY = React.useRef(30)

  const isTouchRef = React.useRef(false)
  const hasGyroRef = React.useRef(false)
  const gyroPermissionRequestedRef = React.useRef(false)
  const rafIdRef = React.useRef<number>(0)

  // Max tilt angle in degrees
  const MAX_TILT = 7.5

  // Animation frame render loop for buttery 120fps motion
  React.useEffect(() => {
    // Check reduced motion preference
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const loop = () => {
      // Smooth lerp damping
      currentX.current += (targetX.current - currentX.current) * 0.07
      currentY.current += (targetY.current - currentY.current) * 0.07

      currentGlowX.current += (targetGlowX.current - currentGlowX.current) * 0.07
      currentGlowY.current += (targetGlowY.current - currentGlowY.current) * 0.07

      // Apply 3D transform to background layer (full tilt for deep perspective)
      if (bgRef.current) {
        bgRef.current.style.transform = `scale(1.08) translate3d(0, 0, -50px) rotateX(${currentX.current.toFixed(
          2
        )}deg) rotateY(${currentY.current.toFixed(2)}deg)`

        // Update spotlight background position
        bgRef.current.style.setProperty("--glow-x", `${currentGlowX.current.toFixed(1)}%`)
        bgRef.current.style.setProperty("--glow-y", `${currentGlowY.current.toFixed(1)}%`)
      }

      rafIdRef.current = requestAnimationFrame(loop)
    }

    rafIdRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafIdRef.current)
  }, [])

  // Desktop Mouse Movement Listener
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isTouchRef.current) return

      const { innerWidth, innerHeight } = window
      if (!innerWidth || !innerHeight) return

      // Normalized coordinates from -1 to 1
      const normX = (e.clientX / innerWidth) * 2 - 1
      const normY = (e.clientY / innerHeight) * 2 - 1

      // 3D tilt: mouse moving right tilts scene right (rotateY positive), mouse moving down tilts scene down (rotateX negative)
      targetY.current = normX * MAX_TILT
      targetX.current = -normY * MAX_TILT

      // Glow spotlight position
      targetGlowX.current = (e.clientX / innerWidth) * 100
      targetGlowY.current = (e.clientY / innerHeight) * 100
    }

    const handleMouseLeave = () => {
      if (isTouchRef.current) return
      // Gently return to rest when cursor leaves window
      targetX.current = 0
      targetY.current = 0
      targetGlowX.current = 50
      targetGlowY.current = 30
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [MAX_TILT])

  // Mobile Device Orientation (Gyroscope / Accelerometer)
  React.useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return
      hasGyroRef.current = true
      isTouchRef.current = true

      // gamma: Left to right tilt in degrees [-90, 90]
      // beta: Front to back tilt in degrees [-180, 180] (typical holding angle ~45 deg)
      const gamma = Math.max(-45, Math.min(45, e.gamma))
      const beta = Math.max(10, Math.min(80, e.beta)) - 45 // offset by normal 45deg reading angle

      // Map to 3D rotation angles
      targetY.current = (gamma / 45) * (MAX_TILT * 1.5)
      targetX.current = -(beta / 35) * (MAX_TILT * 1.5)

      // Shift ambient glow with phone rotation
      targetGlowX.current = 50 + (gamma / 45) * 35
      targetGlowY.current = 50 + (beta / 35) * 35
    }

    // Request gyroscope permission on iOS 13+ on first user tap/touch
    const requestPermission = async () => {
      if (gyroPermissionRequestedRef.current) return
      gyroPermissionRequestedRef.current = true

      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
          .requestPermission === "function"
      ) {
        try {
          const state = await (
            DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
          ).requestPermission()
          if (state === "granted") {
            window.addEventListener("deviceorientation", handleOrientation, { passive: true })
          }
        } catch {
          // If denied or dismissed, ignore
        }
      } else {
        // Standard Android / modern browsers without permission requirement
        window.addEventListener("deviceorientation", handleOrientation, { passive: true })
      }
    }

    window.addEventListener("touchstart", requestPermission, { once: true, passive: true })
    window.addEventListener("deviceorientation", handleOrientation, { passive: true })

    return () => {
      window.removeEventListener("touchstart", requestPermission)
      window.removeEventListener("deviceorientation", handleOrientation)
    }
  }, [MAX_TILT])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden [perspective:1400px]",
        className
      )}
    >
      {/* 3D ROTATING BACKGROUND CANVAS */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-16 z-0 will-change-transform transition-colors duration-500"
        style={
          {
            "--glow-x": "50%",
            "--glow-y": "30%",
            transformStyle: "preserve-3d",
          } as React.CSSProperties
        }
      >
        {/* Dynamic Specular Spotlight Glow following Cursor / Phone Rotation */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(850px circle at var(--glow-x) var(--glow-y), rgba(245, 176, 65, 0.12) 0%, rgba(217, 119, 6, 0.04) 35%, transparent 70%)",
          }}
        />

        {/* Ambient Dark/Light Chiaroscuro Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(245,158,11,0.06)_0%,transparent_75%)]" />

        {/* 3D Archival Geometric Grid & Film Sprocket Lines */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Floating 3D Bokeh Orbs placed in deep Z-space */}
        <div
          className="absolute top-1/4 left-10 size-72 rounded-full opacity-20 dark:opacity-25 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, transparent 70%)",
            transform: "translateZ(-80px)",
          }}
        />
        <div
          className="absolute bottom-1/3 right-12 size-96 rounded-full opacity-15 dark:opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.28) 0%, transparent 70%)",
            transform: "translateZ(-120px)",
          }}
        />
      </div>

      {/* Film Grain Texture Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 w-full h-full bg-[url('/noise.gif')] bg-repeat opacity-[0.04] dark:opacity-[0.05]"
      />

      {/* Content Stage (Clean, crisp 2D cards on top of 3D background) */}
      <div
        ref={contentRef}
        className="relative z-20 w-full"
      >
        {children}
      </div>
    </div>
  )
}

export default Schedule3DStage
