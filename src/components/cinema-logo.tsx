"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CinemaLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  alt?: string
}

export function CinemaLogo({
  size = "md",
  className,
  alt = "Cenima Logo",
  ...props
}: CinemaLogoProps) {
  const sizeClasses = {
    xs: "h-4 w-auto max-h-[18px]",
    sm: "h-5 w-auto max-h-[22px]",
    md: "h-7 w-auto max-h-[30px]",
    lg: "h-9 w-auto max-h-[40px]",
    xl: "h-12 w-auto max-h-[54px]",
  }

  return (
    <div
      className={cn("inline-flex items-center justify-center select-none", className)}
      {...props}
    >
      {/*
        Light mode: let it as it (original black logo on transparent background)
        Dark mode: turn it to white color via CSS brightness(0) and invert(1)
      */}
      <img
        src="/cenima-logo.png"
        alt={alt}
        className={cn(
          "object-contain transition-all duration-300 pointer-events-none",
          sizeClasses[size],
          "invert-0 dark:brightness-0 dark:invert"
        )}
      />
    </div>
  )
}

export default CinemaLogo
