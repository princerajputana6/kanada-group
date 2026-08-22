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
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
      whileHover={{ y: -4, boxShadow: "0 12px 24px -12px rgb(0 0 0 / 0.18)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
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
 * container's `staggerChildren` cascades the entrance automatically. */
export const StaggerGrid = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="show"
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
