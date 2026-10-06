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

    const checkFinePointer = () => {
      const fine = window.matchMedia('(pointer: fine)').matches;
      const anyFine = window.matchMedia('(any-pointer: fine)').matches;
      return fine || anyFine;
    };

    setHasFinePointer(checkFinePointer());

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        setHasFinePointer(true);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
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
          width: isCard ? 88 : isAction ? 24 : 14,
          height: isCard ? 32 : isAction ? 24 : 14,
        }}
        transition={{
          type: 'spring',
          stiffness: 600,
          damping: 35,
          mass: 0.5,
        }}
        className="flex items-center justify-center rounded-[24px] bg-black/85 text-white backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.25)] border border-amber-400/40 transition-[background-color,border-color,color] duration-150"
      >
        <AnimatePresence>
          {isCard ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="inline-flex w-full items-center justify-center px-2.5"
            >
              <div className="inline-flex items-center text-xs font-semibold tracking-tight text-amber-300 select-none whitespace-nowrap">
                {hoverState.label} <PlusIcon className="ml-1 h-3.5 w-3.5 text-amber-400" />
              </div>
            </motion.div>
          ) : isAction ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="size-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="size-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.9)]"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </Cursor>
  );
}
