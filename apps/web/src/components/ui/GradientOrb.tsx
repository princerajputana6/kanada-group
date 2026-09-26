import { cn } from "@kanada/ui";

type OrbColor = "purple" | "blue" | "cyan" | "warm" | "mixed";

/**
 * A large soft light source. Built from a radial gradient rather than
 * filter: blur(), so several can sit on a page without compositing cost.
 */
export function GradientOrb({
  color = "purple",
  className,
  ...props
}: { color?: OrbColor; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(`glow-${color} pointer-events-none absolute rounded-full`, className)}
      {...props}
    />
  );
}
