import { cva } from "class-variance-authority";

/**
 * Split out from button.tsx (which is "use client" for framer-motion)
 * specifically so Server Components can call this plain className-builder
 * directly — e.g. to style a bare `<Link>` as a button — without tripping
 * React Server Components' rule that every export of a "use client" module
 * is a client reference and can't be invoked from server code.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background-color,background-position,border-color,box-shadow,color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,#7C3AED,#8B5CF6_50%,#6D28D9)] bg-[length:200%_100%] bg-left text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_30px_-10px_rgba(124,58,237,0.7)] hover:bg-right hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_40px_-8px_rgba(139,92,246,0.85)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-white/15 bg-white/[0.03] text-foreground hover:border-white/30 hover:bg-white/[0.07]",
        ghost: "hover:bg-white/[0.06] hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-electric-lilac underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
