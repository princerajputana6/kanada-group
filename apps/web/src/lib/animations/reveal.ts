"use client";

import { gsap } from "./gsap";

/** Fade + rise when `el` scrolls into view. Used by section-level reveals. */
export function revealOnScroll(
  targets: gsap.TweenTarget,
  trigger: Element,
  vars: gsap.TweenVars = {},
) {
  return gsap.from(targets, {
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.08,
    ...vars,
    scrollTrigger: { trigger, start: "top 82%", once: true },
  });
}

/** Left-to-right clip-path wipe — used instead of generic fades for imagery. */
export function revealImage(el: Element, vars: gsap.TweenVars = {}) {
  return gsap.fromTo(
    el,
    { clipPath: "inset(0 100% 0 0)" },
    {
      clipPath: "inset(0 0% 0 0)",
      duration: 1.1,
      ease: "power3.inOut",
      ...vars,
      scrollTrigger: vars.scrollTrigger ?? { trigger: el, start: "top 85%", once: true },
    },
  );
}
