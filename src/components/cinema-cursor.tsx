'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PlusIcon } from 'lucide-react';
import { Cursor } from '@/components/core/cursor';

interface CinemaCursorProps {
  attachToParent?: boolean;
}

export function CinemaCursor({ attachToParent = false }: CinemaCursorProps) {
  const [hasFinePointer, setHasFinePointer] = React.useState(false);
  const [hoverState, setHoverState] = React.useState<{
    type: 'default' | 'card' | 'action';
    label: string;
  }>({
    type: 'default',
    label: 'More',
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(pointer: fine)');
    setHasFinePointer(media.matches);
    const listener = (e: MediaQueryListEvent) => setHasFinePointer(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  React.useEffect(() => {
    if (!hasFinePointer) return;

    // Ultra-lightweight native pointerover listener: 0 layout reflows, 0 elementFromPoint calls
    const handlePointerOver = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) {
        setHoverState((prev) => (prev.type === 'default' ? prev : { type: 'default', label: 'More' }));
        return;
      }

      // If inside an open dialog modal, do not match background cards
      const isInsideModal = Boolean(el.closest('[role="dialog"]'));

      if (!isInsideModal) {
        const card =
          el.closest('[data-cursor-interactive="true"]') ||
          el.closest('[id^="works-wheel-"]');

        if (card) {
          const customLabel = card.getAttribute('data-cursor-label') || 'More';
          setHoverState((prev) =>
            prev.type === 'card' && prev.label === customLabel
              ? prev
              : { type: 'card', label: customLabel }
          );
          return;
        }
      }

      const action =
        el.closest('button') ||
        el.closest('a') ||
        el.closest('[role="button"]') ||
        el.closest('[role="tab"]') ||
        el.closest('[role="menuitem"]');

      if (action) {
        setHoverState((prev) =>
          prev.type === 'action' ? prev : { type: 'action', label: '' }
        );
        return;
      }

      setHoverState((prev) => (prev.type === 'default' ? prev : { type: 'default', label: 'More' }));
    };

    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    return () => window.removeEventListener('pointerover', handlePointerOver);
  }, [hasFinePointer]);

  if (!hasFinePointer) {
    return null;
  }

  const isCard = hoverState.type === 'card';
  const isAction = hoverState.type === 'action';

  return (
    <Cursor
      attachToParent={attachToParent}
      variants={{
        initial: { scale: 0.3, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.3, opacity: 0 },
      }}
      transition={{
        ease: 'easeInOut',
        duration: 0.12,
      }}
    >
      <motion.div
        animate={{
          width: isCard ? 84 : isAction ? 26 : 16,
          height: isCard ? 32 : isAction ? 26 : 16,
        }}
        transition={{
          type: 'spring',
          stiffness: 600,
          damping: 35,
          mass: 0.5,
        }}
        className="flex items-center justify-center rounded-[24px] bg-neutral-900/80 dark:bg-neutral-100/90 text-white dark:text-neutral-950 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.22)] border border-white/20 dark:border-black/20 transition-[background-color,border-color,color] duration-150"
      >
        <AnimatePresence>
          {isCard ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="inline-flex w-full items-center justify-center px-2.5"
            >
              <div className="inline-flex items-center text-xs font-medium tracking-tight text-white dark:text-neutral-950 select-none whitespace-nowrap">
                {hoverState.label} <PlusIcon className="ml-1 h-3.5 w-3.5" />
              </div>
            </motion.div>
          ) : isAction ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="size-1.5 rounded-full bg-white/90 dark:bg-neutral-950/90"
            />
          ) : null}
        </AnimatePresence>
      </motion.div>
    </Cursor>
  );
}
