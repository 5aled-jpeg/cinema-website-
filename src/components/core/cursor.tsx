'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  motion,
  SpringOptions,
  useMotionValue,
  useSpring,
  AnimatePresence,
  Transition,
  Variant,
} from 'motion/react';
import { cn } from '@/lib/utils';

export type CursorProps = {
  children: React.ReactNode;
  className?: string;
  springConfig?: SpringOptions;
  attachToParent?: boolean;
  transition?: Transition;
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
  onPositionChange?: (x: number, y: number) => void;
};

export function Cursor({
  children,
  className,
  springConfig,
  attachToParent,
  variants,
  transition,
  onPositionChange,
}: CursorProps) {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!attachToParent);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      cursorX.set(window.innerWidth / 2);
      cursorY.set(window.innerHeight / 2);
    }
  }, [cursorX, cursorY]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(pointer: fine)');
    if (!media.matches) return;

    document.body.style.cursor = 'none';
    document.documentElement.style.cursor = 'none';

    const updatePosition = (e: PointerEvent | MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
      onPositionChange?.(e.clientX, e.clientY);
    };

    const handleDocLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        setIsVisible(false);
      }
    };

    const handleDocEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('pointermove', updatePosition, { passive: true });
    document.addEventListener('mouseout', handleDocLeave);
    document.addEventListener('mouseenter', handleDocEnter);

    return () => {
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
      window.removeEventListener('pointermove', updatePosition);
      document.removeEventListener('mouseout', handleDocLeave);
      document.removeEventListener('mouseenter', handleDocEnter);
    };
  }, [cursorX, cursorY, onPositionChange, attachToParent]);

  const cursorXSpring = useSpring(cursorX, springConfig ?? { duration: 0 });
  const cursorYSpring = useSpring(cursorY, springConfig ?? { duration: 0 });

  const posX = springConfig ? cursorXSpring : cursorX;
  const posY = springConfig ? cursorYSpring : cursorY;

  useEffect(() => {
    const handleVisibilityChange = (visible: boolean) => {
      setIsVisible(visible);
    };

    if (attachToParent && cursorRef.current) {
      const parent = cursorRef.current.parentElement;
      if (parent) {
        const handleMouseEnter = () => {
          parent.style.cursor = 'none';
          handleVisibilityChange(true);
        };
        const handleMouseLeave = () => {
          parent.style.cursor = 'auto';
          handleVisibilityChange(false);
        };
        parent.addEventListener('mouseenter', handleMouseEnter);
        parent.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          parent.removeEventListener('mouseenter', handleMouseEnter);
          parent.removeEventListener('mouseleave', handleMouseLeave);
        };
      }
    }
  }, [attachToParent]);

  return (
    <motion.div
      ref={cursorRef}
      data-cinema-cursor="true"
      className={cn('pointer-events-none fixed left-0 top-0 z-[10000]', className)}
      style={{
        x: posX,
        y: posY,
        translateX: '-50%',
        translateY: '-50%',
        willChange: 'transform',
      }}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial='initial'
            animate='animate'
            exit='exit'
            variants={variants}
            transition={transition}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
