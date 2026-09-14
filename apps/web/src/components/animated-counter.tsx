"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export function AnimatedCounter({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [forced, setForced] = useState(false);
  const [display, setDisplay] = useState(0);

  // Fallback so the number never sits stuck at 0 if the observer never fires
  // (e.g. a hidden tab pausing IntersectionObserver during load).
  useEffect(() => {
    const t = setTimeout(() => setForced(true), 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!inView && !forced) return;
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    // Guarantee the final value even if rAF is throttled to completion.
    const settle = setTimeout(() => setDisplay(value), duration + 200);
    return () => clearTimeout(settle);
  }, [inView, forced, value]);

  // Plain div (always visible); a CSS reveal handles the entrance so the block
  // can never be stranded invisible by a paused animation frame.
  return (
    <div ref={ref} className="reveal-in text-center">
      <p className="text-4xl font-bold text-gradient sm:text-5xl">
        {display}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
