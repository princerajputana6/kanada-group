import { cn } from "@kanada/ui";

/**
 * Frosted premium surface. Hover lifts 5px and brightens the border/glow;
 * a child with `data-card-media` scales to 1.04. Pure CSS, so it works in
 * Server Components and without JS.
 */
export function GlassCard({
  className,
  interactive = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "glass group/card relative overflow-hidden rounded-3xl",
        interactive &&
          "transition-[transform,border-color,box-shadow] duration-500 ease-out-expo hover:-translate-y-[5px] hover:border-primary/30 hover:shadow-[0_24px_60px_-24px_rgba(124,58,237,0.35)] focus-within:border-primary/30 [&_[data-card-media]]:transition-transform [&_[data-card-media]]:duration-700 [&_[data-card-media]]:ease-out-expo hover:[&_[data-card-media]]:scale-[1.04]",
        className,
      )}
      {...props}
    />
  );
}
