"use client";

import { useEffect, useRef } from "react";
import { magnetic } from "@/lib/animations/magnetic";

/** Wraps any CTA with a ≤10px cursor pull. Desktop + motion-allowed only. */
export function MagneticButton({
  children,
  strength = 10,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? magnetic(ref.current, strength) : undefined), [strength]);
  return (
    <div ref={ref} className={className ?? "inline-block"}>
      {children}
    </div>
  );
}
