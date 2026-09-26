import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { LightBeam } from "@/components/ui/LightBeam";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TextReveal } from "@/components/ui/TextReveal";

export function CTA() {
  return (
    <section aria-labelledby="cta-title" className="px-4 sm:px-8">
      <div className="theme-dark relative mx-auto max-w-container overflow-hidden rounded-[40px] border border-white/10 bg-background px-6 py-24 text-center sm:px-12 md:py-32">
        <GlowBackground variant="cta" />
        <LightBeam className="absolute inset-x-0 top-0" />
        <div className="relative">
          <p className="eyebrow mb-8 justify-center">Start today — it&apos;s free</p>
          <TextReveal
            id="cta-title"
            className="mx-auto max-w-5xl font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.05em] text-white"
            lineClassNames={[undefined, "words-gradient"]}
          >
            {["Your first chip starts", "with a single lesson."]}
          </TextReveal>
          <p className="mx-auto mt-8 max-w-xl text-muted-foreground md:text-lg">
            Create an account in seconds, enroll in any course, and learn at your own pace.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MagneticButton>
              <AnimatedButton href="/sign-up" size="lg">
                Create a free account
              </AnimatedButton>
            </MagneticButton>
            <AnimatedButton href="/courses" size="lg" variant="secondary" arrow={false}>
              Browse courses
            </AnimatedButton>
          </div>
        </div>
      </div>
    </section>
  );
}
