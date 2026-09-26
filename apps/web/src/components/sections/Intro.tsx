import { TextReveal } from "@/components/ui/TextReveal";
import { LightBeam } from "@/components/ui/LightBeam";

/**
 * Positioning statement. Slides up over the receding hero (negative
 * margin + opaque rounded top), giving the page its first sense of depth.
 */
export function Intro() {
  return (
    <section
      aria-label="About Kanada Group"
      className="relative z-10 -mt-24 rounded-t-[40px] border-t border-white/[0.08] bg-background px-4 pb-28 pt-24 sm:px-8 md:pb-40 md:pt-36"
    >
      <LightBeam className="absolute inset-x-[10%] top-0 w-auto" />
      <div className="mx-auto max-w-container">
        <p className="eyebrow mb-10">Why Kanada</p>
        <TextReveal
          as="p"
          stagger={0.025}
          className="max-w-6xl font-display text-[clamp(1.9rem,4.2vw,4rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-white"
          lineClassNames={[undefined, "text-muted-foreground/60"]}
        >
          {[
            "Ancient thinkers imagined a world built from indivisible particles.",
            "Today, engineers place billions of transistors on a sliver of silicon.",
            "We teach you how.",
          ]}
        </TextReveal>
      </div>
    </section>
  );
}
