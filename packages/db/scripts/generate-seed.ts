import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";

/**
 * Generates seed.sql with fresh bcrypt hashes for the demo accounts, then
 * `wrangler d1 execute --file=./seed.sql` applies it. Regenerated on every
 * `pnpm seed:local`/`seed:remote` run, so it never ships committed password
 * hashes. Builds the full Kanada Group course catalog (matching the actual
 * 20-week Digital/Analog VLSI curriculum) rather than a single demo course.
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

// Wipes all seed-owned content so this script is safe to re-run — it fully
// replaces the catalog rather than accumulating duplicates. Deletes in
// FK-safe order. Any real accounts/content beyond what this script created
// (e.g. by self-registering) are untouched since they're never referenced
// here.
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
// Users: 1 admin, 5 teachers (from the Kanada Group faculty), 1 demo student
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
// Courses — matches the real 20-week Kanada Group curriculum, grouped into
// a realistic Udemy-style catalog rather than one lesson per course.
// ---------------------------------------------------------------------------

interface LessonSpec {
  title: string;
  type: "VIDEO" | "TEXT";
  content?: string;
  preview?: boolean;
}
interface SectionSpec {
  title: string;
  lessons: LessonSpec[];
}
interface CourseSpec {
  title: string;
  description: string;
  category: (typeof CATEGORY_NAMES)[number];
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  teacher: number; // index into TEACHER_NAMES
  sections: SectionSpec[];
}

const textLesson = (title: string, content: string, preview = false): LessonSpec => ({
  title,
  type: "TEXT",
  content,
  preview,
});
const videoLesson = (title: string, preview = false): LessonSpec => ({
  title,
  type: "VIDEO",
  preview,
});

const COURSES: CourseSpec[] = [
  {
    title: "Semiconductor Physics & Device Fundamentals",
    description:
      "Energy bands, charge carriers, and MOS capacitor behavior — the physics foundation every VLSI engineer needs before touching a transistor model.",
    category: "Foundations",
    level: "BEGINNER",
    teacher: 0,
    sections: [
      {
        title: "Semiconductor Fundamentals",
        lessons: [
          textLesson(
            "Introduction to Semiconductor Physics",
            "Welcome to the course! This lesson covers energy bands, charge carriers, and the basics of semiconductor physics.",
            true,
          ),
          videoLesson("Charge Distribution & Energy Band Diagrams"),
        ],
      },
      {
        title: "MOS Capacitor Characteristics",
        lessons: [
          videoLesson("The Ideal MOS Capacitor Model"),
          textLesson(
            "Accumulation, Depletion & Inversion",
            "This lesson walks through the three operating regions of a MOS capacitor and how C-V characteristics reveal them.",
          ),
        ],
      },
    ],
  },
  {
    title: "MOSFET & CMOS Fabrication Technology",
    description:
      "MOSFET structure, modes of operation, threshold voltage, and the full CMOS fabrication process from oxidation to metallization.",
    category: "Foundations",
    level: "BEGINNER",
    teacher: 0,
    sections: [
      {
        title: "MOSFET Fundamentals",
        lessons: [
          videoLesson("MOSFET Introduction & Structure", true),
          textLesson(
            "Threshold Voltage & Body Effect",
            "Derives the threshold voltage equation and explains how substrate bias shifts it via the body effect.",
          ),
        ],
      },
      {
        title: "CMOS Fabrication Technology",
        lessons: [
          videoLesson("Oxidation, Diffusion & Ion Implantation"),
          videoLesson("Lithography, Metallization & Process Flow"),
        ],
      },
    ],
  },
  {
    title: "CMOS Inverter & Basic Analog Circuits",
    description:
      "Static CMOS inverter DC characteristics, noise margins, sizing trade-offs, and an introduction to diodes and PN junctions.",
    category: "Foundations",
    level: "BEGINNER",
    teacher: 1,
    sections: [
      {
        title: "CMOS Inverter Fundamentals",
        lessons: [
          videoLesson("CMOS Inverter Operation", true),
          textLesson(
            "Switching Threshold & Noise Margins",
            "This lesson explains how to derive the switching threshold voltage and noise margins for a CMOS inverter.",
          ),
        ],
      },
      {
        title: "Basic Analog Circuits",
        lessons: [videoLesson("PN Junctions & Diode Applications")],
      },
    ],
  },
  {
    title: "Combinational Logic Design with Verilog",
    description:
      "Logic gates, adders, encoders and multiplexers — then Verilog modelling styles and an FPGA architecture overview.",
    category: "Foundations",
    level: "BEGINNER",
    teacher: 1,
    sections: [
      {
        title: "Combinational Logic Design",
        lessons: [
          videoLesson("Logic Gates, Truth Tables & Simplification", true),
          videoLesson("Adders, Encoders, Decoders & Multiplexers"),
        ],
      },
      {
        title: "Introduction to Verilog & FPGA",
        lessons: [
          textLesson(
            "Verilog Modelling Styles & Operators",
            "Covers structural, dataflow, and behavioral modelling styles along with Verilog's core operators and data types.",
          ),
          videoLesson("FPGA Architecture Overview"),
        ],
      },
    ],
  },
  {
    title: "Static CMOS Logic & Alternative Logic Styles",
    description:
      "Pull-up/pull-down networks, compound gates, pass-transistor logic, transmission gates, and dynamic/domino logic trade-offs.",
    category: "Digital VLSI",
    level: "INTERMEDIATE",
    teacher: 2,
    sections: [
      {
        title: "Static CMOS Logic Design",
        lessons: [
          videoLesson("CMOS Logic Gates & Compound Gates", true),
          videoLesson("Pass Transistor Logic & Transmission Gates"),
        ],
      },
      {
        title: "Alternative Logic Styles",
        lessons: [
          textLesson(
            "Dynamic, Domino & Tristate Logic",
            "Compares dynamic and domino logic families against static CMOS, covering their advantages and charge-sharing limitations.",
          ),
        ],
      },
    ],
  },
  {
    title: "Digital Layout & Delay Modeling",
    description:
      "Stick diagrams, CMOS layout and design rules, then RC delay models, Elmore delay, and logical effort for delay optimization.",
    category: "Digital VLSI",
    level: "INTERMEDIATE",
    teacher: 2,
    sections: [
      {
        title: "Digital Layout Design",
        lessons: [
          videoLesson("Stick Diagrams & CMOS Layout Basics", true),
          textLesson(
            "Interconnects, Vias & Design Rules",
            "Explains DRC considerations and layout optimization techniques for dense digital layouts.",
          ),
        ],
      },
      {
        title: "Delay Modelling & Logical Effort",
        lessons: [
          videoLesson("RC Delay Models & Effective Resistance"),
          videoLesson("Elmore Delay & Logical Effort"),
        ],
      },
    ],
  },
  {
    title: "CMOS Power Analysis & Sequential Circuit Design",
    description:
      "Dynamic, static, and leakage power estimation, followed by storage elements, flip-flops, and an intro to static timing analysis.",
    category: "Digital VLSI",
    level: "INTERMEDIATE",
    teacher: 3,
    sections: [
      {
        title: "CMOS Power Analysis",
        lessons: [
          videoLesson("Dynamic, Static & Leakage Power", true),
          textLesson(
            "Power-Performance Trade-offs",
            "Discusses how to balance power estimation results against performance targets during design.",
          ),
        ],
      },
      {
        title: "Sequential Circuit Design",
        lessons: [
          videoLesson("SR/D Latches & Edge-Triggered Flip-Flops"),
          videoLesson("Introduction to Static Timing Analysis"),
        ],
      },
    ],
  },
  {
    title: "RTL Design, Synthesis & FSMs",
    description:
      "Synthesizable Verilog and RTL coding guidelines, functional verification basics, and Moore/Mealy finite state machine design.",
    category: "Digital VLSI",
    level: "INTERMEDIATE",
    teacher: 3,
    sections: [
      {
        title: "RTL Design & Logic Synthesis",
        lessons: [
          videoLesson("RTL Coding Guidelines & Synthesizable Verilog", true),
          textLesson(
            "Logic Synthesis & Technology Mapping",
            "Covers the synthesis flow from elaboration through technology mapping, area/timing optimization, and netlist generation.",
          ),
        ],
      },
      {
        title: "Registers, Counters & FSMs",
        lessons: [
          videoLesson("Shift Registers, Counters & Frequency Division"),
          videoLesson("Moore & Mealy FSM Design Examples"),
        ],
      },
    ],
  },
  {
    title: "Physical Design & Signoff",
    description:
      "Floorplanning, placement, clock tree synthesis, and routing — then the signoff checks that get a design ready for tapeout.",
    category: "Digital VLSI",
    level: "ADVANCED",
    teacher: 4,
    sections: [
      {
        title: "Physical Design",
        lessons: [
          videoLesson("Floorplanning, Placement & Power Planning", true),
          videoLesson("Clock Tree Synthesis & Routing"),
        ],
      },
      {
        title: "Signoffs",
        lessons: [
          textLesson(
            "STA, DRC/LVS & Signal Integrity",
            "Walks through the signoff checklist: static timing analysis, DRC/LVS, antenna and density checks, and IR-drop analysis.",
          ),
          videoLesson("ECO Flow & Final Signoff Checklist"),
        ],
      },
    ],
  },
  {
    title: "DFT & Final Digital Design Project",
    description:
      "Scan chains, ATPG, and industrial DFT tools, capped off with a complete digital design project reviewed by an external expert.",
    category: "Digital VLSI",
    level: "ADVANCED",
    teacher: 4,
    sections: [
      {
        title: "Design for Testability (DFT)",
        lessons: [
          videoLesson("Scan-Chain Architecture & Scan Flip-Flops", true),
          textLesson(
            "ATPG & Testing Fundamentals",
            "Introduces automatic test pattern generation and the difference between defects, faults, errors, and failures.",
          ),
        ],
      },
      {
        title: "Final Digital Design Project",
        lessons: [videoLesson("Project Presentation & External Review")],
      },
    ],
  },
  {
    title: "MOS & Differential Amplifiers",
    description:
      "Common source/drain/gate small-signal analysis, cascode and multistage amplifiers, and differential pair design with CMRR/PSRR.",
    category: "Analog VLSI",
    level: "INTERMEDIATE",
    teacher: 0,
    sections: [
      {
        title: "MOS Amplifiers",
        lessons: [
          videoLesson("Common Source, Drain & Gate Small-Signal Models", true),
          videoLesson("Cascode & Multistage Amplifiers"),
        ],
      },
      {
        title: "Differential Amplifier",
        lessons: [
          textLesson(
            "Differential Pair, CMRR & PSRR",
            "Covers active-load differential pairs, common-mode and power-supply rejection, and offset analysis.",
          ),
        ],
      },
    ],
  },
  {
    title: "Operational Amplifier Design",
    description:
      "Two-stage and folded-cascode op-amps, compensation techniques, gain boosting, and rail-to-rail/low-power design trade-offs.",
    category: "Analog VLSI",
    level: "ADVANCED",
    teacher: 1,
    sections: [
      {
        title: "Operational Amplifier",
        lessons: [
          videoLesson("Two-Stage Op-Amp & Folded Cascode", true),
          videoLesson("Compensation, GBW, Phase Margin & Slew Rate"),
        ],
      },
      {
        title: "Advanced Op-Amps",
        lessons: [
          textLesson(
            "Rail-to-Rail, Low-Power & Gain Boosting",
            "Discusses design trade-offs for rail-to-rail input/output stages, low-power biasing, and gain-boosting techniques.",
          ),
        ],
      },
    ],
  },
  {
    title: "Bandgap References & Memory Circuits",
    description:
      "PTAT/CTAT-based bandgap reference design and temperature compensation, then 6T SRAM cells and sense amplifier design.",
    category: "Analog VLSI",
    level: "ADVANCED",
    teacher: 2,
    sections: [
      {
        title: "Bandgap Reference",
        lessons: [
          videoLesson("PTAT, CTAT & Startup Circuits", true),
          textLesson(
            "Temperature Compensation Techniques",
            "Explains how PTAT and CTAT currents combine to produce a temperature-independent bandgap voltage reference.",
          ),
        ],
      },
      {
        title: "Memory Circuits",
        lessons: [videoLesson("6T SRAM, Sense Amplifiers & Peripheral Circuits")],
      },
    ],
  },
  {
    title: "Analog Layout & Mixed Signal Design",
    description:
      "Matching, common-centroid layout, and guard rings for analog blocks, plus an ADC/DAC and PLL overview for mixed-signal systems.",
    category: "Analog VLSI",
    level: "ADVANCED",
    teacher: 3,
    sections: [
      {
        title: "Analog Layout",
        lessons: [
          videoLesson("Matching, Common Centroid & Interdigitation", true),
          textLesson(
            "Guard Rings, Latch-up & Post-Layout Simulation",
            "Covers DRC/LVS/PEX for analog layouts and how guard rings mitigate latch-up risk.",
          ),
        ],
      },
      {
        title: "Mixed Signal",
        lessons: [videoLesson("ADC, DAC & PLL Basics")],
      },
    ],
  },
  {
    title: "Noise, Reliability & Final Analog IC Project",
    description:
      "Thermal and flicker noise, Monte Carlo and corner analysis, ESD/reliability considerations, and a complete analog IC design project.",
    category: "Analog VLSI",
    level: "ADVANCED",
    teacher: 4,
    sections: [
      {
        title: "Noise & Reliability",
        lessons: [
          videoLesson("Thermal & Flicker Noise", true),
          textLesson(
            "Monte Carlo Analysis, Corners & ESD",
            "Introduces statistical and corner-based verification techniques along with ESD protection considerations.",
          ),
        ],
      },
      {
        title: "Final Analog IC Design Project",
        lessons: [videoLesson("Project Presentation & External Review")],
      },
    ],
  },
];

const courseIds: string[] = [];
const enrollCourseIndexes = [0, 1, 4, 10]; // demo student enrolls in a spread of courses
const reviewCourseIndexes = [0, 2, 5, 10, 12];

for (let ci = 0; ci < COURSES.length; ci++) {
  const c = COURSES[ci]!;
  const courseId = uuid();
  courseIds.push(courseId);
  const categoryId = categoryIds[CATEGORY_NAMES.indexOf(c.category)]!;
  const teacherId = teacherIds[c.teacher]!;

  statements.push(
    `INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('${courseId}', '${sqlEscape(c.title)}', '${slugify(c.title)}', '${sqlEscape(c.description)}', '${sqlEscape(c.category)}', '${c.level}', 1, 1, '${teacherId}', ${now - (COURSES.length - ci) * 3600});`,
  );
  void categoryId; // category column stores the name, not an FK — kept for filtering by name

  const sectionRows: string[] = [];
  const lessonRows: string[] = [];

  c.sections.forEach((section, sIdx) => {
    const sectionId = uuid();
    sectionRows.push(`('${sectionId}', '${courseId}', '${sqlEscape(section.title)}', ${sIdx})`);

    section.lessons.forEach((lesson, lIdx) => {
      const lessonId = uuid();
      const content = lesson.content ? `'${sqlEscape(lesson.content)}'` : "NULL";
      lessonRows.push(
        `('${lessonId}', '${sectionId}', '${sqlEscape(lesson.title)}', '${lesson.type}', ${content}, ${lIdx}, ${lesson.preview ? 1 : 0})`,
      );
    });
  });

  statements.push(
    `INSERT INTO sections (id, course_id, title, "order") VALUES\n    ${sectionRows.join(",\n    ")};`,
  );
  statements.push(
    `INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES\n    ${lessonRows.join(",\n    ")};`,
  );
}

// ---------------------------------------------------------------------------
// Demo student enrollments + a handful of reviews for social proof
// ---------------------------------------------------------------------------

statements.push(
  `INSERT INTO enrollments (id, user_id, course_id, enrolled_at) VALUES
    ${enrollCourseIndexes
      .map((idx) => `('${uuid()}', '${studentId}', '${courseIds[idx]}', ${now})`)
      .join(",\n    ")};`,
);

const REVIEW_COMMENTS = [
  "The foundation-first approach made everything downstream actually make sense instead of being memorized steps.",
  "Clear explanations and the lab exercises tied directly back to the theory — exactly what I needed.",
  "Instructor was responsive and the pacing was just right for someone coming from a non-VLSI background.",
  "Loved how each concept built on the last. Would recommend to anyone starting out in chip design.",
  "Dense but well-structured — worth watching each lecture twice.",
];

statements.push(
  `INSERT INTO reviews (id, user_id, course_id, rating, comment, created_at) VALUES
    ${reviewCourseIndexes
      .map(
        (idx, i) =>
          `('${uuid()}', '${studentId}', '${courseIds[idx]}', ${4 + (i % 2)}, '${sqlEscape(REVIEW_COMMENTS[i % REVIEW_COMMENTS.length]!)}', ${now})`,
      )
      .join(",\n    ")};`,
);

// ---------------------------------------------------------------------------

const sql = statements.join("\n\n") + "\n";
const outPath = resolve(import.meta.dirname, "..", "seed.sql");
writeFileSync(outPath, sql, "utf8");

console.log(`Wrote ${outPath} (${COURSES.length} courses)`);
console.log(`Demo accounts (password for all: "${DEMO_PASSWORD}"):`);
console.log("  admin@kanadagroup.dev    (ADMIN)");
console.log("  teacher@kanadagroup.dev  (TEACHER — Dr. Vibhu Srivastava)");
console.log("  teacher2@kanadagroup.dev (TEACHER — Dr. Anshul Verma)");
console.log("  teacher3@kanadagroup.dev (TEACHER — Er. Deepak)");
console.log("  teacher4@kanadagroup.dev (TEACHER — Dr. Rahul Mishra)");
console.log("  teacher5@kanadagroup.dev (TEACHER — Er. Tejal Patel)");
console.log("  student@kanadagroup.dev  (STUDENT)");
