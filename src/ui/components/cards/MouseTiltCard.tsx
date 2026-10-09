'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

type OrientationCallback = (x: number, y: number) => void;

/**
 * High-performance singleton manager for mobile gyroscope / deviceorientation events.
 * Automatically manages:
 * 1. Single global window listener across all card instances.
 * 2. Adaptive baseline calibration (prevents unnatural resting tilt when lying down or sitting).
 * 3. iOS 13+ permission request on first user touch gesture.
 * 4. Screen orientation rotation (portrait vs landscape).
 * 5. Document visibility power-saving.
 */
class DeviceOrientationManager {
  private static instance: DeviceOrientationManager;
  private listeners: Set<OrientationCallback> = new Set();
  private isListening = false;
  private permissionRequested = false;
  private calibratedBeta = 45;
  private calibratedGamma = 0;
  private hasCalibrated = false;
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
    // Deliver latest known orientation immediately
    cb(this.currentX, this.currentY);
    return () => {
      this.listeners.delete(cb);
      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  }

  public requestPermissionOnGesture() {
    if (this.permissionRequested || typeof window === 'undefined') return;
    this.permissionRequested = true;

    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
          .requestPermission()
          .then((state) => {
            if (state === 'granted') {
              this.startListening();
            }
          })
          .catch(() => {});
      } catch {
        // Ignore permission failure / user cancellation
      }
    }
  }

  private init() {
    if (typeof window === 'undefined') return;

    const hasPermissionApi =
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function';

    if (hasPermissionApi) {
      // iOS 13+ requires user gesture to grant device orientation
      const onFirstTouch = () => {
        this.requestPermissionOnGesture();
        window.removeEventListener('touchstart', onFirstTouch);
        window.removeEventListener('pointerdown', onFirstTouch);
      };
      window.addEventListener('touchstart', onFirstTouch, { passive: true, once: true });
      window.addEventListener('pointerdown', onFirstTouch, { passive: true, once: true });
    } else {
      // Android Chrome & standard modern mobile browsers
      this.startListening();
    }

    // Power saving: pause gyroscope calculations when tab is hidden
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

    let beta = e.beta;
    let gamma = e.gamma;

    // Handle screen orientation rotation (landscape vs portrait)
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
      // Initial calibration based on natural holding posture
      this.calibratedBeta = Math.min(65, Math.max(25, beta));
      this.calibratedGamma = Math.min(20, Math.max(-20, gamma));
      this.hasCalibrated = true;
    } else {
      // Slow adaptive drift cancellation (0.15% per tick)
      this.calibratedBeta += (beta - this.calibratedBeta) * 0.0015;
      this.calibratedGamma += (gamma - this.calibratedGamma) * 0.0015;
    }

    // Roll (gamma): ±24 degrees mapped to ±0.5
    const maxRoll = 24;
    const deltaX = Math.min(0.5, Math.max(-0.5, ((gamma - this.calibratedGamma) / maxRoll) * 0.5));

    // Pitch (beta): ±24 degrees relative to holding posture mapped to ±0.5
    const maxPitch = 24;
    const deltaBeta = beta - this.calibratedBeta;
    // Tilting top of phone backward brings top forward
    const deltaY = Math.min(0.5, Math.max(-0.5, -(deltaBeta / maxPitch) * 0.5));

    this.currentX = deltaX;
    this.currentY = deltaY;

    this.listeners.forEach((cb) => cb(deltaX, deltaY));
  };

  public startListening() {
    if (this.isListening || typeof window === 'undefined') return;
    this.isListening = true;
    window.addEventListener('deviceorientation', this.handleOrientation, { passive: true });
  }

  private stop() {
    if (!this.isListening || typeof window === 'undefined') return;
    this.isListening = false;
    window.removeEventListener('deviceorientation', this.handleOrientation);
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
  tiltIntensity = 12,
  perspective = 1000,
  glareEffect = true,
  glareIntensity = 0.12,
  scale = 1.03,
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

  // Normalized coords (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Mobile Gyroscope / DeviceOrientation subscription
  useEffect(() => {
    if (!enableGyroscope || hasFinePointer || !isActive) {
      if (!hasFinePointer) {
        mouseX.set(0);
        mouseY.set(0);
      }
      return;
    }

    const orientationManager = DeviceOrientationManager.getInstance();
    const unsubscribe = orientationManager.subscribe((x, y) => {
      mouseX.set(x);
      mouseY.set(y);
    });

    return () => {
      unsubscribe();
      mouseX.set(0);
      mouseY.set(0);
    };
  }, [enableGyroscope, hasFinePointer, isActive, mouseX, mouseY]);

  // Spring physics tuned for smooth tracking without jitter or feedback loop
  const springConfig = { damping: 25, stiffness: 280, mass: 0.4 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // 3D rotation: tilts towards cursor on PC or towards device rotation on mobile
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]);

  // Specular glare position (percentage 0 to 100)
  const glareX = useTransform(smoothMouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(smoothMouseY, [-0.5, 0.5], [0, 100]);

  // Specular glare dynamic gradient
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

  // Active effect condition:
  // - On desktop: active when mouse hovers card
  // - On mobile: active when this card is the active front item
  const isEffectActive = hasFinePointer ? isHovered : Boolean(isActive);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={cn('relative select-none', className)}
      style={{
        perspective: `${perspective}px`,
        ...style,
      }}
      {...props}
    >
      <motion.div
        className="relative size-full rounded-2xl overflow-hidden [transform-style:preserve-3d]"
        style={{
          rotateX: isEffectActive ? rotateX : 0,
          rotateY: isEffectActive ? rotateY : 0,
          willChange: isEffectActive ? 'transform' : 'auto',
        }}
        animate={{
          scale: isEffectActive ? scale : 1,
        }}
        transition={{
          scale: { type: 'spring', damping: 22, stiffness: 300, mass: 0.4 },
        }}
      >
        {children}

        {/* Dynamic Specular Glare Overlay - active on mouse hover (PC) and phone rotation (mobile) */}
        {glareEffect && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] overflow-hidden"
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

export { MouseTiltCard };
