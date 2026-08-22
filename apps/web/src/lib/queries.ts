import { and, eq, like, or, sql } from "drizzle-orm";
import { courses, enrollments, lessonProgress, lessons, users } from "@kanada/db";
import { getDb } from "./db";

export async function listPublishedCourses(opts?: { search?: string; category?: string }) {
  const db = await getDb();
  const conditions = [eq(courses.published, true)];

  if (opts?.search) {
    conditions.push(
      or(
        like(courses.title, `%${opts.search}%`),
        like(courses.description, `%${opts.search}%`),
      )!,
    );
  }
  if (opts?.category) {
    conditions.push(eq(courses.category, opts.category));
  }

  return db.query.courses.findMany({
    where: and(...conditions),
    with: { teacher: true, reviews: true, enrollments: true },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });
}

export async function getCourseDetail(slug: string) {
  const db = await getDb();
  return db.query.courses.findFirst({
    where: eq(courses.slug, slug),
    with: {
      teacher: true,
      reviews: { with: { user: true }, orderBy: (r, { desc }) => [desc(r.createdAt)] },
      enrollments: true,
      sections: {
        orderBy: (s, { asc }) => [asc(s.order)],
        with: {
          lessons: { orderBy: (l, { asc }) => [asc(l.order)] },
        },
      },
    },
  });
}

export async function getEnrolledCourseSlugs(userId: string) {
  const db = await getDb();
  const rows = await db.query.enrollments.findMany({
    where: eq(enrollments.userId, userId),
    with: { course: true },
  });
  return new Set(rows.map((r) => r.course.slug));
}

export async function getStudentDashboard(userId: string) {
  const db = await getDb();
  const rows = await db.query.enrollments.findMany({
    where: eq(enrollments.userId, userId),
    with: {
      course: {
        with: {
          sections: { with: { lessons: true } },
        },
      },
    },
    orderBy: (e, { desc }) => [desc(e.enrolledAt)],
  });

  const progressRows = await db.query.lessonProgress.findMany({
    where: eq(lessonProgress.userId, userId),
  });
  const completedLessonIds = new Set(
    progressRows.filter((p) => p.completed).map((p) => p.lessonId),
  );

  return rows.map(({ course, enrolledAt }) => {
    const allLessons = course.sections.flatMap((s) => s.lessons);
    const total = allLessons.length;
    const completed = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
    return {
      course,
      enrolledAt,
      totalLessons: total,
      completedLessons: completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  });
}

export async function getCourseForLearning(slug: string, userId: string) {
  const db = await getDb();
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
    with: {
      sections: {
        orderBy: (s, { asc }) => [asc(s.order)],
        with: { lessons: { orderBy: (l, { asc }) => [asc(l.order)] } },
      },
    },
  });
  if (!course) return null;

  const enrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, course.id)),
  });
  if (!enrollment) return null;

  const progressRows = await db.query.lessonProgress.findMany({
    where: eq(lessonProgress.userId, userId),
  });
  const progressByLesson = new Map(progressRows.map((p) => [p.lessonId, p]));

  return { course, progressByLesson };
}

export async function getTeacherCourses(teacherId: string) {
  const db = await getDb();
  return db.query.courses.findMany({
    where: eq(courses.teacherId, teacherId),
    with: { enrollments: true, sections: { with: { lessons: true } } },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });
}

export async function getCourseForEdit(courseId: string, teacherId: string) {
  const db = await getDb();
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.teacherId, teacherId)),
    with: {
      sections: {
        orderBy: (s, { asc }) => [asc(s.order)],
        with: { lessons: { orderBy: (l, { asc }) => [asc(l.order)] } },
      },
    },
  });
  return course ?? null;
}

export async function getAdminStats() {
  const db = await getDb();
  const [[userCount], [courseCount], [enrollmentCount], allUsers, allCourses] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(courses),
      db.select({ count: sql<number>`count(*)` }).from(enrollments),
      db.query.users.findMany({ orderBy: (u, { desc }) => [desc(u.createdAt)] }),
      db.query.courses.findMany({
        with: { teacher: true, enrollments: true },
        orderBy: (c, { desc }) => [desc(c.createdAt)],
      }),
    ]);

  return {
    userCount: userCount?.count ?? 0,
    courseCount: courseCount?.count ?? 0,
    enrollmentCount: enrollmentCount?.count ?? 0,
    users: allUsers,
    courses: allCourses,
  };
}

export async function getLessonWithCourse(lessonId: string) {
  const db = await getDb();
  return db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: { section: { with: { course: true } } },
  });
}
