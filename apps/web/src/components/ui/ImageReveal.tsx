"use client";

import { cn } from "@kanada/ui";
import { MEDIA, useGsap } from "@/lib/animations/gsap";
import { revealImage } from "@/lib/animations/reveal";

/**
 * Clip-path wipe (left → right) for imagery and visual panels. The inner
 * element also settles from a slight zoom for depth. Static under reduced
 * motion.
 */
export function ImageReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useGsap<HTMLDivElement>(({ scope, mm }) => {
    mm.add(MEDIA.motionOk, () => {
      revealImage(scope, { delay });
    });
  }, [delay]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {children}
    </div>
  );
}
