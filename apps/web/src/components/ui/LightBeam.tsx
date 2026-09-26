import { cn } from "@kanada/ui";

/**
 * A thin horizontal line of purple light with a slow sweep travelling
 * across it. Used on section seams, the hero floor and the final CTA.
 */
export function LightBeam({ className, sweep = true }: { className?: string; sweep?: boolean }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none relative h-px w-full overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {sweep && <div className="light-beam animate-beam absolute inset-y-0 left-0 w-1/2" />}
    </div>
  );
}
