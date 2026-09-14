import { cn } from "@kanada/ui";

/** Microchip mark — the brand icon. Gradient stroke + glowing core. */
export function ChipMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="chipGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="0.5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {/* pins */}
      <g stroke="url(#chipGrad)" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2.5" x2="12" y2="6.5" />
        <line x1="20" y1="2.5" x2="20" y2="6.5" />
        <line x1="12" y1="25.5" x2="12" y2="29.5" />
        <line x1="20" y1="25.5" x2="20" y2="29.5" />
        <line x1="2.5" y1="12" x2="6.5" y2="12" />
        <line x1="2.5" y1="20" x2="6.5" y2="20" />
        <line x1="25.5" y1="12" x2="29.5" y2="12" />
        <line x1="25.5" y1="20" x2="29.5" y2="20" />
      </g>
      {/* die */}
      <rect
        x="6.5"
        y="6.5"
        width="19"
        height="19"
        rx="4.5"
        fill="url(#chipGrad)"
        fillOpacity="0.14"
        stroke="url(#chipGrad)"
        strokeWidth="2"
      />
      {/* core */}
      <rect x="12.5" y="12.5" width="7" height="7" rx="1.8" fill="url(#chipGrad)" />
    </svg>
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
      <ChipMark className="h-8 w-8 shrink-0 transition-transform duration-300 group-hover:rotate-6" />
      {showText && (
        <span className="text-lg font-bold tracking-tight">
          Kanada <span className="text-gradient">Group</span>
        </span>
      )}
    </span>
  );
}
