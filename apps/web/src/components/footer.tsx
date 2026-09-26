import Link from "next/link";
import { LightBeam } from "./ui/LightBeam";

const COLUMNS = [
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/sign-up", label: "Create an account" },
      { href: "/sign-in", label: "Sign in" },
    ],
  },
  {
    title: "Tracks",
    links: [
      { href: "/courses?q=CMOS", label: "CMOS technology" },
      { href: "/courses?q=RTL", label: "RTL to tapeout" },
      { href: "/courses?q=Analog", label: "Analog IC design" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden">
      <LightBeam sweep={false} />
      <div className="mx-auto grid max-w-container gap-12 px-4 py-16 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-display text-lg font-bold tracking-tight">
            Kanada Group <span className="text-electric-lilac">LMS</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Inspired by ancient wisdom. Driven by modern innovation. Digital &amp; analog VLSI
            training, from semiconductor fundamentals to tapeout.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              {col.title}
            </p>
            <ul className="space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted-foreground transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex max-w-container flex-col gap-2 border-t border-white/[0.06] px-4 py-6 text-xs text-subtle sm:flex-row sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} Kanada Group. All rights reserved.</p>
        <p>Built for engineers who ship silicon.</p>
      </div>
      <p
        aria-hidden="true"
        className="pointer-events-none select-none bg-gradient-to-b from-white/[0.06] to-transparent bg-clip-text text-center font-display text-[18vw] font-bold leading-[0.8] tracking-[-0.06em] text-transparent"
      >
        KANADA
      </p>
    </footer>
  );
}
