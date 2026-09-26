"use client";

import { createElement, Fragment } from "react";
import { cn } from "@kanada/ui";
import { gsap, MEDIA, useGsap } from "@/lib/animations/gsap";
import { splitWords } from "@/lib/animations/splitText";

type Tag = "h1" | "h2" | "h3" | "p" | "div";

/**
 * Masked word-by-word reveal. `children` is a string, or an array of
 * strings for explicit lines. mode="scroll" animates itself on entering
 * the viewport; mode="manual" only renders the markup so a parent timeline
 * (e.g. the hero) can target `[data-word]`.
 */
export function TextReveal({
  children,
  as = "h2",
  className,
  lineClassNames,
  mode = "scroll",
  stagger = 0.06,
  ...rest
}: {
  children: string | string[];
  as?: Tag;
  className?: string;
  /** Per-line classes, by index (must stay serializable for Server Components). */
  lineClassNames?: (string | undefined)[];
  mode?: "scroll" | "manual";
  stagger?: number;
} & Omit<React.HTMLAttributes<HTMLElement>, "children">) {
  const lines = Array.isArray(children) ? children : [children];

  const ref = useGsap<HTMLElement>(
    ({ scope, mm }) => {
      if (mode !== "scroll") return;
      mm.add(MEDIA.motionOk, () => {
        gsap.from(scope.querySelectorAll("[data-word]"), {
          yPercent: 110,
          opacity: 0,
          duration: 1.1,
          stagger,
          scrollTrigger: { trigger: scope, start: "top 85%", once: true },
        });
      });
    },
    [mode, stagger],
  );

  return createElement(
    as,
    { ref, className, ...rest },
    lines.map((line, li) => (
      <span
        key={li}
        data-line
        className={cn("block", lineClassNames?.[li])}
      >
        {splitWords(line).map((word, wi) => (
          <Fragment key={wi}>
            {wi > 0 && " "}
            <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
              <span data-word className="inline-block will-change-transform">
                {word}
              </span>
            </span>
          </Fragment>
        ))}
      </span>
    )),
  );
}
