import Link from "next/link";
import { buttonVariants, cn } from "@kanada/ui";

export const metadata = {
  title: "About — Kanada Group",
  description:
    "Kanada Group bridges the gap between academia and the semiconductor industry with practical, tool-based VLSI training.",
};

const TEAM = [
  "Shulekha Dwivedi",
  "Er. Deepak Mishra",
  "Dr. Anshul Verma",
  "Dr. Rahul Mishra",
  "Dr. Vyom",
  "Er. Tejal Patel",
  "Er. PK Dwivedi",
  "Er. Sandeep",
  "Dr. Abhi",
  "Er. Ronit Mishra",
];

const WHY = [
  {
    title: "Bridge the gap",
    body: "Between private and government institutes (IITs, IIITs, and beyond), and between academia and industry.",
  },
  {
    title: "Industry-ready skills",
    body: "The industry struggles to find trained engineers. We prepare learners for real roles, not just exams.",
  },
  {
    title: "Fundamentals first",
    body: "Many institutes teach advanced tools and flows but skip the fundamentals that make you truly understand them.",
  },
  {
    title: "Theory → Practical",
    body: "We build fundamentals that enable long-term career progression and industry-relevant research.",
  },
];

function Dot() {
  return <span className="mx-2 text-primary">•</span>;
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
      <p className="eyebrow mb-5">About us</p>
      <h1 className="text-section text-foreground">
        Empowering the next generation of technology professionals
      </h1>
      <p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">
        Kanada Group is a technology-focused training and career development organization dedicated
        to bridging the gap between academic learning and industry requirements. We provide
        industry-oriented, hands-on training that prepares students and professionals for successful
        careers in the semiconductor and software industries.
      </p>

      {/* The namesake */}
      <section className="mt-16 rounded-3xl border border-border bg-card p-8">
        <h2 className="text-2xl font-semibold">Inspired by Acharya Kaṇāda</h2>
        <p className="mt-4 text-muted-foreground">
          Acharya Kaṇāda (6th–2nd century BCE) was the first to conceive of the{" "}
          <span className="font-medium text-foreground">Paramāṇu</span> (atom) and the{" "}
          <span className="font-medium text-foreground">Aṇu</span> (molecule) — founder of the
          Vaiśeṣika school and an early systematic atomistic worldview. An empirical thinker and
          visionary, he laid the foundations of modern physics. Following his footsteps, we carry
          the same first-principles spirit into chip design:{" "}
          <span className="font-medium text-foreground">
            inspired by ancient wisdom, driven by modern innovation.
          </span>
        </p>
      </section>

      {/* Why we started */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Why Kanada Group started</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {WHY.map((w) => (
            <div key={w.title} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">{w.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Our training programs</h2>
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">VLSI Design</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Digital VLSI Design <Dot /> Analog IC Design <Dot /> Memory Design <Dot /> Physical
              Design <Dot /> Verification <Dot /> FPGA <Dot /> complete ASIC design flow.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">
              AI, Machine Learning &amp; Full-Stack Web Development
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Python <Dot /> AI &amp; Machine Learning <Dot /> Deep Learning <Dot /> Generative AI
              <Dot /> HTML, CSS, JavaScript <Dot /> React, Node.js <Dot /> SQL, MongoDB <Dot />
              Full-Stack application development.
            </p>
          </div>
        </div>
      </section>

      {/* Program structure */}
      <section className="mt-16 rounded-3xl border border-primary/20 bg-primary/5 p-8">
        <h2 className="text-2xl font-semibold">How the VLSI program works</h2>
        <ol className="mt-5 space-y-4">
          <li className="flex gap-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              1
            </span>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Free 8-week Foundations</span> — a common
              program open to everyone: semiconductor and CMOS fundamentals through to Verilog &amp;
              FPGA. No charge.
            </p>
          </li>
          <li className="flex gap-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              2
            </span>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Choose a specialization</span> — after
              completing Foundations, unlock the <span className="font-medium text-foreground">Digital
              VLSI</span> or <span className="font-medium text-foreground">Analog VLSI</span> track
              (Weeks 9–20) with live projects and expert review.
            </p>
          </li>
        </ol>
      </section>

      {/* Mission / Vision */}
      <section className="mt-16 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Our mission</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            To develop highly skilled engineers and technology professionals equipped with practical
            knowledge, industry exposure, and problem-solving abilities that enable them to excel in
            the semiconductor and software industries.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Our vision</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            To become a trusted center of excellence for VLSI, AI, Machine Learning, and Full-Stack
            Web Development by delivering practical, affordable, and industry-relevant education while
            fostering innovation and lifelong learning.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Meet the team</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Experienced professionals and researchers from across academia and industry.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {TEAM.map((name) => (
            <span
              key={name}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 text-center">
        <h2 className="text-2xl font-semibold">Learn → Design → Experiment → Innovate → Build</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Don&apos;t just learn VLSI. Create with it. Start free today.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/registration" className={cn(buttonVariants({ size: "lg" }))}>
            Register Yourself
          </Link>
          <Link
            href="/courses"
            className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}
          >
            Browse courses
          </Link>
        </div>
      </section>
    </div>
  );
}
