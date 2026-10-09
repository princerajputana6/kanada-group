import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";
import { courseNotes, courses, lessonProgress, liveClasses } from "@kanada/db";
import { getDb } from "./db";
import { accessibleCourseIds } from "./access";
import { liveState } from "./time";

/** Teaching-portal and student-facing reads for live classes, notes and progress. */

const DAY = 86_400_000;

function hasAccess(isFree: boolean, paymentStatus: string) {
  return isFree || paymentStatus === "PAID";
}

/** Everything the teacher overview needs, in a few queries. */
export async function getTeacherOverview(teacherId: string) {
  const db = await getDb();
  const [teacherCourses, classes] = await Promise.all([
    db.query.courses.findMany({
      where: eq(courses.teacherId, teacherId),
      with: {
        enrollments: { with: { user: { columns: { id: true, name: true, email: true } } } },
        reviews: { columns: { rating: true } },
        sections: { columns: { id: true }, with: { lessons: { columns: { id: true } } } },
      },
      orderBy: (c, { desc: d }) => [d(c.createdAt)],
    }),
    db.query.liveClasses.findMany({
      where: and(eq(liveClasses.teacherId, teacherId), eq(liveClasses.status, "SCHEDULED")),
      with: { course: { columns: { title: true, slug: true } } },
      orderBy: [asc(liveClasses.startsAt)],
    }),
  ]);
  const courseIds = teacherCourses.map((c) => c.id);
  const notes = courseIds.length
    ? await db.query.courseNotes.findMany({
        where: inArray(courseNotes.courseId, courseIds),
        columns: { id: true, courseId: true },
      })
    : [];

  const lessonIds = teacherCourses.flatMap((c) => c.sections.flatMap((s) => s.lessons.map((l) => l.id)));
  const progress = lessonIds.length
    ? await db.query.lessonProgress.findMany({
        where: inArray(lessonProgress.lessonId, lessonIds),
        columns: { userId: true, lastWatchedAt: true, completed: true },
      })
    : [];

  const now = Date.now();
  const activeLearners = new Set(
    progress.filter((p) => p.lastWatchedAt && now - p.lastWatchedAt.getTime() <= 7 * DAY).map((p) => p.userId),
  );
  const students = new Set<string>();
  let pendingPayments = 0;
  let completions = 0;
  const allEnrollments = teacherCourses.flatMap((c) =>
    c.enrollments.map((e) => {
      students.add(e.userId);
      if (e.paymentStatus === "SUBMITTED" || e.paymentStatus === "AWAITING") pendingPayments++;
      if (e.completedAt) completions++;
      return { ...e, courseTitle: c.title, courseId: c.id };
    }),
  );
  const ratings = teacherCourses.flatMap((c) => c.reviews.map((r) => r.rating));
  const notesByCourse = new Map<string, number>();
  for (const n of notes) notesByCourse.set(n.courseId, (notesByCourse.get(n.courseId) ?? 0) + 1);

  const upcoming = classes.filter((c) => liveState(c.startsAt, c.durationMinutes) !== "ended");

  return {
    stats: {
      courses: teacherCourses.length,
      published: teacherCourses.filter((c) => c.published).length,
      students: students.size,
      activeLearners: activeLearners.size,
      enrollments: allEnrollments.length,
      newEnrollments30: allEnrollments.filter((e) => now - e.enrolledAt.getTime() <= 30 * DAY).length,
      completions,
      pendingPayments,
      upcomingClasses: upcoming.length,
      notes: notes.length,
      avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
      reviewCount: ratings.length,
    },
    upcoming: upcoming.slice(0, 5),
    recentEnrollments: [...allEnrollments]
      .sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime())
      .slice(0, 6),
    courses: teacherCourses.map((c) => {
      const nextClass = upcoming.find((u) => u.courseId === c.id);
      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        published: c.published,
        isFree: c.isFree,
        students: c.enrollments.filter((e) => hasAccess(c.isFree, e.paymentStatus)).length,
        enrollments: c.enrollments.length,
        lessons: c.sections.reduce((n, s) => n + s.lessons.length, 0),
        sections: c.sections.length,
        notes: notesByCourse.get(c.id) ?? 0,
        completionRate: c.enrollments.length
          ? Math.round((c.enrollments.filter((e) => e.completedAt).length / c.enrollments.length) * 100)
          : 0,
        avgRating: c.reviews.length ? c.reviews.reduce((a, r) => a + r.rating, 0) / c.reviews.length : null,
        nextClass: nextClass ? { title: nextClass.title, startsAt: nextClass.startsAt } : null,
      };
    }),
  };
}

/** Courses (with sections) a teacher can attach classes/notes to. */
export async function getTeacherCourseOptions(teacherId: string) {
  const db = await getDb();
  return db.query.courses.findMany({
    where: eq(courses.teacherId, teacherId),
    columns: { id: true, title: true },
    with: { sections: { columns: { id: true, title: true }, orderBy: (s, { asc: a }) => [a(s.order)] } },
    orderBy: (c, { asc: a }) => [a(c.title)],
  });
}

export async function getTeacherLiveClasses(teacherId: string, courseId?: string) {
  const db = await getDb();
  const rows = await db.query.liveClasses.findMany({
    where: courseId
      ? and(eq(liveClasses.teacherId, teacherId), eq(liveClasses.courseId, courseId))
      : eq(liveClasses.teacherId, teacherId),
    with: { course: { columns: { id: true, title: true, slug: true } } },
    orderBy: [asc(liveClasses.startsAt)],
  });
  const upcoming = rows.filter(
    (r) => r.status === "SCHEDULED" && liveState(r.startsAt, r.durationMinutes) !== "ended",
  );
  const past = rows
    .filter((r) => !upcoming.includes(r))
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
  return { upcoming, past };
}

export async function getTeacherNotes(teacherId: string, courseId?: string) {
  const db = await getDb();
  const owned = await db.query.courses.findMany({
    where: eq(courses.teacherId, teacherId),
    columns: { id: true },
  });
  const ids = owned.map((c) => c.id).filter((id) => !courseId || id === courseId);
  if (ids.length === 0) return [];
  return db.query.courseNotes.findMany({
    where: inArray(courseNotes.courseId, ids),
    with: {
      course: { columns: { id: true, title: true } },
      section: { columns: { title: true } },
    },
    orderBy: [desc(courseNotes.createdAt)],
  });
}

export type StudentProgressRow = {
  userId: string;
  name: string;
  email: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: Date;
  paymentStatus: string;
  hasAccess: boolean;
  percent: number;
  lessonsDone: number;
  lessonsTotal: number;
  completedAt: Date | null;
  lastActiveAt: Date | null;
};

/** One row per (student, course) across the teacher's courses. */
export async function getTeacherStudentProgress(teacherId: string): Promise<StudentProgressRow[]> {
  const db = await getDb();
  const teacherCourses = await db.query.courses.findMany({
    where: eq(courses.teacherId, teacherId),
    columns: { id: true, title: true, isFree: true },
    with: {
      enrollments: { with: { user: { columns: { id: true, name: true, email: true } } } },
      sections: { columns: { id: true }, with: { lessons: { columns: { id: true } } } },
    },
  });
  const courseOfLesson = new Map<string, string>();
  const totals = new Map<string, number>();
  for (const c of teacherCourses) {
    let n = 0;
    for (const s of c.sections) for (const l of s.lessons) {
      courseOfLesson.set(l.id, c.id);
      n++;
    }
    totals.set(c.id, n);
  }
  const lessonIds = [...courseOfLesson.keys()];
  const progress = lessonIds.length
    ? await db.query.lessonProgress.findMany({
        where: inArray(lessonProgress.lessonId, lessonIds),
        columns: { userId: true, lessonId: true, completed: true, lastWatchedAt: true },
      })
    : [];
  const done = new Map<string, number>();
  const last = new Map<string, number>();
  for (const p of progress) {
    const key = `${p.userId}:${courseOfLesson.get(p.lessonId)}`;
    if (p.completed) done.set(key, (done.get(key) ?? 0) + 1);
    if (p.lastWatchedAt) last.set(key, Math.max(last.get(key) ?? 0, p.lastWatchedAt.getTime()));
  }

  return teacherCourses
    .flatMap((c) =>
      c.enrollments.map((e) => {
        const key = `${e.userId}:${c.id}`;
        const total = totals.get(c.id) ?? 0;
        const d = done.get(key) ?? 0;
        return {
          userId: e.userId,
          name: e.user.name,
          email: e.user.email,
          courseId: c.id,
          courseTitle: c.title,
          enrolledAt: e.enrolledAt,
          paymentStatus: e.paymentStatus,
          hasAccess: hasAccess(c.isFree, e.paymentStatus),
          percent: total ? Math.round((d / total) * 100) : 0,
          lessonsDone: d,
          lessonsTotal: total,
          completedAt: e.completedAt,
          lastActiveAt: last.has(key) ? new Date(last.get(key)!) : null,
        };
      }),
    )
    .sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime());
}

// ------------------------------------------------------------ student-facing

/** Upcoming (not ended) scheduled classes for the courses a student can access. */
export async function getStudentUpcomingClasses(studentId: string) {
  const ids = await accessibleCourseIds(studentId);
  if (ids.length === 0) return [];
  const db = await getDb();
  const rows = await db.query.liveClasses.findMany({
    where: and(
      inArray(liveClasses.courseId, ids),
      eq(liveClasses.status, "SCHEDULED"),
      gte(liveClasses.startsAt, new Date(Date.now() - 8 * 60 * 60_000)),
    ),
    with: {
      course: { columns: { title: true, slug: true } },
      teacher: { columns: { name: true } },
    },
    columns: { meetingUrl: false },
    orderBy: [asc(liveClasses.startsAt)],
  });
  return rows.filter((r) => liveState(r.startsAt, r.durationMinutes) !== "ended");
}

/** Classes and notes for one course page (callers must check access first). */
export async function getCourseLearningExtras(courseId: string) {
  const db = await getDb();
  const [classes, notes] = await Promise.all([
    db.query.liveClasses.findMany({
      where: eq(liveClasses.courseId, courseId),
      columns: { meetingUrl: false },
      with: { teacher: { columns: { name: true } } },
      orderBy: [asc(liveClasses.startsAt)],
    }),
    db.query.courseNotes.findMany({
      where: eq(courseNotes.courseId, courseId),
      with: { section: { columns: { title: true, order: true } } },
      orderBy: [asc(courseNotes.createdAt)],
    }),
  ]);
  const visible = classes.filter((c) => c.status === "SCHEDULED");
  return {
    upcomingClasses: visible.filter((c) => liveState(c.startsAt, c.durationMinutes) !== "ended"),
    pastRecordings: visible
      .filter((c) => liveState(c.startsAt, c.durationMinutes) === "ended" && c.recordingUrl)
      .reverse(),
    notes,
  };
}
