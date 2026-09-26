import { cn } from "@kanada/ui";

/**
 * Infinite, slow, pause-on-hover marquee. Items are rendered twice so the
 * -50% translate loops seamlessly; the duplicate is hidden from assistive
 * tech. Items are muted by default and brighten on hover.
 */
export function LogoMarquee({
  items,
  className,
  duration = 45,
  label,
}: {
  items: React.ReactNode[];
  className?: string;
  duration?: number;
  label: string;
}) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-12 pr-12">
      {items.map((item, i) => (
        <li
          key={i}
          className="whitespace-nowrap text-muted-foreground/70 grayscale transition-colors duration-300 hover:text-white hover:grayscale-0"
        >
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      role="region"
      aria-label={label}
      className={cn(
        "marquee relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
    >
      <div
        className="animate-marquee flex w-max"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
