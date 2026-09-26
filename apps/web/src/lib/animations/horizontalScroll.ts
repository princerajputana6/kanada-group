"use client";

import { gsap } from "./gsap";

/**
 * Pins `section` and translates `track` horizontally as the user scrolls
 * vertically, then releases. Distance is recomputed on refresh so resizes
 * stay correct. Callers gate this behind MEDIA.desktop — mobile gets a
 * native swipeable row instead.
 */
export function horizontalScroll(section: HTMLElement, track: HTMLElement) {
  const distance = () => Math.max(0, track.scrollWidth - section.clientWidth);

  return gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });
}
