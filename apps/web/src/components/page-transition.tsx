"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Per-route entrance, CSS-only. Keyed by pathname so it replays on navigation.
 * Deliberately not framer: this wraps every page, so a paused/observer-stuck
 * opacity animation could hide the entire app. A CSS keyframe with `fill-mode:
 * both` always resolves to visible and never depends on rAF/observers.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
