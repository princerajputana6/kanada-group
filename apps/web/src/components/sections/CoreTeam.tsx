import { SectionHeading } from "@/components/ui/SectionHeading";

interface Member {
  name: string;
  role: string;
}

const TEAM: Member[] = [
  { name: "Er. Deepak", role: "Director — Digital Design" },
  { name: "Dr. Anshul Verma", role: "Director — Analog Design" },
  { name: "Priyam Shukla", role: "Junior Manager" },
  { name: "Tejal Patel", role: "Industry Expert — Physical Design" },
  { name: "Dr. Rahul Mishra", role: "Mentor — Digital Design" },
  { name: "Er. Ronit Mishra", role: "Industry Expert — Memory Design" },
  { name: "Dr. Vibhu Srivastava", role: "Mentor — Device Fabrication" },
  { name: "Dr. Pritesh", role: "Mentor — Analog Design" },
];

/** Initials from a name, e.g. "Dr. Anshul Verma" → "AV", "Er. Deepak" → "DE". */
function initials(name: string): string {
  const parts = name
    .replace(/\b(Dr|Er|Mr|Ms|Mrs)\b\.?/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function CoreTeam() {
  return (
    <section
      aria-labelledby="core-team-title"
      className="mx-auto max-w-container px-4 py-24 sm:px-8 md:py-32"
    >
      <div className="mb-14 text-center">
        <SectionHeading
          eyebrow="People"
          title={["Our core team"]}
          align="center"
        />
        <p className="mx-auto mt-5 max-w-2xl text-muted-foreground md:text-lg">
          Industry practitioners, researchers and mentors guiding you from
          fundamentals to tapeout.
        </p>
      </div>

      <ul className="reveal-stagger grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {TEAM.map((m) => (
          <li
            key={m.name}
            className="group flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/40"
          >
            <span
              aria-hidden="true"
              className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold uppercase text-primary-foreground shadow-sm"
            >
              {initials(m.name)}
            </span>
            <div>
              <p className="font-semibold leading-tight text-foreground">{m.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{m.role}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
