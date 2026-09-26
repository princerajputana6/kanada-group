import { GlassCard } from "@/components/ui/GlassCard";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Parallax } from "@/components/ui/Parallax";
import { SectionHeading } from "@/components/ui/SectionHeading";

const LESSONS = [
  { title: "MOSFET I–V characteristics", done: true },
  { title: "CMOS inverter operation", done: true, active: true },
  { title: "Static & dynamic power", done: false },
  { title: "Noise margins", done: false },
];

/** What the platform does for a learner — mirrors real LMS features. */
export function Platform() {
  return (
    <section aria-labelledby="platform-title" className="px-4 py-28 sm:px-8 md:py-36">
      <div className="mx-auto max-w-container">
        <SectionHeading
          eyebrow="The platform"
          title={["Built for deep work,", "not doom-scrolling."]}
          description="A focused learning environment: stream lessons, pick up exactly where you stopped, and see how far you've come."
        />

        <div className="mt-16 grid gap-4 md:mt-20 lg:grid-cols-3 lg:gap-6">
          <GlassCard className="p-6 sm:p-8 lg:col-span-2 lg:row-span-2">
            <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Lessons that remember where you left off
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Seek freely through lesson videos — your position is saved, so the next session
              starts right where the last one ended.
            </p>
            <Parallax speed={30} className="mx-auto mt-8 max-w-2xl">
              <ImageReveal>
                <div
                  data-card-media
                  className="theme-dark overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-[0_30px_60px_-30px_rgba(20,16,50,0.45)]"
                >
                  <div className="relative aspect-[16/7] bg-[radial-gradient(circle_at_30%_40%,rgba(124,58,237,0.35),transparent_60%),radial-gradient(circle_at_75%_70%,rgba(34,211,238,0.18),transparent_55%)]">
                    <div className="background-grid absolute inset-0 [mask-image:none]" />
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-white">
                          <path d="M7 4.5v15l12-7.5z" />
                        </svg>
                      </span>
                    </div>
                    <div className="absolute inset-x-5 bottom-4 flex items-center gap-3 text-[11px] tabular-nums text-white/70">
                      <span>08:42</span>
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                        <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-[#7C3AED] to-[#22D3EE]" />
                      </div>
                      <span>14:57</span>
                    </div>
                  </div>
                  <ul className="divide-y divide-white/[0.06] text-sm">
                    {LESSONS.map((l, i) => (
                      <li
                        key={l.title}
                        className={`flex items-center gap-3 px-5 py-3 ${l.active ? "bg-white/[0.04] text-white" : "text-muted-foreground"}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${l.done ? "border-electric-purple bg-electric-purple/25 text-white" : "border-white/20"}`}
                        >
                          {l.done ? "✓" : i + 1}
                        </span>
                        {l.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </ImageReveal>
            </Parallax>
          </GlassCard>

          <GlassCard className="p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">Progress you can see</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Every completed lesson moves the bar. Your dashboard shows each course at a glance.
            </p>
            <div className="mt-8 space-y-4" aria-hidden="true">
              {[82, 45, 12].map((v, i) => (
                <div key={v}>
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>{["CMOS Technology", "RTL Design", "Analog IC"][i]}</span>
                    <span className="tabular-nums">{v}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.08]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#22D3EE]"
                      style={{ width: `${v}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">Taught by practitioners</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Courses are built by engineers who work in the industry, structured into sections
              and lessons you can preview before enrolling.
            </p>
            <div className="mt-8 flex -space-x-3" aria-hidden="true">
              {["#7C3AED", "#3B82F6", "#22D3EE", "#FF7A18"].map((c) => (
                <span
                  key={c}
                  className="h-11 w-11 rounded-full border-2 border-background"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${c}, #101014 75%)` }}
                />
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
