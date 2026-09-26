"use client";

import { gsap, MEDIA } from "./gsap";

/**
 * Subtle magnetic pull toward the cursor, capped at `strength` px.
 * No-op on touch devices and under reduced motion. Returns teardown.
 */
export function magnetic(el: HTMLElement, strength = 10): () => void {
  if (
    !window.matchMedia(MEDIA.finePointer).matches ||
    !window.matchMedia(MEDIA.motionOk).matches
  ) {
    return () => {};
  }

  const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    xTo(gsap.utils.clamp(-1, 1, dx) * strength);
    yTo(gsap.utils.clamp(-1, 1, dy) * strength);
  };
  const onLeave = () => {
    xTo(0);
    yTo(0);
  };

  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  return () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    gsap.set(el, { x: 0, y: 0 });
  };
}
