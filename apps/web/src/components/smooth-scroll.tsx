"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { startSmoothScroll } from "@/lib/animations/scroll";
import { ScrollTrigger } from "@/lib/animations/gsap";

/**
 * Lenis on the public, content-led pages only. Dashboards, the lesson
 * player and admin tables keep native scrolling — they're tools, and
 * nested scroll areas there shouldn't fight a scroll smoother.
 */
const APP_AREAS = ["/student", "/teacher", "/admin"];

export function SmoothScroll() {
  const pathname = usePathname();
  const enabled = !APP_AREAS.some((p) => pathname.startsWith(p));

  useEffect(() => (enabled ? startSmoothScroll() : undefined), [enabled]);

  // New route → new triggers; recompute positions once layout settles.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
