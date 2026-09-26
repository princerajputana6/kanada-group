"use client";

import { useEffect, useLayoutEffect, useRef, type DependencyList, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The one place GSAP plugins are registered. Every animation module imports
 * gsap/ScrollTrigger from here so registration happens exactly once.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power4.out", duration: 1 });
}

export { gsap, ScrollTrigger };

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const MEDIA = {
  /** Fine pointer + hover + motion allowed — magnetic/parallax territory. */
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
  motionOk: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(MEDIA.reduced).matches;
}

/**
 * Runs `setup` inside a gsap.context scoped to `scope`, reverting every
 * tween/ScrollTrigger it created on unmount (or when deps change). Layout
 * effect so initial `from` states apply before first paint — no flash.
 */
export function useGsap<T extends HTMLElement>(
  setup: (ctx: { scope: T; mm: gsap.MatchMedia }) => void | (() => void),
  deps: DependencyList = [],
): RefObject<T | null> {
  const scope = useRef<T>(null);

  useIsoLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {
      cleanup = setup({ scope: el, mm });
    }, el);
    return () => {
      cleanup?.();
      mm.revert();
      ctx.revert();
    };
  }, deps);

  return scope;
}
