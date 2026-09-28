"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface TextRevealProps {
  /** Plain text — revealed word by word */
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  delay?: number;
  /** Seconds between each word */
  stagger?: number;
  once?: boolean;
  /** Trigger control: when true, runs the word-by-word reveal */
  trigger?: boolean;
  /** Trigger animation immediately on mount */
  animateOnMount?: boolean;
}

export function TextReveal({
  text,
  className,
  as: Tag = "span",
  delay = 0,
  stagger = 0.055,
  trigger = true,
  animateOnMount = false,
}: TextRevealProps) {
  const reducedMotion = useReducedMotion();
  const words = React.useMemo(() => text.split(" "), [text]);
  const shouldAnimate = trigger || animateOnMount;

  return (
    <Tag data-slot="text-reveal" className={cn("inline-block", className)}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        initial="hidden"
        animate={shouldAnimate ? "visible" : "hidden"}
        transition={{
          staggerChildren: stagger,
          delayChildren: delay,
        }}
        className="inline"
      >
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            className="inline-block will-change-[transform,opacity,filter]"
            variants={{
              hidden: {
                opacity: 0,
                y: 16,
                filter: "blur(12px)",
              },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: reducedMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    },
              },
            }}
          >
            {word}
            {i < words.length - 1 && "\u00A0"}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
