'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface MouseTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  tiltIntensity?: number;
  perspective?: number;
  glareEffect?: boolean;
  glareIntensity?: number;
  scale?: number;
  transition?: string;
  style?: React.CSSProperties;
  isActive?: boolean;
  enableGyroscope?: boolean;
}

export default function MouseTiltCard({
  children,
  className,
  tiltIntensity = 12,
  perspective = 1000,
  glareEffect = true,
  glareIntensity = 0.12,
  scale = 1.03,
  isActive = false,
  enableGyroscope = false,
  style,
  ...props
}: MouseTiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(pointer: fine)');
      setHasFinePointer(media.matches);
      const listener = (e: MediaQueryListEvent) => setHasFinePointer(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  // Normalized mouse coords (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Mobile Gyroscope / Device orientation (strictly on mobile touch devices when active)
  useEffect(() => {
    if (hasFinePointer || !enableGyroscope || !isActive) return;

    let unmounted = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (unmounted || e.beta === null || e.gamma === null) return;
      const roll = Math.min(1, Math.max(-1, e.gamma / 14));
      const pitch = Math.min(1, Math.max(-1, (e.beta - 45) / 14));
      mouseX.set(roll * 0.5);
      mouseY.set(-pitch * 0.5);
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    return () => {
      unmounted = true;
      window.removeEventListener('deviceorientation', handleOrientation);
      mouseX.set(0);
      mouseY.set(0);
    };
  }, [hasFinePointer, enableGyroscope, isActive, mouseX, mouseY]);

  // Spring physics tuned for smooth tracking without jitter or feedback loop
  const springConfig = { damping: 25, stiffness: 280, mass: 0.4 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // 3D rotation: tilts towards cursor
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]);

  // Specular glare position (percentage 0 to 100)
  const glareX = useTransform(smoothMouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(smoothMouseY, [-0.5, 0.5], [0, 100]);

  // Unconditional top-level transform for specular glare (strictly follows Rules of Hooks)
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 255, 255, ${glareIntensity}) 0%, rgba(255, 255, 255, 0.03) 40%, transparent 70%)`
  );

  const handlePointerEnter = useCallback(() => {
    if (!hasFinePointer) return;
    setIsHovered(true);
    if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      rectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
    }
  }, [hasFinePointer]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!hasFinePointer) return;
      const rect = rectRef.current;
      if (!rect || rect.width === 0 || rect.height === 0) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [hasFinePointer, mouseX, mouseY]
  );

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    rectRef.current = null;
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Active state: strictly hover on desktop, active card on mobile
  const isMobileActive = !hasFinePointer && Boolean(isActive);
  const isTilting = hasFinePointer ? isHovered : isMobileActive;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={cn('relative select-none', className)}
      style={{
        perspective: hasFinePointer || isMobileActive ? `${perspective}px` : undefined,
        ...style,
      }}
      {...props}
    >
      <motion.div
        className="relative size-full [transform-style:preserve-3d]"
        style={{
          rotateX: isTilting ? rotateX : 0,
          rotateY: isTilting ? rotateY : 0,
          willChange: isTilting ? 'transform' : 'auto',
        }}
        animate={{
          scale: isTilting ? scale : 1,
        }}
        transition={{
          scale: { type: 'spring', damping: 22, stiffness: 300, mass: 0.4 },
        }}
      >
        {children}

        {/* Dynamic Specular Glare Overlay */}
        {glareEffect && isTilting && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] overflow-hidden"
            animate={{
              opacity: isTilting ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute -inset-[50%] size-[200%]"
              style={{
                background: glareBackground,
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export { MouseTiltCard };
