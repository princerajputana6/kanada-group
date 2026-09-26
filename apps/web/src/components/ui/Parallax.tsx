"use client";

import { MEDIA, useGsap } from "@/lib/animations/gsap";
import { parallax } from "@/lib/animations/parallax";

/** Scroll-scrubbed vertical drift. Desktop only; static on mobile/reduced motion. */
export function Parallax({
  children,
  speed = 40,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useGsap<HTMLDivElement>(({ scope, mm }) => {
    mm.add(MEDIA.desktop, () => {
      parallax(scope, speed);
    });
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
