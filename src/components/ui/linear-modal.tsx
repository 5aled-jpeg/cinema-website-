'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  MotionConfig,
  type Transition,
  type Variant,
  motion,
} from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  uniqueId: string;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

const DialogContext = createContext<DialogContextType | null>(null);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

export type DialogProviderProps = {
  children: React.ReactNode;
  transition?: Transition;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function DialogProvider({
  children,
  transition,
  open: controlledOpen,
  onOpenChange,
}: DialogProviderProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = useCallback(
    (open: boolean) => {
      if (isControlled) {
        onOpenChange?.(open);
      } else {
        setUncontrolledOpen(open);
        onOpenChange?.(open);
      }
    },
    [isControlled, onOpenChange]
  );

  const uniqueId = useId();
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const contextValue = useMemo(
    () => ({ isOpen, setIsOpen, uniqueId, triggerRef }),
    [isOpen, setIsOpen, uniqueId]
  );

  return (
    <DialogContext.Provider value={contextValue}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </DialogContext.Provider>
  );
}

export type DialogProps = {
  children: React.ReactNode;
  transition?: Transition;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Dialog({
  children,
  transition = {
    type: 'spring',
    damping: 26,
    stiffness: 280,
    mass: 0.7,
  },
  open,
  onOpenChange,
}: DialogProps) {
  return (
    <DialogProvider
      transition={transition}
      open={open}
      onOpenChange={onOpenChange}
    >
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </DialogProvider>
  );
}

export type DialogTriggerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  triggerRef?: React.RefObject<HTMLDivElement | null>;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  id?: string;
};

export function DialogTrigger({
  children,
  className,
  style,
  triggerRef: externalTriggerRef,
  onClick,
  id,
}: DialogTriggerProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef: internalTriggerRef } =
    useDialog();
  const ref = externalTriggerRef || internalTriggerRef;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        setIsOpen(!isOpen);
      }
    },
    [isOpen, setIsOpen, onClick]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    },
    [isOpen, setIsOpen]
  );

  return (
    <motion.div
      id={id}
      ref={ref}
      layoutId={`dialog-${uniqueId}`}
      className={cn('relative cursor-pointer', className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={style}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={`dialog-content-${uniqueId}`}
    >
      {children}
    </motion.div>
  );
}

export type DialogContentProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function DialogContent({
  children,
  className,
  style,
}: DialogContentProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef } = useDialog();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen, triggerRef]);

  return (
    <motion.div
      ref={containerRef}
      layoutId={`dialog-${uniqueId}`}
      className={cn(
        !className?.includes('overflow-') && 'overflow-hidden',
        className
      )}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`dialog-title-${uniqueId}`}
      aria-describedby={`dialog-description-${uniqueId}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}

export type DialogContainerProps = {
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  style?: React.CSSProperties;
};

export function DialogContainer({
  children,
  className,
  overlayClassName,
}: DialogContainerProps) {
  const { isOpen, setIsOpen, uniqueId } = useDialog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-dialog-open', 'true');
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-dialog-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-dialog-open');
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence initial={false} mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            key={`backdrop-${uniqueId}`}
            data-lenis-prevent
            className={cn(
              'fixed inset-0 h-full w-full backdrop-blur-md bg-black/75 dark:bg-black/85 transition-colors',
              overlayClassName
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div
            data-dialog-container="true"
            className={cn(
              'relative z-10 w-full max-h-[90vh] flex flex-col justify-center items-center',
              className
            )}
          >
            {children}
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export type DialogTitleProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function DialogTitle({ children, className, style }: DialogTitleProps) {
  const { uniqueId } = useDialog();

  return (
    <motion.h2
      layoutId={`dialog-title-container-${uniqueId}`}
      className={className}
      style={style}
      layout="position"
    >
      {children}
    </motion.h2>
  );
}

export type DialogSubtitleProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function DialogSubtitle({
  children,
  className,
  style,
}: DialogSubtitleProps) {
  const { uniqueId } = useDialog();

  return (
    <motion.div
      layoutId={`dialog-subtitle-container-${uniqueId}`}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export type DialogDescriptionProps = {
  children: React.ReactNode;
  className?: string;
  disableLayoutAnimation?: boolean;
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
};

export function DialogDescription({
  children,
  className,
  variants = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  disableLayoutAnimation,
}: DialogDescriptionProps) {
  const { uniqueId } = useDialog();

  return (
    <motion.div
      key={`dialog-description-${uniqueId}`}
      layoutId={
        disableLayoutAnimation
          ? undefined
          : `dialog-description-content-${uniqueId}`
      }
      variants={variants}
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      id={`dialog-description-${uniqueId}`}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export type DialogImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
};

export function DialogImage({ src, alt, className, style }: DialogImageProps) {
  const { uniqueId } = useDialog();

  return (
    <motion.img
      src={src}
      alt={alt}
      className={cn(className)}
      layoutId={`dialog-img-${uniqueId}`}
      style={style}
    />
  );
}

export type DialogCloseProps = {
  children?: React.ReactNode;
  className?: string;
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
};

export function DialogClose({
  children,
  className,
  variants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
}: DialogCloseProps) {
  const { setIsOpen, uniqueId } = useDialog();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <motion.button
      onClick={handleClose}
      type="button"
      aria-label="Close dialog"
      key={`dialog-close-${uniqueId}`}
      className={cn(
        'absolute right-5 top-5 z-20 flex size-9 items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl text-neutral-800 dark:text-neutral-200 shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer',
        className
      )}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      {children || <XIcon className="size-4" />}
    </motion.button>
  );
}

export {
  Dialog as default,
};
