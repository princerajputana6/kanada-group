import { cn } from "@kanada/ui";
import { TextReveal } from "./TextReveal";

/** Eyebrow + masked-reveal title + optional description. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  as = "h2",
}: {
  eyebrow?: string;
  title: string | string[];
  description?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div
      className={cn(
        "max-w-4xl",
        align === "center" && "mx-auto text-center [&_.eyebrow]:justify-center",
        className,
      )}
    >
      {eyebrow && <p className="eyebrow mb-6">{eyebrow}</p>}
      <TextReveal as={as} className="text-section text-foreground">
        {title}
      </TextReveal>
      {description && (
        <p
          className={cn(
            "mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
