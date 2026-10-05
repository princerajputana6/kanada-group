"use client";

import { gsap, MEDIA, useGsap } from "@/lib/animations/gsap";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { LightBeam } from "@/components/ui/LightBeam";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TextReveal } from "@/components/ui/TextReveal";
import { DieVisual } from "./DieVisual";

const HIGHLIGHTS = ["Free to enroll", "Self-paced video lessons", "Industry practitioners"];

export function Hero() {
  const ref = useGsap<HTMLElement>(({ scope, mm }) => {
    const q = gsap.utils.selector(scope);

    mm.add(MEDIA.motionOk, () => {
      // Entrance: eyebrow 150ms → headline lines 250/350/450ms → copy 650ms
      // → CTAs 800ms → visual 1000ms. The navbar enters at 0 on its own.
      const rise = { opacity: 1, y: 0, duration: 1.1, ease: "power4.out" };
      const tl = gsap.timeline();
      tl.fromTo(q("[data-hero='eyebrow']"), { opacity: 0, y: 30 }, rise, 0.15);
      tl.set(q("h1"), { opacity: 1 }, 0.25);
      q("h1 [data-line]").forEach((line, i) => {
        tl.fromTo(
          line.querySelectorAll("[data-word]"),
          { yPercent: 115 },
          { yPercent: 0, duration: 1.2, stagger: 0.06, ease: "power4.out" },
          0.25 + i * 0.1,
        );
      });
      tl.fromTo(q("[data-hero='copy']"), { opacity: 0, y: 40 }, rise, 0.65);
      tl.fromTo(q("[data-hero='cta']"), { opacity: 0, y: 40 }, rise, 0.8);
      tl.fromTo(
        q("[data-hero='visual']"),
        { opacity: 0, y: 60, scale: 0.94 },
        { ...rise, scale: 1, duration: 1.6 },
        1.0,
      );
    });

    // Scroll-out: content recedes (scale/opacity/lift) while the backdrop
    // drifts at a different rate; the next section slides over the top.
    mm.add(MEDIA.desktop, () => {
      const st = { trigger: scope, start: "top top", end: "bottom top", scrub: true };
      gsap.to(q("[data-hero='stage']"), { scale: 0.92, opacity: 0.35, y: -80, ease: "none", scrollTrigger: st });
      gsap.to(q("[data-parallax-bg]"), { y: 160, ease: "none", scrollTrigger: st });
    });
  });

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className="theme-dark relative -mt-16 overflow-hidden bg-background pb-40 pt-32 sm:pt-40 lg:min-h-[100svh] lg:pb-48"
    >
      <GlowBackground variant="hero" />

      <div
        data-hero="stage"
        className="relative mx-auto grid max-w-container origin-top items-center gap-14 px-4 sm:px-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)] xl:gap-10"
      >
        <div>
          <p data-hero="eyebrow" data-hero-reveal className="eyebrow mb-8">
            Inspired by ancient wisdom. Driven by modern innovation.
          </p>

          <TextReveal
            as="h1"
            id="hero-title"
            mode="manual"
            data-hero-reveal
            className="font-display text-[clamp(3rem,8vw,6.9rem)] xl:text-[clamp(3rem,6.6vw,6.9rem)] font-bold leading-[0.92] tracking-[-0.055em] text-white"
            lineClassNames={[undefined, undefined, "words-gradient"]}
          >
            {["Learn VLSI design", "from basic", "to advance."]}
          </TextReveal>

          <p
            data-hero="copy"
            data-hero-reveal
            className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Digital &amp; analog VLSI training from industry experts — semiconductor
            fundamentals, CMOS technology, RTL to tapeout, and analog IC design, now on your
            schedule.
          </p>

          <div data-hero="cta" data-hero-reveal className="mt-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagneticButton>
                <AnimatedButton href="/courses" size="lg" className="w-full sm:w-auto">
                  Browse courses
                </AnimatedButton>
              </MagneticButton>
              <AnimatedButton href="/sign-up" size="lg" variant="secondary" arrow={false}>
                Register Yourself
              </AnimatedButton>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-subtle">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-electric-cyan shadow-[0_0_10px_#22D3EE]" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div data-hero="visual" data-hero-reveal className="relative mx-auto w-full max-w-[460px]">
          <div aria-hidden="true" className="glow-purple absolute -inset-16 rounded-full" />
          <div className="relative rounded-[32px] border border-white/10 bg-white/[0.02] p-3 shadow-[0_40px_120px_-40px_rgba(33, 131, 144,0.6)]">
            <DieVisual className="h-auto w-full" />
          </div>
          <div className="glass absolute -bottom-6 left-4 right-4 rounded-2xl px-4 py-3 sm:left-auto sm:right-[-1.5rem] sm:min-w-64">
            <p className="text-xs font-medium text-subtle">Now playing</p>
            <p className="mt-0.5 text-sm font-semibold text-white">CMOS Inverter Operation</p>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#218390] to-[#22D3EE]" />
            </div>
          </div>
        </div>
      </div>

      <LightBeam className="absolute inset-x-0 bottom-24" />
    </section>
  );
}
