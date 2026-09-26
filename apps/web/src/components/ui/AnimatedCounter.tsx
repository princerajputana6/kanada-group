"use client";

import { useRef } from "react";
import { gsap, MEDIA, useGsap } from "@/lib/animations/gsap";

/**
 * Counts up to `value` when scrolled into view (power3.out, not linear).
 * The final value is server-rendered so it's correct without JS, for
 * crawlers and under reduced motion.
 */
export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const format = (n: number) =>
    `${prefix}${n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  const numRef = useRef<HTMLSpanElement>(null);

  const ref = useGsap<HTMLSpanElement>(({ scope, mm }) => {
    mm.add(MEDIA.motionOk, () => {
      const el = numRef.current;
      if (!el) return;
      const state = { n: 0 };
      el.textContent = format(0);
      gsap.to(state, {
        n: value,
        duration: 2,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = format(state.n);
        },
        scrollTrigger: { trigger: scope, start: "top 88%", once: true },
      });
      return () => {
        el.textContent = format(value);
      };
    });
  }, [value, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      <span ref={numRef} className="tabular-nums">
        {format(value)}
      </span>
    </span>
  );
}
