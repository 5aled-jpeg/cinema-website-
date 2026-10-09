"use client";

import {
  type MotionValue,
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProgressiveBlur } from "./progressive-blur";

export type Poster = {
  id?: string | number;
  src: string;
  alt?: string;
  title?: string;
  category?: string;
  imdbRating?: string;
  director?: string;
  year?: number | string;
  duration?: string;
  tagline?: string;
  synopsis?: string;
  stills?: any[];
};

export type MagazineScrollerSpringConfig = {
  stiffness?: number;
  damping?: number;
  mass?: number;
  visualDuration?: number;
  bounce?: number;
};

export type MagazineScrollerProps = {
  images?: Poster[];
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
  slices?: number;
  height?: number | string;
  wheelSpeed?: number;
  dragSpeed?: number;
  autoSpeed?: number;
  bendStrength?: number;
  maxBend?: number;
  lockWheel?: boolean;
  positionSpring?: MagazineScrollerSpringConfig;
  velocitySpring?: MagazineScrollerSpringConfig;
  onItemClick?: (item: Poster) => void;
  className?: string;
};

const POSITION_SPRING = {
  mass: 0.28,
  stiffness: 95,
  damping: 24,
} satisfies MagazineScrollerSpringConfig;

const VELOCITY_SPRING = {
  mass: 0.18,
  stiffness: 80,
  damping: 34,
} satisfies MagazineScrollerSpringConfig;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function wrap(min: number, max: number, value: number) {
  const range = max - min;
  if (range === 0) return min;
  return ((((value - min) % range) + range) % range) + min;
}

function toCssSize(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

export function MagazineScroller({
  images,
  cardWidth = 250,
  cardHeight = 375,
  gap = 36,
  slices = 9,
  height = "68vh",
  wheelSpeed = 1.15,
  dragSpeed = 1.15,
  autoSpeed = 0,
  bendStrength = 82,
  maxBend = 100,
  lockWheel = false,
  positionSpring = POSITION_SPRING,
  velocitySpring = VELOCITY_SPRING,
  onItemClick,
  className,
}: MagazineScrollerProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartValueRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const targetX = useMotionValue(0);
  const x = useSpring(targetX, positionSpring);

  const safeImages = useMemo(() => {
    return images?.length ? images : [];
  }, [images]);

  const safeSlices = Math.max(1, Math.floor(slices));
  const itemStep = cardWidth + gap;
  const loopWidth = Math.max(1, safeImages.length * itemStep);

  const loopX = useTransform(x, (latest) => {
    return wrap(-loopWidth, 0, latest);
  });

  const velocity = useVelocity(x);
  const smoothVelocity = useSpring(velocity, velocitySpring);

  const bend = useTransform(smoothVelocity, (latest) => {
    return clamp(latest / bendStrength, -maxBend, maxBend);
  });

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const updateSize = () => {
      setContainerWidth(node.clientWidth);
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  // Wheel handling: support trackpad horizontal swipes, shift-scroll, or locked wheel
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const handleWheel = (event: WheelEvent) => {
      const isHorizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;

      if (lockWheel) {
        event.preventDefault();
        const delta = isHorizontal ? event.deltaX : event.deltaY;
        targetX.set(targetX.get() - delta * wheelSpeed);
      } else if (isHorizontal && Math.abs(event.deltaX) > 4) {
        event.preventDefault();
        targetX.set(targetX.get() - event.deltaX * wheelSpeed);
      }
    };

    node.addEventListener("wheel", handleWheel, { passive: !lockWheel });

    return () => {
      node.removeEventListener("wheel", handleWheel);
    };
  }, [lockWheel, targetX, wheelSpeed]);

  useAnimationFrame((_, delta) => {
    if (!autoSpeed || isDraggingRef.current) return;
    targetX.set(targetX.get() - autoSpeed * (delta / 1000));
  });

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;

    dragStartXRef.current = event.clientX;
    dragStartYRef.current = event.clientY;
    dragStartValueRef.current = targetX.get();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!isDraggingRef.current) return;

    const dx = event.clientX - dragStartXRef.current;
    const dy = event.clientY - dragStartYRef.current;

    if (!hasMovedRef.current) {
      if (Math.hypot(dx, dy) > 6) {
        hasMovedRef.current = true;
        setIsDragging(true);
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Ignore
        }
      }
    }

    if (hasMovedRef.current) {
      targetX.set(dragStartValueRef.current + dx * dragSpeed);
    }
  };

  const stopDragging = (event: ReactPointerEvent<HTMLElement>) => {
    if (!isDraggingRef.current) return;

    if (hasMovedRef.current) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer may already be released
      }
      setTimeout(() => {
        isDraggingRef.current = false;
        hasMovedRef.current = false;
        setIsDragging(false);
      }, 50);
    } else {
      isDraggingRef.current = false;
      hasMovedRef.current = false;
      setIsDragging(false);
    }
  };

  if (!safeImages.length) return null;

  return (
    <section
      ref={rootRef}
      className={className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      style={{
        position: "relative",
        height: toCssSize(height),
        width: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "pan-y",
        perspective: 1400,
      }}
    >
      {/* LEFT progressive blur */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 80,
          height: "100%",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <ProgressiveBlur position="right" width="100%" height="100%" blurMax={18} />
      </div>

      <motion.div
        style={{
          x: loopX,
          display: "flex",
          alignItems: "center",
          gap,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {[0, 1, 2].map((copyIndex) =>
          safeImages.map((image, index) => {
            const absoluteIndex = copyIndex * safeImages.length + index;

            return (
              <PosterCard
                key={`${copyIndex}-${image.id || image.src}-${index}`}
                image={image}
                absoluteIndex={absoluteIndex}
                loopX={loopX}
                bend={bend}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                itemStep={itemStep}
                slices={safeSlices}
                containerWidth={containerWidth}
                onCardClick={() => {
                  if (!hasMovedRef.current) {
                    onItemClick?.(image);
                  }
                }}
              />
            );
          }),
        )}
      </motion.div>

      {/* RIGHT progressive blur */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 80,
          height: "100%",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <ProgressiveBlur position="left" width="100%" height="100%" blurMax={18} />
      </div>
    </section>
  );
}

type PosterCardProps = {
  image: Poster;
  absoluteIndex: number;
  loopX: MotionValue<number>;
  bend: MotionValue<number>;
  cardWidth: number;
  cardHeight: number;
  itemStep: number;
  slices: number;
  containerWidth: number;
  onCardClick?: () => void;
};

function PosterCard({
  image,
  absoluteIndex,
  loopX,
  bend,
  cardWidth,
  cardHeight,
  itemStep,
  slices,
  containerWidth,
  onCardClick,
}: PosterCardProps) {
  const cardCenter = useTransform(loopX, (latestX) => {
    return latestX + absoluteIndex * itemStep + cardWidth / 2;
  });

  const rotateY = useTransform(cardCenter, (center) => {
    if (!containerWidth) return 0;

    const viewportCenter = containerWidth / 2;
    const distance = (center - viewportCenter) / viewportCenter;

    return clamp(distance * -62, -76, 76);
  });

  const scale = useTransform(cardCenter, (center) => {
    if (!containerWidth) return 1;

    const viewportCenter = containerWidth / 2;
    const distance = Math.abs(center - viewportCenter) / viewportCenter;

    return clamp(1 - distance * 0.15, 0.82, 1);
  });

  const opacity = useTransform(cardCenter, (center) => {
    if (!containerWidth) return 1;

    const viewportCenter = containerWidth / 2;
    const distance = Math.abs(center - viewportCenter) / viewportCenter;

    return clamp(1 - distance * 0.38, 0.48, 1);
  });

  const y = useTransform(cardCenter, (center) => {
    if (!containerWidth) return 0;

    const viewportCenter = containerWidth / 2;
    const distance = Math.abs(center - viewportCenter) / viewportCenter;

    return clamp(distance * 30, 0, 44);
  });

  const rotateZ = useTransform(bend, (latest) => latest * 0.08);

  return (
    <motion.article
      aria-label={image.alt ?? image.title ?? "Film poster"}
      onClick={onCardClick}
      data-cursor-interactive="true"
      data-cursor-label="Details"
      className="group cursor-pointer select-none"
      style={{
        width: cardWidth,
        flex: "0 0 auto",
        y,
        rotateY,
        rotateZ,
        scale,
        opacity,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* 3D Sliced Tactile Poster Drum */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/10 group-hover:ring-amber-500/40 group-hover:shadow-[0_24px_60px_rgba(245,158,11,0.18)] transition-[box-shadow,ring-color] duration-300"
        style={{
          width: "100%",
          height: cardHeight,
          display: "flex",
          transformStyle: "preserve-3d",
        }}
      >
        {Array.from({ length: slices }).map((_, sliceIndex) => (
          <PosterSlice
            key={`${image.src}-${sliceIndex}`}
            src={image.src}
            sliceIndex={sliceIndex}
            slices={slices}
            bend={bend}
          />
        ))}

        {/* Ambient bottom film glow overlay on the poster */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Pill affordance in the bottom right corner */}
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono uppercase tracking-wider text-white opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
          <span>View</span>
        </div>
      </div>

      {/* Movie Information & Details */}
      <div className="mt-4 px-1.5 pointer-events-none">
        <h3 className="text-base font-bold font-sans tracking-tight text-neutral-900 dark:text-neutral-100 truncate group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
          {image.title}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-1 text-xs font-mono text-neutral-500 dark:text-neutral-400">
          <span className="truncate">{image.year} {image.category ? `· ${image.category.split('·')[0].trim()}` : ''}</span>
          {image.imdbRating && (
            <span className="text-amber-500 font-bold shrink-0">★ {image.imdbRating}</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

type PosterSliceProps = {
  src: string;
  sliceIndex: number;
  slices: number;
  bend: MotionValue<number>;
};

function PosterSlice({ src, sliceIndex, slices, bend }: PosterSliceProps) {
  const middle = (slices - 1) / 2;
  const offsetFromMiddle = sliceIndex - middle;

  const sliceRotateY = useTransform(bend, (latest) => {
    return latest * offsetFromMiddle * 0.22;
  });

  const sliceSkewY = useTransform(bend, (latest) => {
    return latest * offsetFromMiddle * 0.014;
  });

  const sliceZ = useTransform(bend, (latest) => {
    return Math.abs(latest) * Math.abs(offsetFromMiddle) * -0.18;
  });

  const backgroundPosition = slices === 1 ? "50% 50%" : `${(sliceIndex / (slices - 1)) * 100}% 50%`;

  return (
    <motion.div
      style={{
        width: `${100 / slices}%`,
        height: "100%",
        rotateY: sliceRotateY,
        skewY: sliceSkewY,
        z: sliceZ,
        transformOrigin: "center center",
        backgroundImage: `url(${src})`,
        backgroundSize: `${slices * 100}% 100%`,
        backgroundPosition,
        backgroundRepeat: "no-repeat",
        backfaceVisibility: "hidden",
        willChange: "transform",
      }}
    />
  );
}

export default MagazineScroller;
