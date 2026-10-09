"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressiveBlurProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "top" | "bottom" | "left" | "right";
  width?: string | number;
  height?: string | number;
  blurMax?: number;
}

export function ProgressiveBlur({
  position = "right",
  width = "100%",
  height = "100%",
  blurMax = 16,
  className,
  style,
  ...props
}: ProgressiveBlurProps) {
  const gradientDirection =
    position === "top"
      ? "to top"
      : position === "bottom"
      ? "to bottom"
      : position === "left"
      ? "to left"
      : "to right";

  return (
    <div
      className={cn("pointer-events-none relative overflow-hidden", className)}
      style={{
        width,
        height,
        maskImage: `linear-gradient(${gradientDirection}, black 20%, transparent 100%)`,
        WebkitMaskImage: `linear-gradient(${gradientDirection}, black 20%, transparent 100%)`,
        backdropFilter: `blur(${blurMax}px)`,
        WebkitBackdropFilter: `blur(${blurMax}px)`,
        ...style,
      }}
      {...props}
    >
      <div
        className="w-full h-full"
        style={{
          background: `linear-gradient(${gradientDirection}, var(--color-bg-base, #060608) 25%, transparent 100%)`,
        }}
      />
    </div>
  );
}

export default ProgressiveBlur;
