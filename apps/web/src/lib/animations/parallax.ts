"use client";

import { gsap } from "./gsap";

/**
 * Scrubbed vertical drift of `speed` px across the element's pass through
 * the viewport. Guidance: background ≈ 20, imagery ≈ 40, foreground ≈ 60.
 * Callers gate this behind MEDIA.desktop.
 */
export function parallax(el: Element, speed = 40) {
  return gsap.fromTo(
    el,
    { y: -speed / 2 },
    {
      y: speed / 2,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    },
  );
}
