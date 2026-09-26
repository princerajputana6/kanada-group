"use client";

import Lenis from "lenis";
import { gsap, MEDIA, ScrollTrigger } from "./gsap";

/**
 * Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger and Lenis
 * share one frame loop. Touch devices keep native scrolling (syncTouch off),
 * and nothing is created when the visitor prefers reduced motion.
 * Returns a teardown function.
 */
export function startSmoothScroll(): () => void {
  if (window.matchMedia(MEDIA.reduced).matches) return () => {};

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  });

  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Fonts/images shifting layout after load would leave triggers stale.
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh);
  document.fonts?.ready.then(refresh).catch(() => {});

  return () => {
    window.removeEventListener("load", refresh);
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  };
}
