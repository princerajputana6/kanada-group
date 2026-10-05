import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";

/**
 * Generates seed.sql with fresh bcrypt hashes for the demo accounts, then
 * `wrangler d1 execute --file=./seed.sql` applies it. Regenerated on every
 * `pnpm seed:local`/`seed:remote` run, so it never ships committed password
 * hashes.
 *
 * The catalog is exactly three courses, matching the Kanada Group VLSI
 * Training Program:
 *   1. VLSI Foundations  — free 8-week common program (Weeks 1–8)
 *   2. Digital VLSI Design — paid track (Weeks 9–20)
 *   3. Analog VLSI Design  — paid track (Weeks 9–20)
 * The two paid tracks unlock only after a student completes the free one.
 */

const sqlEscape = (value: string) => value.replace(/'/g, "''");
const uuid = () => crypto.randomUUID();
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const DEMO_PASSWORD = "Password123!";
const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);
const now = Math.floor(Date.now() / 1000);

const statements: string[] = [];

// Wipes all seed-owned content so this script is safe to re-run. Deletes in
// FK-safe order. Real accounts/content (e.g. self-registered students) are
// untouched — they're never referenced here.
statements.push(
  `DELETE FROM lesson_progress;
   DELETE FROM reviews;
   DELETE FROM enrollments;
   DELETE FROM lessons;
   DELETE FROM sections;
   DELETE FROM courses;
   DELETE FROM categories;
   DELETE FROM users WHERE email LIKE '%@kanadagroup.dev';`,
);

// ---------------------------------------------------------------------------
// Users: 1 admin, 5 teachers (Kanada Group faculty), 1 demo student
// ---------------------------------------------------------------------------

const adminId = uuid();
const studentId = uuid();

const TEACHER_NAMES = [
  "Dr. Vibhu Srivastava",
  "Dr. Anshul Verma",
  "Er. Deepak",
  "Dr. Rahul Mishra",
  "Er. Tejal Patel",
];
const teacherIds = TEACHER_NAMES.map(() => uuid());

statements.push(
  `INSERT INTO users (id, name, email, password_hash, role, bio, created_at) VALUES
    ('${adminId}', 'Kanada Admin', 'admin@kanadagroup.dev', '${passwordHash}', 'ADMIN', 'Platform administrator.', ${now}),
    ('${studentId}', 'Demo Student', 'student@kanadagroup.dev', '${passwordHash}', 'STUDENT', 'Learning VLSI design.', ${now}),
    ${TEACHER_NAMES.map(
      (name, i) =>
        `('${teacherIds[i]}', '${sqlEscape(name)}', 'teacher${i === 0 ? "" : i + 1}@kanadagroup.dev', '${passwordHash}', 'TEACHER', 'VLSI faculty at Kanada Group.', ${now})`,
    ).join(",\n    ")};`,
);

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const CATEGORY_NAMES = ["Foundations", "Digital VLSI", "Analog VLSI"];
const categoryIds = CATEGORY_NAMES.map(() => uuid());

statements.push(
  `INSERT INTO categories (id, name, slug) VALUES
    ${CATEGORY_NAMES.map(
      (name, i) => `('${categoryIds[i]}', '${sqlEscape(name)}', '${slugify(name)}')`,
    ).join(",\n    ")};`,
);

// ---------------------------------------------------------------------------
// Curriculum — one section per week, two lessons per week (an overview +
// a lecture). Weeks come straight from the Kanada training schedule.
// ---------------------------------------------------------------------------

interface Week {
  week: number;
  title: string;
  topics: string[];
}

const FOUNDATION_WEEKS: Week[] = [
  { week: 1, title: "Semiconductor Fundamentals", topics: ["Review of semiconductor physics", "MOS capacitor", "Energy band diagrams", "Charge distribution"] },
  { week: 2, title: "MOS Capacitor Characteristics", topics: ["C–V characteristics", "Ideal MOS capacitor model", "Accumulation, depletion & inversion", "Diffusion & depletion capacitance"] },
  { week: 3, title: "MOSFET Fundamentals", topics: ["MOSFET introduction & structure", "Modes of operation", "Threshold voltage derivation", "Body effect & process dependence"] },
  { week: 4, title: "CMOS Fabrication Technology", topics: ["MOSFET fabrication process", "Oxidation & diffusion", "Ion implantation", "Lithography & metallization", "Process-flow overview"] },
  { week: 5, title: "CMOS Inverter Fundamentals", topics: ["CMOS inverter operation", "Static DC characteristics & VTC", "Switching threshold & noise margins", "Beta ratio & PMOS/NMOS sizing", "Design trade-offs"] },
  { week: 6, title: "Basic Analog Circuits", topics: ["PN junction", "Diodes and applications"] },
  { week: 7, title: "Combinational Logic Design", topics: ["Logic gates & truth tables", "Logic simplification", "Adders, encoders, decoders", "Multiplexers"] },
  { week: 8, title: "Introduction to Verilog & FPGA", topics: ["Modelling styles", "Verilog operators & data types", "Combinational modelling in Verilog", "PLA & PAL", "FPGA architecture & overview"] },
];

const DIGITAL_WEEKS: Week[] = [
  { week: 9, title: "Static CMOS Logic & Alternative Logic", topics: ["CMOS logic gates", "Pull-up & pull-down networks", "Compound gates", "Pass Transistor Logic (PTL)", "Transmission gates", "Ratioed, dynamic, domino & tristate logic"] },
  { week: 10, title: "Digital Layout Design", topics: ["Stick diagrams", "CMOS layout basics", "Interconnects & vias", "Design rules & DRC", "Layout optimization"] },
  { week: 11, title: "Delay Modelling", topics: ["RC delay models", "Lumped & distributed RC models", "Delay estimation", "Effective resistance & capacitance"] },
  { week: 12, title: "Elmore Delay & Logical Effort", topics: ["Elmore delay derivation", "Logical, electrical & branching effort", "Path effort & delay optimization", "Worked examples", "Project allotted"] },
  { week: 13, title: "CMOS Power Analysis", topics: ["Dynamic & static power", "Internal power", "Leakage mechanisms", "Short-circuit power", "Power-performance trade-offs"] },
  { week: 14, title: "Sequential Circuit Design", topics: ["Storage elements", "SR & D latches", "Edge-triggered flip-flops", "Master-slave structures", "Static Timing Analysis (STA)"] },
  { week: 15, title: "Registers, Counters & FSMs", topics: ["Shift registers & phase-shifters", "Ripple & synchronous counters", "Frequency division", "Moore & Mealy FSMs", "FSM design examples"] },
  { week: 16, title: "RTL Design & Logic Synthesis", topics: ["RTL coding guidelines", "Synthesizable Verilog", "Functional verification & testbenches", "Timing constraints (SDC)", "Logic synthesis & technology mapping", "LEC"] },
  { week: 17, title: "Physical Design", topics: ["Floor planning", "IO & macro placement", "Power planning & placement", "Clock Tree Synthesis (CTS)", "Routing"] },
  { week: 18, title: "Signoffs", topics: ["STA & DRVs", "Signal integrity", "DRC & LVS", "IR-drop & electromigration analysis", "ECO flow", "GDSII generation & tapeout"] },
  { week: 19, title: "Design for Testability (DFT)", topics: ["Manufacturing defects & yield", "Fault models & stuck-at faults", "Controllability & observability", "Scan-chain architecture", "Industrial tools: Tessent, TestMAX, Modus", "Project submission"] },
  { week: 20, title: "Final Digital Design Project", topics: ["Final project presentation & review", "Review by external expert"] },
];

const ANALOG_WEEKS: Week[] = [
  { week: 9, title: "MOS Amplifiers", topics: ["Small-signal model", "Common Source, Drain & Gate", "Gain, Rin/Rout", "Frequency response", "Lab"] },
  { week: 10, title: "Advanced Amplifiers", topics: ["Cascade & cascode", "Multistage amplifiers", "Current mirrors & active loads", "Small-signal analysis", "Lab"] },
  { week: 11, title: "Differential Amplifier", topics: ["Differential pair", "Active loads", "CMRR & PSRR", "Offset", "Design & analysis", "Lab"] },
  { week: 12, title: "Operational Amplifier", topics: ["Two-stage Op-Amp", "Folded cascode", "Compensation & GBW", "Phase margin & slew rate", "Project allotted"] },
  { week: 13, title: "Advanced Op-Amps I", topics: ["Rail-to-rail design", "Low power", "High speed"] },
  { week: 14, title: "Advanced Op-Amps II", topics: ["Gain boosting", "Design trade-offs", "Corner simulations"] },
  { week: 15, title: "Bandgap Reference", topics: ["PTAT & CTAT", "Startup circuits", "Temperature compensation", "Applications", "Lab"] },
  { week: 16, title: "Memory Circuits", topics: ["SRAM / DRAM / ROM / Flash", "6T SRAM", "Read/Write operation", "Sense amplifier", "Peripheral circuits"] },
  { week: 17, title: "Analog Layout", topics: ["Layout basics & matching", "Common centroid & interdigitation", "Dummy devices & guard rings", "Latch-up", "DRC/LVS/PEX & post-layout simulation"] },
  { week: 18, title: "Noise & Reliability", topics: ["Thermal & flicker noise", "Monte Carlo analysis", "Corners", "ESD & reliability", "Analog design flow"] },
  { week: 19, title: "Mixed Signal", topics: ["ADC overview", "DAC basics", "PLL basics", "Memory array", "Mixed-signal flow", "Project submission"] },
  { week: 20, title: "Final Analog IC Design Project", topics: ["Project presentation & review", "Review by external expert"] },
];

interface CourseSpec {
  title: string;
  slug: string;
  description: string;
  category: (typeof CATEGORY_NAMES)[number];
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  teacher: number;
  isFree: boolean;
  /** Price in INR (rupees). Admin-editable later; null for free. */
  price: number | null;
  weeks: Week[];
}

const COURSES: CourseSpec[] = [
  {
    title: "VLSI Foundations — Free 8-Week Program",
    slug: "vlsi-foundations",
    description:
      "Our free, open 8-week common program. Build the semiconductor, CMOS and digital fundamentals every VLSI engineer needs — from MOS physics to Verilog & FPGA. Complete it to unlock the Digital and Analog design tracks.",
    category: "Foundations",
    level: "BEGINNER",
    teacher: 0,
    isFree: true,
    price: null,
    weeks: FOUNDATION_WEEKS,
  },
  {
    title: "Digital VLSI Design",
    slug: "digital-vlsi-design",
    description:
      "The complete digital design track (Weeks 9–20): static & alternative logic, layout, delay modelling, power, sequential design, RTL-to-GDSII physical design, signoff, DFT and a final project reviewed by an external expert.",
    category: "Digital VLSI",
    level: "ADVANCED",
    teacher: 1,
    isFree: false,
    price: 14999,
    weeks: DIGITAL_WEEKS,
  },
  {
    title: "Analog VLSI Design",
    slug: "analog-vlsi-design",
    description:
      "The complete analog design track (Weeks 9–20): MOS & differential amplifiers, op-amps, bandgap references, memory circuits, analog layout, noise & reliability, mixed-signal design and a final analog IC project.",
    category: "Analog VLSI",
    level: "ADVANCED",
    teacher: 2,
    isFree: false,
    price: 14999,
    weeks: ANALOG_WEEKS,
  },
];

const courseIdBySlug = new Map<string, string>();

for (let ci = 0; ci < COURSES.length; ci++) {
  const c = COURSES[ci]!;
  const courseId = uuid();
  courseIdBySlug.set(c.slug, courseId);
  const teacherId = teacherIds[c.teacher]!;

  statements.push(
    `INSERT INTO courses (id, title, slug, description, category, level, is_free, price, published, teacher_id, created_at) VALUES
      ('${courseId}', '${sqlEscape(c.title)}', '${c.slug}', '${sqlEscape(c.description)}', '${sqlEscape(c.category)}', '${c.level}', ${c.isFree ? 1 : 0}, ${c.price ?? "NULL"}, 1, '${teacherId}', ${now - (COURSES.length - ci) * 3600});`,
  );

  const sectionRows: string[] = [];
  const lessonRows: string[] = [];

  c.weeks.forEach((w, wIdx) => {
    const sectionId = uuid();
    sectionRows.push(
      `('${sectionId}', '${courseId}', '${sqlEscape(`Week ${w.week}: ${w.title}`)}', ${wIdx})`,
    );

    const overview = `This week covers: ${w.topics.join("; ")}.`;
    const overviewId = uuid();
    const lectureId = uuid();
    // First overview of the free course is a public preview.
    const preview = c.isFree && wIdx === 0 ? 1 : 0;
    lessonRows.push(
      `('${overviewId}', '${sectionId}', '${sqlEscape(`${w.title} — Overview`)}', 'TEXT', '${sqlEscape(overview)}', 0, ${preview})`,
    );
    lessonRows.push(
      `('${lectureId}', '${sectionId}', '${sqlEscape(`${w.title} — Lecture`)}', 'VIDEO', NULL, 1, 0)`,
    );
  });

  statements.push(
    `INSERT INTO sections (id, course_id, title, "order") VALUES\n    ${sectionRows.join(",\n    ")};`,
  );
  statements.push(
    `INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES\n    ${lessonRows.join(",\n    ")};`,
  );
}

// ---------------------------------------------------------------------------
// Demo student: enrolled in the free foundations course + a review.
// ---------------------------------------------------------------------------

const freeCourseId = courseIdBySlug.get("vlsi-foundations")!;

statements.push(
  `INSERT INTO enrollments (id, user_id, course_id, enrolled_at, payment_status) VALUES
    ('${uuid()}', '${studentId}', '${freeCourseId}', ${now}, 'NONE');`,
);

statements.push(
  `INSERT INTO reviews (id, user_id, course_id, rating, comment, created_at) VALUES
    ('${uuid()}', '${studentId}', '${freeCourseId}', 5, '${sqlEscape(
      "The foundation-first approach made everything click. The free 8 weeks alone are worth it.",
    )}', ${now});`,
);

// ---------------------------------------------------------------------------

const sql = statements.join("\n\n") + "\n";
const outPath = resolve(import.meta.dirname, "..", "seed.sql");
writeFileSync(outPath, sql, "utf8");

console.log(`Wrote ${outPath} (${COURSES.length} courses)`);
console.log(`Demo accounts (password for all: "${DEMO_PASSWORD}"):`);
console.log("  admin@kanadagroup.dev    (ADMIN)");
console.log("  teacher@kanadagroup.dev  (TEACHER — Dr. Vibhu Srivastava)");
console.log("  student@kanadagroup.dev  (STUDENT)");
