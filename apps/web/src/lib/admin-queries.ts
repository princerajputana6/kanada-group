import { eq } from "drizzle-orm";
import { enrollments, lessonProgress, users } from "@kanada/db";
import { getDb } from "./db";

/**
 * Admin-portal reads. Aggregation happens in JS over a handful of queries
 * (same approach as the rest of lib/queries.ts) — fine at LMS scale and far
 * simpler than hand-written D1 SQL.
 */

export type StudentStatus = "active" | "banned";

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  banned: boolean;
  joinedAt: Date;
  lastActiveAt: Date | null;
  enrolledCount: number;
  completedCount: number;
  /** Mean lesson-completion % across the student's enrollments (0 if none). */
  avgProgress: number;
  lessonsCompleted: number;
  courses: { id: string; title: string; percent: number; completed: boolean }[];
}

export interface StudentFilters {
  q?: string;
  status?: StudentStatus;
  courseId?: string;
  /** Joined within the last N days. */
  joinedDays?: number;
  sort?: "joined" | "name" | "active" | "progress";
}

/** Lesson → course mapping and per-course lesson totals. */
async function getLessonIndex() {
  const db = await getDb();
  const allCourses = await db.query.courses.findMany({
    columns: { id: true, title: true, slug: true, published: true },
    with: { sections: { columns: { id: true }, with: { lessons: { columns: { id: true } } } } },
    orderBy: (c, { asc }) => [asc(c.title)],
  });
  const courseOfLesson = new Map<string, string>();
  const lessonTotal = new Map<string, number>();
  for (const c of allCourses) {
    let n = 0;
    for (const s of c.sections) {
      for (const l of s.lessons) {
        courseOfLesson.set(l.id, c.id);
        n++;
      }
    }
    lessonTotal.set(c.id, n);
  }
  return { allCourses, courseOfLesson, lessonTotal };
}

function percentOf(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export async function getStudentDirectory(filters: StudentFilters = {}) {
  const db = await getDb();
  const [students, allEnrollments, allProgress, index] = await Promise.all([
    db.query.users.findMany({ where: eq(users.role, "STUDENT") }),
    db.query.enrollments.findMany(),
    db.query.lessonProgress.findMany(),
    getLessonIndex(),
  ]);
  const titleOf = new Map(index.allCourses.map((c) => [c.id, c.title]));

  const enrollmentsByUser = new Map<string, typeof allEnrollments>();
  for (const e of allEnrollments) {
    const list = enrollmentsByUser.get(e.userId) ?? [];
    list.push(e);
    enrollmentsByUser.set(e.userId, list);
  }
  // user → course → completed lesson count, and user → last activity
  const doneByUserCourse = new Map<string, Map<string, number>>();
  const lastActivity = new Map<string, number>();
  const lessonsDoneByUser = new Map<string, number>();
  for (const p of allProgress) {
    if (p.lastWatchedAt) {
      lastActivity.set(p.userId, Math.max(lastActivity.get(p.userId) ?? 0, p.lastWatchedAt.getTime()));
    }
    if (!p.completed) continue;
    lessonsDoneByUser.set(p.userId, (lessonsDoneByUser.get(p.userId) ?? 0) + 1);
    const courseId = index.courseOfLesson.get(p.lessonId);
    if (!courseId) continue;
    const m = doneByUserCourse.get(p.userId) ?? new Map<string, number>();
    m.set(courseId, (m.get(courseId) ?? 0) + 1);
    doneByUserCourse.set(p.userId, m);
  }

  let rows: StudentRow[] = students.map((s) => {
    const ens = enrollmentsByUser.get(s.id) ?? [];
    const done = doneByUserCourse.get(s.id);
    const courses = ens.map((e) => ({
      id: e.courseId,
      title: titleOf.get(e.courseId) ?? "Deleted course",
      percent: percentOf(done?.get(e.courseId) ?? 0, index.lessonTotal.get(e.courseId) ?? 0),
      completed: !!e.completedAt,
    }));
    const enrolledAtMax = Math.max(0, ...ens.map((e) => e.enrolledAt.getTime()));
    const active = Math.max(lastActivity.get(s.id) ?? 0, enrolledAtMax);
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      banned: s.banned,
      joinedAt: s.createdAt,
      lastActiveAt: active > 0 ? new Date(active) : null,
      enrolledCount: ens.length,
      completedCount: ens.filter((e) => e.completedAt).length,
      avgProgress: courses.length
        ? Math.round(courses.reduce((sum, c) => sum + c.percent, 0) / courses.length)
        : 0,
      lessonsCompleted: lessonsDoneByUser.get(s.id) ?? 0,
      courses,
    };
  });

  const total = rows.length;
  const q = filters.q?.trim().toLowerCase();
  if (q) rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.email.includes(q));
  if (filters.status) rows = rows.filter((r) => (filters.status === "banned") === r.banned);
  if (filters.courseId) rows = rows.filter((r) => r.courses.some((c) => c.id === filters.courseId));
  if (filters.joinedDays) {
    const since = Date.now() - filters.joinedDays * 86_400_000;
    rows = rows.filter((r) => r.joinedAt.getTime() >= since);
  }

  const by = filters.sort ?? "joined";
  rows.sort((a, b) => {
    switch (by) {
      case "name":
        return a.name.localeCompare(b.name);
      case "active":
        return (b.lastActiveAt?.getTime() ?? 0) - (a.lastActiveAt?.getTime() ?? 0);
      case "progress":
        return b.avgProgress - a.avgProgress;
      default:
        return b.joinedAt.getTime() - a.joinedAt.getTime();
    }
  });

  return {
    rows,
    total,
    courses: index.allCourses.map((c) => ({ id: c.id, title: c.title })),
  };
}

export async function getPortalOverview() {
  const db = await getDb();
  const [allUsers, allEnrollments, allProgress, allCourses] = await Promise.all([
    db.query.users.findMany({ columns: { id: true, name: true, email: true, role: true, banned: true, createdAt: true } }),
    db.query.enrollments.findMany({ columns: { userId: true, enrolledAt: true, completedAt: true } }),
    db.query.lessonProgress.findMany({ columns: { userId: true, lastWatchedAt: true } }),
    db.query.courses.findMany({ columns: { id: true, published: true } }),
  ]);
  const now = Date.now();
  const within = (d: Date | null | undefined, days: number) => !!d && now - d.getTime() <= days * 86_400_000;
  const students = allUsers.filter((u) => u.role === "STUDENT");
  const activeIds = new Set(allProgress.filter((p) => within(p.lastWatchedAt, 7)).map((p) => p.userId));

  return {
    students: students.length,
    teachers: allUsers.filter((u) => u.role === "TEACHER").length,
    banned: allUsers.filter((u) => u.banned).length,
    newStudents7: students.filter((s) => within(s.createdAt, 7)).length,
    newStudents30: students.filter((s) => within(s.createdAt, 30)).length,
    activeLearners7: activeIds.size,
    enrollments: allEnrollments.length,
    enrollments30: allEnrollments.filter((e) => within(e.enrolledAt, 30)).length,
    completions: allEnrollments.filter((e) => e.completedAt).length,
    courses: allCourses.length,
    publishedCourses: allCourses.filter((c) => c.published).length,
    recentStudents: [...students]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 6),
  };
}

/** Everything the admin sees about one account (any role). */
export async function getUserDetail(userId: string) {
  const db = await getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      enrollments: { with: { course: { columns: { id: true, title: true, slug: true } } } },
      reviews: { with: { course: { columns: { title: true, slug: true } } } },
      coursesTaught: {
        columns: { id: true, title: true, slug: true, published: true },
        with: { enrollments: { columns: { id: true } } },
      },
    },
  });
  if (!user) return null;

  const [progress, index] = await Promise.all([
    db.query.lessonProgress.findMany({ where: eq(lessonProgress.userId, userId) }),
    getLessonIndex(),
  ]);

  const doneByCourse = new Map<string, number>();
  const lastByCourse = new Map<string, number>();
  for (const p of progress) {
    const courseId = index.courseOfLesson.get(p.lessonId);
    if (!courseId) continue;
    if (p.completed) doneByCourse.set(courseId, (doneByCourse.get(courseId) ?? 0) + 1);
    if (p.lastWatchedAt) {
      lastByCourse.set(courseId, Math.max(lastByCourse.get(courseId) ?? 0, p.lastWatchedAt.getTime()));
    }
  }

  const enrolled = user.enrollments
    .map((e) => {
      const total = index.lessonTotal.get(e.courseId) ?? 0;
      const done = doneByCourse.get(e.courseId) ?? 0;
      const last = lastByCourse.get(e.courseId);
      return {
        enrollmentId: e.id,
        courseId: e.courseId,
        title: e.course.title,
        slug: e.course.slug,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        lessonsDone: done,
        lessonsTotal: total,
        percent: percentOf(done, total),
        lastActiveAt: last ? new Date(last) : null,
      };
    })
    .sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime());

  const enrolledIds = new Set(enrolled.map((e) => e.courseId));
  const lastActive = Math.max(0, ...progress.map((p) => p.lastWatchedAt?.getTime() ?? 0));

  // Never hand the password hash to a page.
  const { passwordHash: _omit, enrollments: _e, reviews, coursesTaught, ...profile } = user;
  void _omit;
  void _e;

  return {
    profile,
    enrolled,
    reviews,
    coursesTaught,
    lastActiveAt: lastActive ? new Date(lastActive) : null,
    lessonsCompleted: progress.filter((p) => p.completed).length,
    enrollableCourses: index.allCourses
      .filter((c) => !enrolledIds.has(c.id))
      .map((c) => ({ id: c.id, title: c.title, published: c.published })),
  };
}

export type UserDetail = NonNullable<Awaited<ReturnType<typeof getUserDetail>>>;

export async function getEnrollment(enrollmentId: string) {
  const db = await getDb();
  return db.query.enrollments.findFirst({ where: eq(enrollments.id, enrollmentId) });
}

/**
 * All payment-bearing enrollments (paid tracks) for the admin review queue.
 * Excludes free-course enrollments (paymentStatus NONE). Pending reviews
 * (SUBMITTED) float to the top.
 */
export async function getPaymentEnrollments() {
  const db = await getDb();
  const rows = await db.query.enrollments.findMany({
    with: {
      user: { columns: { id: true, name: true, email: true } },
      course: { columns: { id: true, title: true, slug: true } },
    },
  });

  const order: Record<string, number> = {
    SUBMITTED: 0,
    AWAITING: 1,
    REJECTED: 2,
    PAID: 3,
    NONE: 4,
  };

  return rows
    .filter((e) => e.paymentStatus !== "NONE")
    .map((e) => ({
      id: e.id,
      studentName: e.user.name,
      studentEmail: e.user.email,
      courseTitle: e.course.title,
      courseSlug: e.course.slug,
      amount: e.amount,
      status: e.paymentStatus,
      hasScreenshot: !!e.paymentScreenshotKey,
      enrolledAt: e.enrolledAt,
      paidAt: e.paidAt,
    }))
    .sort((a, b) => {
      const d = (order[a.status] ?? 9) - (order[b.status] ?? 9);
      return d !== 0 ? d : b.enrolledAt.getTime() - a.enrolledAt.getTime();
    });
}

/** All enquiry submissions for the admin inbox; NEW first, then newest. */
export async function getEnquiries() {
  const db = await getDb();
  const rows = await db.query.enquiries.findMany();
  const order: Record<string, number> = { NEW: 0, CONTACTED: 1, CLOSED: 2 };
  return rows.sort((a, b) => {
    const d = (order[a.status] ?? 9) - (order[b.status] ?? 9);
    return d !== 0 ? d : b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export async function getEnquiryCounts() {
  const rows = await getEnquiries();
  return {
    total: rows.length,
    newCount: rows.filter((r) => r.status === "NEW").length,
  };
}

export async function getPaymentCounts() {
  const rows = await getPaymentEnrollments();
  return {
    pending: rows.filter((r) => r.status === "SUBMITTED").length,
    paid: rows.filter((r) => r.status === "PAID").length,
    total: rows.length,
  };
}

/** Parses the directory's URL search params (shared by the page and CSV export). */
export function parseStudentFilters(sp: Record<string, string | string[] | undefined>): StudentFilters {
  const one = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  };
  const status = one("status");
  const sort = one("sort");
  const days = Number(one("joined"));
  return {
    q: one("q")?.slice(0, 100),
    status: status === "active" || status === "banned" ? status : undefined,
    courseId: one("course")?.slice(0, 64),
    joinedDays: [7, 30, 90, 365].includes(days) ? days : undefined,
    sort: sort === "name" || sort === "active" || sort === "progress" ? sort : "joined",
  };
}
