import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";

/**
 * Generates seed.sql with fresh bcrypt hashes for the demo accounts, then
 * `wrangler d1 execute --file=./seed.sql` applies it. Regenerated on every
 * `pnpm seed:local` run, so it never ships committed password hashes.
 */

const sqlEscape = (value: string) => value.replace(/'/g, "''");
const uuid = () => crypto.randomUUID();

const DEMO_PASSWORD = "Password123!";
const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

const adminId = uuid();
const teacherId = uuid();
const studentId = uuid();
const categoryId = uuid();
const courseId = uuid();
const section1Id = uuid();
const section2Id = uuid();
const lesson1Id = uuid();
const lesson2Id = uuid();
const lesson3Id = uuid();
const lesson4Id = uuid();

const now = Math.floor(Date.now() / 1000);

const statements: string[] = [
  `INSERT INTO users (id, name, email, password_hash, role, bio, created_at) VALUES
    ('${adminId}', 'Kanada Admin', 'admin@kanadagroup.dev', '${passwordHash}', 'ADMIN', 'Platform administrator.', ${now}),
    ('${teacherId}', 'Dr. Vibhu Srivastava', 'teacher@kanadagroup.dev', '${passwordHash}', 'TEACHER', 'VLSI faculty at Kanada Group.', ${now}),
    ('${studentId}', 'Demo Student', 'student@kanadagroup.dev', '${passwordHash}', 'STUDENT', 'Learning VLSI design.', ${now});`,

  `INSERT INTO categories (id, name, slug) VALUES
    ('${categoryId}', 'VLSI Design', 'vlsi-design');`,

  `INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
    ('${courseId}', 'Digital VLSI Design Fundamentals', 'digital-vlsi-design-fundamentals', '${sqlEscape(
      "A foundation course covering semiconductor physics, CMOS technology, and digital logic design — the first weeks of Kanada Group's VLSI training program.",
    )}', 'VLSI Design', 'BEGINNER', 1, 1, '${teacherId}', ${now});`,

  `INSERT INTO sections (id, course_id, title, "order") VALUES
    ('${section1Id}', '${courseId}', 'Semiconductor Fundamentals', 0),
    ('${section2Id}', '${courseId}', 'CMOS Inverter Fundamentals', 1);`,

  `INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('${lesson1Id}', '${section1Id}', 'Introduction to Semiconductor Physics', 'TEXT', '${sqlEscape(
      "Welcome to the course! This lesson covers energy bands, charge carriers, and the basics of semiconductor physics.",
    )}', 0, 1),
    ('${lesson2Id}', '${section1Id}', 'MOS Capacitor Characteristics', 'VIDEO', NULL, 1, 0),
    ('${lesson3Id}', '${section2Id}', 'CMOS Inverter Operation', 'VIDEO', NULL, 0, 0),
    ('${lesson4Id}', '${section2Id}', 'Switching Threshold & Noise Margins', 'TEXT', '${sqlEscape(
      "This lesson explains how to derive the switching threshold voltage and noise margins for a CMOS inverter.",
    )}', 1, 0);`,

  `INSERT INTO enrollments (id, user_id, course_id, enrolled_at) VALUES
    ('${uuid()}', '${studentId}', '${courseId}', ${now});`,
];

const sql = statements.join("\n\n") + "\n";
const outPath = resolve(import.meta.dirname, "..", "seed.sql");
writeFileSync(outPath, sql, "utf8");

console.log(`Wrote ${outPath}`);
console.log(`Demo accounts (password for all: "${DEMO_PASSWORD}"):`);
console.log("  admin@kanadagroup.dev   (ADMIN)");
console.log("  teacher@kanadagroup.dev (TEACHER)");
console.log("  student@kanadagroup.dev (STUDENT)");
