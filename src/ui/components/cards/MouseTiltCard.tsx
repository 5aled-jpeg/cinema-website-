'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

type OrientationCallback = (x: number, y: number) => void;

/**
 * Universal mobile sensor manager for 3D card tilt & rotation.
 * Supports:
 * - DeviceOrientationEvent (Standard + Absolute)
 * - DeviceMotionEvent (Accelerometer with gravity fallback for 100% Android/iOS compatibility)
 * - Automatic iOS 13+ permission request on user tap/interaction
 * - Automatic baseline calibration with slow drift cancellation
 * - Screen orientation handling (portrait & landscape)
 */
class DeviceOrientationManager {
  private static instance: DeviceOrientationManager;
  private listeners: Set<OrientationCallback> = new Set();
  private isListening = false;
  private calibratedBeta = 45;
  private calibratedGamma = 0;
  private hasCalibrated = false;
  private lastOrientationTime = 0;
  public currentX = 0;
  public currentY = 0;

  public static getInstance(): DeviceOrientationManager {
    if (!DeviceOrientationManager.instance) {
      DeviceOrientationManager.instance = new DeviceOrientationManager();
    }
    return DeviceOrientationManager.instance;
  }

  public subscribe(cb: OrientationCallback): () => void {
    this.listeners.add(cb);
    if (!this.isListening && typeof window !== 'undefined') {
      this.init();
    }
    cb(this.currentX, this.currentY);
    return () => {
      this.listeners.delete(cb);
      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  }

  public requestPermissionOnGesture = () => {
    if (typeof window === 'undefined') return;

    // iOS 13+ DeviceOrientationEvent permission
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
          .requestPermission()
          .then((state) => {
            if (state === 'granted') {
              this.stop();
              this.startListening();
            }
          })
          .catch(() => {});
      } catch {
        // Ignore
      }
    }

    // iOS 13+ DeviceMotionEvent permission
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> })
          .requestPermission()
          .then((state) => {
            if (state === 'granted') {
              this.stop();
              this.startListening();
            }
          })
          .catch(() => {});
      } catch {
        // Ignore
      }
    }
  };

  private init() {
    if (typeof window === 'undefined') return;

    this.startListening();

    // Hook touch & click to trigger permission request on iOS Safari
    const onGesture = () => {
      this.requestPermissionOnGesture();
    };

    window.addEventListener('click', onGesture, { passive: true });
    window.addEventListener('touchend', onGesture, { passive: true });
    window.addEventListener('pointerup', onGesture, { passive: true });

    // Power saving on tab hide
    const onVisibilityChange = () => {
      if (document.hidden) {
        this.stop();
      } else if (this.listeners.size > 0) {
        this.startListening();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  private handleOrientation = (e: DeviceOrientationEvent) => {
    if (e.beta === null || e.gamma === null) return;
    this.lastOrientationTime = Date.now();

    let beta = e.beta;
    let gamma = e.gamma;

    const orientationAngle = typeof window !== 'undefined'
      ? (window.screen?.orientation?.angle ?? (typeof window.orientation === 'number' ? (window.orientation as number) : 0))
      : 0;

    if (orientationAngle === 90) {
      const temp = beta;
      beta = -gamma;
      gamma = temp;
    } else if (orientationAngle === -90 || orientationAngle === 270) {
      const temp = beta;
      beta = gamma;
      gamma = -temp;
    } else if (orientationAngle === 180) {
      beta = -beta;
      gamma = -gamma;
    }

    if (!this.hasCalibrated) {
      this.calibratedBeta = Math.min(65, Math.max(25, beta));
      this.calibratedGamma = Math.min(20, Math.max(-20, gamma));
      this.hasCalibrated = true;
    } else {
      this.calibratedBeta += (beta - this.calibratedBeta) * 0.001;
      this.calibratedGamma += (gamma - this.calibratedGamma) * 0.001;
    }

    // Ultra-high sensitivity mapping: gentle ±8 degrees phone tilt drives full 3D range
    const maxRoll = 8;
    const deltaX = Math.min(0.5, Math.max(-0.5, ((gamma - this.calibratedGamma) / maxRoll) * 0.5));

    const maxPitch = 8;
    const deltaBeta = beta - this.calibratedBeta;
    const deltaY = Math.min(0.5, Math.max(-0.5, -(deltaBeta / maxPitch) * 0.5));

    this.currentX = deltaX;
    this.currentY = deltaY;

    this.listeners.forEach((cb) => cb(deltaX, deltaY));
  };

  private handleMotion = (e: DeviceMotionEvent) => {
    // If orientation already updated in the last 400ms, orientation is cleaner
    if (Date.now() - this.lastOrientationTime < 400) return;

    const acc = e.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null) return;

    // High sensitivity accelerometer: ±2.2 m/s² reaches full range
    const rawX = Math.min(0.5, Math.max(-0.5, (acc.x / 2.2) * 0.5));
    const rawY = Math.min(0.5, Math.max(-0.5, ((acc.y - 6.5) / 2.2) * 0.5));

    this.currentX = rawX;
    this.currentY = rawY;

    this.listeners.forEach((cb) => cb(rawX, rawY));
  };

  public startListening() {
    if (this.isListening || typeof window === 'undefined') return;
    this.isListening = true;

    window.addEventListener('deviceorientation', this.handleOrientation, { passive: true });
    window.addEventListener('deviceorientationabsolute' as unknown as keyof WindowEventMap, this.handleOrientation as EventListener, { passive: true });
    window.addEventListener('devicemotion', this.handleMotion, { passive: true });
  }

  public stop() {
    if (!this.isListening || typeof window === 'undefined') return;
    this.isListening = false;
    window.removeEventListener('deviceorientation', this.handleOrientation);
    window.removeEventListener('deviceorientationabsolute' as unknown as keyof WindowEventMap, this.handleOrientation as EventListener);
    window.removeEventListener('devicemotion', this.handleMotion);
  }
}

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
  /** Whether this card is the active front item (activates 3D tilt & glare on mobile) */
  isActive?: boolean;
  /** Whether device orientation 3D tilt is enabled on mobile touch devices */
  enableGyroscope?: boolean;
}

export default function MouseTiltCard({
  children,
  className,
  tiltIntensity = 36,
  perspective = 1000,
  glareEffect = true,
  glareIntensity = 0.32,
  scale = 1.05,
  isActive = true,
  enableGyroscope = true,
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

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const isEffectActive = hasFinePointer ? isHovered : Boolean(isActive);

  // Sensor subscription
  useEffect(() => {
    if (isHovered) return;

    if (!enableGyroscope || !isActive) {
      mouseX.set(0);
      mouseY.set(0);
      return;
    }

    const orientationManager = DeviceOrientationManager.getInstance();
    const unsubscribe = orientationManager.subscribe((x, y) => {
      if (!isHovered) {
        mouseX.set(x);
        mouseY.set(y);
      }
    });

    return () => {
      unsubscribe();
      mouseX.set(0);
      mouseY.set(0);
    };
  }, [enableGyroscope, isActive, isHovered, mouseX, mouseY]);

  // Ultra-responsive spring physics
  const springConfig = { damping: 16, stiffness: 340, mass: 0.2 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // 3D rotation: tilts up to ±36 degrees for unmistakable, bold 3D reaction!
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]);

  // Dramatic 3D parallax displacement: translates up to ±28px in depth!
  const translateX = useTransform(smoothMouseX, [-0.5, 0.5], [-28, 28]);
  const translateY = useTransform(smoothMouseY, [-0.5, 0.5], [-28, 28]);

  // Specular glare position
  const glareX = useTransform(smoothMouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(smoothMouseY, [-0.5, 0.5], [0, 100]);

  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 255, 255, ${glareIntensity}) 0%, rgba(255, 255, 255, 0.05) 38%, transparent 70%)`
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

  // Direct mobile touch tilt support (finger drag over active card)
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isActive || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (touch.clientX - rect.left) / rect.width - 0.5;
      const y = (touch.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(Math.min(0.5, Math.max(-0.5, x)));
      mouseY.set(Math.min(0.5, Math.max(-0.5, y)));
    },
    [isActive, mouseX, mouseY]
  );

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onTouchMove={handleTouchMove}
      className={cn('relative select-none [transform-style:preserve-3d]', className)}
      style={{
        perspective: `${perspective}px`,
        ...style,
      }}
      {...props}
    >
      <motion.div
        className="relative size-full rounded-2xl [transform-style:preserve-3d]"
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
          willChange: 'transform',
        }}
        animate={{
          scale: isEffectActive ? scale : 1,
        }}
        transition={{
          scale: { type: 'spring', damping: 20, stiffness: 260, mass: 0.35 },
        }}
      >
        {children}

        {/* Dynamic Specular Glare Overlay */}
        {glareEffect && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-2xl overflow-hidden"
            animate={{
              opacity: isEffectActive ? 1 : 0,
            }}
            transition={{ duration: 0.25 }}
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

export { MouseTiltCard, DeviceOrientationManager };
