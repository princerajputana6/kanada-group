import { cn } from "@kanada/ui";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { HorizontalScroll } from "@/components/ui/HorizontalScroll";
import { TextReveal } from "@/components/ui/TextReveal";

const TRACKS = [
  {
    title: "Semiconductor Fundamentals",
    body: "Band theory, PN junctions and MOSFET physics — the ground truth every design decision rests on.",
    tags: ["Device physics", "PN junctions", "MOSFETs"],
    accent: "from-[#7C3AED]/40",
    glyph: "M8 40h64M8 24h64M40 8v64", // lattice
  },
  {
    title: "CMOS Technology",
    body: "From the inverter up: logic styles, the fabrication flow, scaling, and the power–performance–area trade-offs.",
    tags: ["CMOS logic", "Fabrication", "PPA"],
    accent: "from-[#3B82F6]/40",
    glyph: "M40 8v20M40 52v20M24 28h32v24H24z", // transistor pair
  },
  {
    title: "RTL Design & Verification",
    body: "Write synthesizable Verilog and SystemVerilog, then prove it works with testbenches, assertions and coverage.",
    tags: ["Verilog", "SystemVerilog", "Testbenches"],
    accent: "from-[#22D3EE]/35",
    glyph: "M8 56h16V24h16v32h16V24h16", // waveform
  },
  {
    title: "Physical Design to Tapeout",
    body: "Synthesis, floorplanning, placement, clock trees, routing, timing closure and signoff — all the way to GDSII.",
    tags: ["STA", "Place & route", "DRC / LVS"],
    accent: "from-[#FF7A18]/30",
    glyph: "M12 12h24v24H12zM44 12h24v56H44zM12 44h24v24H12z", // floorplan
  },
  {
    title: "Analog IC Design",
    body: "Current mirrors, amplifiers and data converters — designing where signals are continuous and every millivolt counts.",
    tags: ["Op-amps", "Data converters", "Layout"],
    accent: "from-[#FDBA3B]/30",
    glyph: "M8 40c8-24 16-24 24 0s16 24 24 0 12-20 16-12", // sine
  },
];

export function Tracks() {
  return (
    <HorizontalScroll
      className="py-20 lg:flex lg:min-h-screen lg:flex-col lg:justify-center"
      header={
        <div className="mx-auto mb-12 flex max-w-container flex-col gap-6 px-4 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow mb-6">The learning path</p>
            <TextReveal className="font-display text-[clamp(2.25rem,4.6vw,4.25rem)] font-bold leading-[0.95] tracking-[-0.045em]">
              {["Five tracks.", "One path to silicon."]}
            </TextReveal>
          </div>
          <p className="max-w-sm text-muted-foreground">
            The curriculum follows the way chips are actually built — from device physics to a
            design that&apos;s ready for the fab.
          </p>
        </div>
      }
    >
      {TRACKS.map((t, i) => (
        <article
          key={t.title}
          className="glass group relative flex h-[400px] w-[82vw] max-w-[380px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl p-7 transition-colors duration-500 hover:border-white/20 sm:h-[420px]"
        >
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-x-0 top-0 h-48 bg-gradient-to-b to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100",
              t.accent,
            )}
          />
          <div className="relative flex items-start justify-between">
            <span className="font-display text-sm font-semibold tabular-nums text-white/60">
              {String(i + 1).padStart(2, "0")}
            </span>
            <svg aria-hidden="true" viewBox="0 0 80 80" className="h-16 w-16 text-white/50">
              <path d={t.glyph} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="relative mt-auto font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-[28px]">
            {t.title}
          </h3>
          <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
          <ul className="relative mt-6 flex flex-wrap gap-2">
            {t.tags.map((tag) => (
              <li key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                {tag}
              </li>
            ))}
          </ul>
        </article>
      ))}

      <article className="relative flex h-[400px] w-[82vw] max-w-[380px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl border border-electric-purple/40 bg-[linear-gradient(160deg,rgba(124,58,237,0.35),rgba(10,10,13,0.9)_65%)] p-7 sm:h-[420px]">
        <div aria-hidden="true" className="glow-purple absolute -right-24 -top-24 h-72 w-72" />
        <p className="relative eyebrow">Start anywhere</p>
        <div className="relative">
          <h3 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-white">
            Pick a course and press play.
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">Every course is free to enroll.</p>
          <AnimatedButton href="/courses" className="mt-6">
            Explore the catalog
          </AnimatedButton>
        </div>
      </article>
    </HorizontalScroll>
  );
}
