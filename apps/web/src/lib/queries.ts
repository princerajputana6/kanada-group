import { and, eq, inArray, like, or, sql } from "drizzle-orm";
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
    // Basics (free) first, then the paid tracks in creation order.
    orderBy: (c, { desc, asc }) => [desc(c.isFree), asc(c.createdAt)],
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

  return rows.map(({ course, enrolledAt, paymentStatus }) => {
    const allLessons = course.sections.flatMap((s) => s.lessons);
    const total = allLessons.length;
    const completed = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
    // Paid tracks are only reachable once payment is verified.
    const locked = !course.isFree && paymentStatus !== "PAID";
    return {
      course,
      enrolledAt,
      paymentStatus,
      locked,
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

  return { course, enrollment, progressByLesson };
}

/**
 * Whether the student has fully completed every published FREE course — the
 * "complete the basics first" gate before the paid tracks can be bought.
 * Returns the free course's slug/title too (for linking them to it).
 */
export async function getFoundationsCompletion(userId: string) {
  const db = await getDb();
  const freeCourses = await db.query.courses.findMany({
    where: and(eq(courses.isFree, true), eq(courses.published, true)),
    with: { sections: { with: { lessons: { columns: { id: true } } } } },
  });

  const progressRows = await db.query.lessonProgress.findMany({
    where: eq(lessonProgress.userId, userId),
  });
  const completed = new Set(
    progressRows.filter((p) => p.completed).map((p) => p.lessonId),
  );

  let allComplete = freeCourses.length > 0;
  for (const c of freeCourses) {
    const lessonIds = c.sections.flatMap((s) => s.lessons.map((l) => l.id));
    if (lessonIds.length === 0 || !lessonIds.every((id) => completed.has(id))) {
      allComplete = false;
    }
  }

  const primary = freeCourses[0];
  return {
    completed: allComplete,
    freeCourseSlug: primary?.slug ?? null,
    freeCourseTitle: primary?.title ?? null,
  };
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

export async function getTeacherAnalytics(teacherId: string) {
  const db = await getDb();
  const teacherCourses = await db.query.courses.findMany({
    where: eq(courses.teacherId, teacherId),
    with: {
      enrollments: { with: { user: true } },
      reviews: true,
      sections: { with: { lessons: true } },
    },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });

  const allLessonIds = teacherCourses.flatMap((c) =>
    c.sections.flatMap((s) => s.lessons.map((l) => l.id)),
  );
  const progressRows =
    allLessonIds.length > 0
      ? await db.query.lessonProgress.findMany({
          where: inArray(lessonProgress.lessonId, allLessonIds),
        })
      : [];
  const completedByLesson = new Map<string, number>();
  for (const p of progressRows) {
    if (p.completed) completedByLesson.set(p.lessonId, (completedByLesson.get(p.lessonId) ?? 0) + 1);
  }

  const uniqueStudentIds = new Set<string>();
  const perCourse = teacherCourses.map((course) => {
    const lessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l.id));
    const totalLessons = lessonIds.length;
    const enrollmentCount = course.enrollments.length;
    course.enrollments.forEach((e) => uniqueStudentIds.add(e.userId));

    const completedEnrollments = course.enrollments.filter((e) => e.completedAt).length;
    const avgRating =
      course.reviews.length > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
        : null;

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      published: course.published,
      enrollmentCount,
      completedEnrollments,
      completionRate:
        enrollmentCount === 0 ? 0 : Math.round((completedEnrollments / enrollmentCount) * 100),
      totalLessons,
      avgRating,
    };
  });

  const totalEnrollments = perCourse.reduce((sum, c) => sum + c.enrollmentCount, 0);
  const recentStudents = teacherCourses
    .flatMap((c) => c.enrollments.map((e) => ({ ...e, courseTitle: c.title })))
    .sort((a, b) => (b.enrolledAt?.getTime() ?? 0) - (a.enrolledAt?.getTime() ?? 0))
    .slice(0, 10);

  return {
    courses: perCourse,
    totalCourses: teacherCourses.length,
    totalStudents: uniqueStudentIds.size,
    totalEnrollments,
    recentStudents,
  };
}

export async function getTeacherStudents(teacherId: string) {
  const db = await getDb();
  const teacherCourses = await db.query.courses.findMany({
    where: eq(courses.teacherId, teacherId),
    with: { enrollments: { with: { user: true } } },
  });

  const byStudent = new Map<
    string,
    { student: (typeof teacherCourses)[number]["enrollments"][number]["user"]; courses: string[] }
  >();

  for (const course of teacherCourses) {
    for (const enrollment of course.enrollments) {
      const existing = byStudent.get(enrollment.userId);
      if (existing) {
        existing.courses.push(course.title);
      } else {
        byStudent.set(enrollment.userId, {
          student: enrollment.user,
          courses: [course.title],
        });
      }
    }
  }

  return Array.from(byStudent.values());
}

export async function getAdminAnalytics() {
  const db = await getDb();
  const [allCourses, allEnrollments, allReviews] = await Promise.all([
    db.query.courses.findMany({
      with: { enrollments: true, reviews: true, teacher: true },
    }),
    db.query.enrollments.findMany(),
    db.query.reviews.findMany(),
  ]);

  const topCourses = [...allCourses]
    .sort((a, b) => b.enrollments.length - a.enrollments.length)
    .slice(0, 5)
    .map((c) => ({
      title: c.title,
      slug: c.slug,
      teacherName: c.teacher.name,
      enrollmentCount: c.enrollments.length,
    }));

  const completedCount = allEnrollments.filter((e) => e.completedAt).length;
  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : null;

  const categoryBreakdown = new Map<string, number>();
  for (const c of allCourses) {
    const key = c.category ?? "Uncategorized";
    categoryBreakdown.set(key, (categoryBreakdown.get(key) ?? 0) + 1);
  }

  return {
    topCourses,
    completedCount,
    completionRate:
      allEnrollments.length === 0
        ? 0
        : Math.round((completedCount / allEnrollments.length) * 100),
    avgRating,
    categoryBreakdown: Array.from(categoryBreakdown.entries()).map(([name, count]) => ({
      name,
      count,
    })),
  };
}

export async function getCertificateData(courseSlug: string, userId: string) {
  const db = await getDb();
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, courseSlug),
    with: { teacher: true },
  });
  if (!course) return null;

  const enrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, course.id)),
    with: { user: true },
  });
  if (!enrollment || !enrollment.completedAt) return null;

  return { course, enrollment, student: enrollment.user };
}

export async function getLessonWithCourse(lessonId: string) {
  const db = await getDb();
  return db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: { section: { with: { course: true } } },
  });
}
