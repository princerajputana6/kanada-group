"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../lib/cn";

/**
 * Same visual language as `Card`, but a motion.div so grids of these can be
 * staggered in on mount and lift on hover — used anywhere cards are the
 * primary browsing surface (course catalogs, dashboards).
 */
export const MotionCard = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] text-card-foreground shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-colors duration-300 hover:border-white/20",
        className,
      )}
      whileHover={{ y: -5, boxShadow: "0 20px 60px -20px rgba(124,58,237,0.45)" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    />
  );
});
MotionCard.displayName = "MotionCard";

export const cardListStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

export const cardItemFade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/** Wrap a grid of cards in this; give each card `<StaggerItem>` — the
 * container's `staggerChildren` cascades the entrance automatically.
 * `inView` defers the entrance until the grid scrolls into view. */
export const StaggerGrid = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { inView?: boolean }
>(
  ({ children, inView = false, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      {...(inView
        ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -15% 0px" } }
        : { animate: "show" })}
      variants={cardListStagger}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
StaggerGrid.displayName = "StaggerGrid";

export const StaggerItem = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} variants={cardItemFade} {...props}>
      {children}
    </motion.div>
  ),
);
StaggerItem.displayName = "StaggerItem";
