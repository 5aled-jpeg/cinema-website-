"use client";

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { getSiteTheme, SITE_THEME_EVENT, type SiteTheme } from '@/lib/siteTheme';

interface LiquidBackgroundProps {
  isDark: boolean;
}

const LiquidBackground = ({ isDark }: LiquidBackgroundProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor1: { value: new THREE.Color(isDark ? 0x030306 : 0xfcfcfd) },
      uColor2: { value: new THREE.Color(isDark ? 0x0e0e18 : 0xe6e6ee) },
    }),
    []
  );

  useEffect(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        mat.uniforms.uColor1.value.set(isDark ? 0x030306 : 0xfcfcfd);
        mat.uniforms.uColor2.value.set(isDark ? 0x0e0e18 : 0xe6e6ee);
      }
    }
  }, [isDark]);

  useFrame((state) => {
    const { clock, mouse } = state;
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        mat.uniforms.uTime.value = clock.getElapsedTime();
        mat.uniforms.uMouse.value.lerp(mouse, 0.04);
      }
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        transparent
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec2 uMouse;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          varying vec2 vUv;
          void main() {
            vec2 uv = vUv;
            float t = uTime * 0.12;
            vec2 m = uMouse * 0.08;
            float color = smoothstep(0.0, 1.0, (sin(uv.x * 7.0 + t + m.x * 10.0) + sin(uv.y * 5.0 - t + m.y * 10.0)) * 0.5 + 0.5);
            gl_FragColor = vec4(mix(uColor1, uColor2, color), 1.0);
          }
        `}
      />
    </mesh>
  );
};

interface MonolithProps {
  isDark: boolean;
}

const Monolith = ({ isDark }: MonolithProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={[12, 0, 0]}>
        <icosahedronGeometry args={[13, 1]} />
        <MeshDistortMaterial
          color="#0d0d16"
          speed={2.2}
          distort={0.25}
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

export interface ExperienceHeroProps {
  onExplore?: () => void;
  active?: boolean;
}

export const Component = ({ onExplore, active: activeProp = true }: ExperienceHeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<SiteTheme>('dark');
  const [active, setActive] = useState(activeProp);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768 || !window.matchMedia('(pointer: fine)').matches);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile, { passive: true });
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  useEffect(() => {
    setActive(activeProp);
  }, [activeProp]);

  useEffect(() => {
    const handleHeroActive = (e: Event) => {
      const customEvent = e as CustomEvent<{ active: boolean }>;
      if (typeof customEvent.detail?.active === 'boolean') {
        setActive(customEvent.detail.active);
      }
    };

    window.addEventListener('cinema-hero-active', handleHeroActive);
    return () => window.removeEventListener('cinema-hero-active', handleHeroActive);
  }, []);

  useEffect(() => {
    setMounted(true);
    setTheme(getSiteTheme());

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: SiteTheme }>;
      if (customEvent.detail?.theme) {
        setTheme(customEvent.detail.theme);
      } else {
        setTheme(getSiteTheme());
      }
    };

    window.addEventListener(SITE_THEME_EVENT, handleThemeChange);
    return () => window.removeEventListener(SITE_THEME_EVENT, handleThemeChange);
  }, []);

  const isDark = theme === 'dark';

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      if (revealRef.current) {
        revealRef.current.style.opacity = '1';
        revealRef.current.style.filter = 'none';
      }
      return;
    }

    const ctx = gsap.context(() => {
      if (revealRef.current) {
        gsap.fromTo(
          revealRef.current,
          { filter: "blur(14px)", opacity: 0, scale: 1.01 },
          { filter: "blur(0px)", opacity: 1, scale: 1, duration: 1.4, ease: "power3.out" }
        );
      }

      let ticking = false;
      let cachedRect: { left: number; top: number; width: number; height: number } | null = null;

      const handleMouseEnter = () => {
        if (ctaRef.current) {
          const r = ctaRef.current.getBoundingClientRect();
          cachedRect = { left: r.left, top: r.top, width: r.width, height: r.height };
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!ctaRef.current || ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          if (!ctaRef.current) return;
          if (!cachedRect) {
            const r = ctaRef.current.getBoundingClientRect();
            cachedRect = { left: r.left, top: r.top, width: r.width, height: r.height };
          }
          const dist = Math.hypot(
            e.clientX - (cachedRect.left + cachedRect.width / 2),
            e.clientY - (cachedRect.top + cachedRect.height / 2)
          );
          if (dist < 130) {
            gsap.to(ctaRef.current, {
              x: (e.clientX - (cachedRect.left + cachedRect.width / 2)) * 0.28,
              y: (e.clientY - (cachedRect.top + cachedRect.height / 2)) * 0.28,
              duration: 0.35,
              overwrite: 'auto',
            });
          } else {
            cachedRect = null;
            gsap.to(ctaRef.current, {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              overwrite: 'auto',
            });
          }
        });
      };

      const hasPointer = window.matchMedia('(pointer: fine)').matches;
      const el = ctaRef.current;
      if (hasPointer) {
        el?.addEventListener('mouseenter', handleMouseEnter);
        window.addEventListener("mousemove", handleMouseMove, { passive: true });
      }
      return () => {
        if (hasPointer) {
          el?.removeEventListener('mouseenter', handleMouseEnter);
          window.removeEventListener("mousemove", handleMouseMove);
        }
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      role="banner"
      aria-label="Cinema Premiere Hero"
      className="relative h-screen w-full bg-[var(--color-bg-base)] text-[var(--color-text-primary)] flex flex-col overflow-hidden select-none transition-colors duration-300"
    >
      {/* Film Grain Noise Effect — Exclusive to Hero Page Section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 w-full h-full bg-[url('/noise.gif')] bg-repeat opacity-[0.055] dark:opacity-[0.065]"
      />

      {/* Atmospheric Background Layer:
          - Mobile/Low-Power: Ultra-fast hardware-accelerated CSS Chiaroscuro Mesh (120fps, 0% GPU strain)
          - Desktop: Interactive Three.js R3F Canvas capped at 1.25 DPR and paused when scrolled away */}
      <div
        className="absolute inset-0 z-0 pointer-events-none will-change-transform"
        style={{ visibility: active ? 'visible' : 'hidden' }}
      >
        {mounted && isMobile ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 transition-opacity duration-500"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse 95% 75% at 75% 35%, rgba(184, 128, 40, 0.16) 0%, rgba(14, 14, 24, 0.72) 48%, #050508 100%)'
                : 'radial-gradient(ellipse 95% 75% at 75% 35%, rgba(220, 180, 110, 0.18) 0%, rgba(240, 240, 248, 0.8) 48%, #fcfcfd 100%)',
            }}
          >
            <div
              className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full opacity-35 dark:opacity-25"
              style={{
                background: 'radial-gradient(circle, rgba(217, 119, 6, 0.28) 0%, transparent 70%)',
              }}
            />
          </div>
        ) : mounted && !isMobile ? (
          <Canvas
            dpr={[1, 1.25]}
            frameloop={active ? 'always' : 'never'}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 60], fov: 35 }}
          >
            <ambientLight intensity={isDark ? 0.45 : 0.85} />
            <spotLight
              position={[50, 50, 50]}
              intensity={isDark ? 2.5 : 2}
              color="#ffffff"
            />
            {isDark && (
              <pointLight position={[-30, 20, 30]} intensity={1.2} color="#b88028" />
            )}
            <LiquidBackground isDark={isDark} />
            {isDark && <Monolith isDark={isDark} />}
          </Canvas>
        ) : null}
      </div>

      {/* Hero Content Layer */}
      <div
        ref={revealRef}
        className="relative z-10 w-full flex flex-col justify-between p-8 sm:p-12 md:p-16 lg:p-20 h-full"
      >
        {/* Top Header Badge */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.08] backdrop-blur-xl shadow-xs transition-colors duration-300">
            <div className="relative size-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]">
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-35" />
            </div>
            <span className="font-mono text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 tracking-[0.18em] uppercase transition-colors duration-300">
              CINEMA ARCHIVE
            </span>
          </div>
        </div>

        {/* Center Display Typography & Cinema Narrative */}
        <div className="max-w-5xl my-auto py-8">
          <h1 className="text-[clamp(5rem,15vw,15rem)] font-sans font-black leading-[0.84] tracking-[-0.04em] uppercase select-none text-neutral-950 dark:text-white transition-colors duration-300">
            CINEMA
          </h1>
          <p className="mt-8 font-sans text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed max-w-xl tracking-[-0.01em] transition-colors duration-300">
            Watch our latest upcoming films, theatrical exhibitions, and handpicked masterworks curated for true cinephiles.
          </p>
        </div>

        {/* Bottom Prominent CTA Button */}
        <div className="pt-4 pb-2">
          <button
            ref={ctaRef}
            onClick={onExplore}
            type="button"
            data-cursor-interactive="true"
            data-cursor-label="Films"
            aria-label="Explore Our Available Films"
            className="group relative inline-flex items-center gap-4 px-6 py-3.5 rounded-full min-h-[48px] bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-[0_4px_24px_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.2)] dark:shadow-[0_4px_24px_rgba(255,255,255,0.15),inset_0_1px_0_0_rgba(255,255,255,0.8)] hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 ease-out cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-white focus-visible:ring-offset-2"
          >
            <div className="size-8 rounded-full bg-white/15 dark:bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-white dark:stroke-neutral-950 stroke-[2.2] transition-colors"
              >
                <path
                  d="M7 17L17 7M17 7H8M17 7V16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-sans font-medium text-sm sm:text-base tracking-tight pr-1">
              Our Available Films
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Component;
