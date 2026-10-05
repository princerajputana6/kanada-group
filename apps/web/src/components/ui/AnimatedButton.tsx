import Link from "next/link";
import { cn } from "@kanada/ui";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-medium transition-[box-shadow,background-color,border-color,color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-lilac focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const variants: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(135deg,#218390,#2ba3b4_50%,#1a6b76)] bg-[length:200%_100%] bg-left text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_40px_-10px_rgba(33, 131, 144,0.7)] transition-[background-position,box-shadow] hover:bg-right hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_14px_60px_-8px_rgba(43, 163, 180,0.9)]",
  secondary:
    "border border-foreground/15 bg-foreground/[0.03] text-foreground backdrop-blur hover:border-foreground/30 hover:bg-foreground/[0.06]",
  ghost: "text-muted-foreground hover:text-foreground",
};

const sizes = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-[15px]",
};

/**
 * Link-styled CTA with an arrow that slides right on hover. Server-safe;
 * wrap in <MagneticButton> for the desktop cursor pull.
 */
export function AnimatedButton({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = true,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: keyof typeof sizes;
  arrow?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      <span className="relative">{children}</span>
      {arrow && (
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="relative h-4 w-4 transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-1"
        >
          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </Link>
  );
}
