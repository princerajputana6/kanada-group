import { cn } from "@kanada/ui";
import { BackgroundGrid } from "./BackgroundGrid";
import { GradientOrb } from "./GradientOrb";

/**
 * The layered backdrop used behind hero-grade sections:
 * dark base → radial glows → technical grid. Content sits above it.
 */
export function GlowBackground({
  className,
  grid = true,
  variant = "hero",
}: {
  className?: string;
  grid?: boolean;
  variant?: "hero" | "section" | "cta";
}) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {variant === "hero" && (
        <div data-parallax-bg className="absolute inset-0">
          <GradientOrb color="purple" className="-top-40 left-1/2 h-[900px] w-[900px] -translate-x-1/2" />
          <GradientOrb color="blue" className="right-[-10%] top-1/3 h-[600px] w-[600px]" />
          <GradientOrb color="warm" className="bottom-[-20%] left-[-10%] h-[520px] w-[520px] opacity-70" />
        </div>
      )}
      {variant === "section" && (
        <GradientOrb color="mixed" className="left-1/2 top-1/2 h-[800px] w-[1100px] -translate-x-1/2 -translate-y-1/2 opacity-80" />
      )}
      {variant === "cta" && (
        <>
          <GradientOrb color="purple" className="left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2" />
          <GradientOrb color="cyan" className="right-[5%] top-[10%] h-[400px] w-[400px]" />
          <GradientOrb color="warm" className="bottom-[-10%] left-[10%] h-[380px] w-[380px]" />
        </>
      )}
      {grid && <BackgroundGrid />}
    </div>
  );
}
