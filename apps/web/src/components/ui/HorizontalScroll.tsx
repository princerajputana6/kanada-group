"use client";

import { useRef } from "react";
import { cn } from "@kanada/ui";
import { MEDIA, useGsap } from "@/lib/animations/gsap";
import { horizontalScroll } from "@/lib/animations/horizontalScroll";

/**
 * Desktop: the section pins and `children` (a row of cards) slides
 * horizontally with vertical scroll, then releases. Mobile/reduced motion:
 * a native, snap-aligned swipeable row — no scroll hijacking.
 */
export function HorizontalScroll({
  header,
  children,
  className,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const ref = useGsap<HTMLElement>(({ scope, mm }) => {
    mm.add(MEDIA.desktop, () => {
      if (trackRef.current) horizontalScroll(scope, trackRef.current);
    });
  });

  return (
    <section ref={ref} className={cn("relative overflow-hidden", className)}>
      {header}
      <div
        className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        <div
          ref={trackRef}
          className="flex w-max snap-x snap-mandatory gap-4 px-4 pb-4 sm:gap-6 sm:px-8 lg:snap-none lg:px-[max(2rem,calc((100vw-1400px)/2+2rem))]"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
