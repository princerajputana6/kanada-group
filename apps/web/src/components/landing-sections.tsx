"use client";

import Link from "next/link";
import { buttonVariants, cn } from "@kanada/ui";
import { AnimatedCounter } from "./animated-counter";
import { ChipIllustration } from "./chip-illustration";
import {
  AuroraOrbs,
  Magnetic,
  Reveal,
  RevealGroup,
  RevealItem,
  SpotlightCard,
} from "./motion-primitives";

/* --------------------------------- Marquee -------------------------------- */

const MARQUEE_ITEMS = [
  "Verilog",
  "SystemVerilog",
  "CMOS",
  "RTL Design",
  "Synopsys",
  "Cadence",
  "Static Timing Analysis",
  "Physical Design",
  "Op-Amps",
  "Bandgap References",
  "FPGA",
  "DFT & Scan",
  "Data Converters",
  "Tapeout",
];

export function MarqueeSection() {
  return (
    <section className="border-y border-border bg-secondary/20 py-8">
      <div className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        Tools &amp; topics you&apos;ll master
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-marquee pause-on-hover gap-4">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="rounded-full border border-border glass px-5 py-2 text-sm font-medium text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Stats --------------------------------- */

export function StatsSection() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
        <AnimatedCounter value={20} suffix="-week" label="Training program" />
        <AnimatedCounter value={2} label="Specialized tracks" />
        <AnimatedCounter value={10} suffix="+" label="Industry mentors" />
        <AnimatedCounter value={100} suffix="%" label="Hands-on projects" />
      </div>
    </section>
  );
}

/* ---------------------------------- Tracks -------------------------------- */

const TRACKS = [
  {
    title: "Digital VLSI",
    gradient: "from-blue-500/20 to-cyan-400/10",
    accent: "text-cyan-300",
    description:
      "RTL design, synthesis, physical design, STA, and DFT — from Verilog to tapeout-ready GDSII.",
    topics: ["RTL & Verilog", "Synthesis & STA", "Physical Design", "DFT & Signoff"],
  },
  {
    title: "Analog VLSI",
    gradient: "from-teal-500/20 to-cyan-500/10",
    accent: "text-teal-300",
    description:
      "Amplifiers, op-amps, bandgap references, data converters, and analog layout for real-world ICs.",
    topics: ["Op-Amps & Amplifiers", "Bandgap References", "Data Converters", "Analog Layout"],
  },
];

export function TracksSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Reveal className="mb-12 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Two tracks, <span className="text-gradient">one foundation</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Eight weeks of shared semiconductor fundamentals, then specialize in the track that
          matches your career goals.
        </p>
      </Reveal>

      <RevealGroup className="grid gap-6 sm:grid-cols-2">
        {TRACKS.map((track) => (
          <RevealItem key={track.title}>
            <SpotlightCard className="h-full rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/40">
              <div
                className={cn(
                  "mb-5 inline-flex rounded-xl bg-gradient-to-br px-4 py-2 text-sm font-semibold",
                  track.gradient,
                  track.accent,
                )}
              >
                {track.title}
              </div>
              <p className="text-sm text-muted-foreground">{track.description}</p>
              <ul className="mt-5 grid grid-cols-2 gap-3">
                {track.topics.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm">
                    <span className={track.accent}>▹</span>
                    {t}
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

/* --------------------------------- Silicon -------------------------------- */

export function SiliconSection() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-secondary/20 py-20">
      <AuroraOrbs className="opacity-50" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
        <Reveal>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            From classroom to fab
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Built for <span className="text-gradient">real silicon</span>
          </h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Every course connects theory to what actually ships. You&apos;ll write synthesizable
            RTL, simulate analog blocks, run physical design and signoff, and take a project all
            the way toward a tapeout-ready GDSII — the exact flow used in industry.
          </p>
          <ul className="mt-6 grid max-w-md grid-cols-2 gap-3 text-sm">
            {["RTL → GDSII flow", "SPICE simulation", "Physical design & STA", "DFT & signoff"].map(
              (t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="text-accent">◈</span>
                  {t}
                </li>
              ),
            )}
          </ul>
        </Reveal>

        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-full bg-primary/15 blur-3xl" />
          <div className="animate-float rounded-3xl border border-border glass p-6">
            <ChipIllustration className="aspect-[3/2] w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Roadmap --------------------------------- */

const ROADMAP = [
  {
    weeks: "Weeks 1–8",
    title: "Common Foundation",
    desc: "Semiconductor physics, MOSFETs, CMOS technology, combinational logic, and Verilog/FPGA.",
  },
  {
    weeks: "Weeks 9–14",
    title: "Specialize",
    desc: "Split into Digital (logic, layout, power, RTL) or Analog (amplifiers, op-amps).",
  },
  {
    weeks: "Weeks 15–19",
    title: "Go Advanced",
    desc: "Physical design & DFT, or analog layout, bandgap references, noise & reliability.",
  },
  {
    weeks: "Week 20",
    title: "Final Project",
    desc: "A complete design project, presented and reviewed by an external industry expert.",
  },
];

export function RoadmapSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Reveal className="mb-14 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Your <span className="text-gradient">20-week roadmap</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          A structured path from your first energy-band diagram to a tapeout-ready design.
        </p>
      </Reveal>

      <div className="relative">
        {/* connector line */}
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-primary via-accent to-cyan-500 lg:block" />
        <RevealGroup className="grid gap-8 lg:grid-cols-4">
          {ROADMAP.map((m, i) => (
            <RevealItem key={m.weeks}>
              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-background text-lg font-bold text-gradient glow-primary">
                  {i + 1}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {m.weeks}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{m.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{m.desc}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* --------------------------------- Journey -------------------------------- */

const JOURNEY = [
  { step: "01", title: "Learn", desc: "Semiconductor & circuit fundamentals, first-principles." },
  { step: "02", title: "Design", desc: "Build the circuit — RTL, schematic, or layout." },
  { step: "03", title: "Simulate", desc: "Simulate, compare, and refine your design." },
  { step: "04", title: "Build", desc: "Prototype on FPGA or take an IC toward tapeout." },
  { step: "05", title: "Innovate", desc: "Research, patent, and create something new." },
];

export function JourneySection() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-secondary/20 py-20">
      <AuroraOrbs className="opacity-60" />
      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal className="mb-14 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            From learning to <span className="text-gradient">innovation</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            A journey every student takes — the path from your first energy-band diagram to a
            tapeout-ready design.
          </p>
        </Reveal>

        <RevealGroup className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {JOURNEY.map((item) => (
            <RevealItem key={item.step}>
              <div className="group h-full rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40">
                <div className="text-2xl font-bold text-gradient">{item.step}</div>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* --------------------------------- Features ------------------------------- */

const FEATURES = [
  {
    icon: "🎓",
    title: "Industry-ready skills",
    description: "Bridge the gap between academic theory and what industry actually needs.",
  },
  {
    icon: "🧪",
    title: "Hands-on projects",
    description: "Build real RTL, analog, and physical-design projects — not just slides.",
  },
  {
    icon: "🤝",
    title: "1:1 mentorship",
    description: "Learn directly from working VLSI engineers and researchers.",
  },
  {
    icon: "📄",
    title: "Resume & referrals",
    description: "Turn coursework into a technical resume, backed by industry connections.",
  },
  {
    icon: "🎬",
    title: "Stream anywhere",
    description: "Every lecture is recorded and streamable on your own schedule.",
  },
  {
    icon: "🏆",
    title: "Verified certificate",
    description: "Earn a shareable certificate of completion for every course you finish.",
  },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Reveal className="mb-12 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          More than a <span className="text-gradient">course catalog</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          A complete training ecosystem built to bridge academia and industry.
        </p>
      </Reveal>

      <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <RevealItem key={f.title}>
            <SpotlightCard className="h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 text-2xl">
                {f.icon}
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.description}</p>
            </SpotlightCard>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

/* ------------------------------- Testimonials ----------------------------- */

const TESTIMONIALS = [
  {
    quote:
      "The foundation-first approach made everything downstream — synthesis, STA, physical design — actually make sense instead of being memorized steps.",
    name: "Aarav Sharma",
    role: "Digital VLSI Track Graduate",
  },
  {
    quote:
      "Building an actual op-amp and seeing it work in simulation taught me more than a semester of lectures.",
    name: "Priya Nair",
    role: "Analog VLSI Track Graduate",
  },
  {
    quote:
      "The resume and mentorship support is what got me past the first interview screen — not just the technical content.",
    name: "Rohan Mehta",
    role: "Digital VLSI Track Graduate",
  },
];

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Reveal className="mb-12 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          What our <span className="text-gradient">students say</span>
        </h2>
      </Reveal>

      <RevealGroup className="grid gap-6 sm:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <RevealItem key={t.name}>
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
              <div className="mb-3 text-3xl leading-none text-primary/50">&ldquo;</div>
              <p className="flex-1 text-sm text-muted-foreground">{t.quote}</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

/* ----------------------------------- CTA ---------------------------------- */

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-border p-12 text-center sm:p-16">
          <AuroraOrbs />
          <div className="absolute inset-0 bg-grid bg-grid-fade" />
          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Don&apos;t just learn VLSI. <span className="text-gradient">Create with it.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Learn → Design → Experiment → Innovate → Build. Join the next cohort today.
            </p>
            <Magnetic>
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "lg" }), "mt-8 glow-primary")}
              >
                Register Yourself
              </Link>
            </Magnetic>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
