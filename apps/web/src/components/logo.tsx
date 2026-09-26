import { cn } from "@kanada/ui";

/**
 * Kanada emblem — the meditating sage within atomic orbits. Rendered as a CSS
 * mask over /brand/kanada-emblem.png so its colour follows the theme
 * (--logo-color: brand teal on light, a brighter teal inside .theme-dark).
 */
export function Emblem({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block aspect-[1562/1498] shrink-0 bg-[color:var(--logo-color)]", className)}
      style={{
        WebkitMaskImage: "url(/brand/kanada-emblem.png)",
        maskImage: "url(/brand/kanada-emblem.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        // The fill is a background colour; keep it when printing (certificates).
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    />
  );
}

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Emblem className="h-9 transition-transform duration-500 ease-out-expo group-hover:scale-105" />
      {showText && (
        <span className="text-lg font-bold tracking-tight">
          Kanada <span className="text-[color:var(--logo-color)]">Group</span>
        </span>
      )}
    </span>
  );
}
