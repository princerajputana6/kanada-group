import { cn } from "@kanada/ui";

/** Subtle 80px technical grid, radially masked so it fades at the edges. */
export function BackgroundGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("background-grid pointer-events-none absolute inset-0", className)}
    />
  );
}
