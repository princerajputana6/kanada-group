import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const ROLES = ["ADMIN", "TEACHER", "STUDENT"] as const;
export type Role = (typeof ROLES)[number];

export const LESSON_TYPES = ["VIDEO", "TEXT"] as const;
export type LessonType = (typeof LESSON_TYPES)[number];

/**
 * Payment lifecycle for a (student, paid-course) enrollment:
 *  NONE      — free course, or not yet started (full access for free courses)
 *  AWAITING  — student picked the paid track; shown the QR, yet to pay
 *  SUBMITTED — student uploaded a payment screenshot; awaiting admin review
 *  PAID      — admin verified the payment; course unlocked
 *  REJECTED  — admin rejected the screenshot; student may re-upload
 */
export const PAYMENT_STATUSES = [
  "NONE",
  "AWAITING",
  "SUBMITTED",
  "PAID",
  "REJECTED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamp = (column: string) =>
  integer(column, { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

export const users = sqliteTable(
  "users",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ROLES }).notNull().default("STUDENT"),
    image: text("image"),
    bio: text("bio"),
    // ---- VLSI Training Program registration profile (students) ----
    whatsapp: text("whatsapp"),
    /** Course Completed/Enrolled: "B.Tech/B.E.", "M.Tech/M.S." or other. */
    qualification: text("qualification"),
    branch: text("branch"),
    completionYear: text("completion_year"),
    /** Current affiliation — company or college name. */
    affiliation: text("affiliation"),
    workExperience: text("work_experience"),
    priorTools: text("prior_tools"),
    /** Interested field in VLSI: "Analog", "Digital" or other. */
    interestField: text("interest_field"),
    /** R2 object key of the uploaded resume (PDF). */
    resumeKey: text("resume_key"),
    banned: integer("banned", { mode: "boolean" }).notNull().default(false),
    /** Sessions signed in before this instant are rejected — bumped on
     * password reset, ban and "sign out everywhere". Null = no cut-off. */
    sessionsValidAfter: integer("sessions_valid_after", { mode: "timestamp" }),
    createdAt: timestamp("created_at"),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const categories = sqliteTable(
  "categories",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (table) => [uniqueIndex("categories_slug_idx").on(table.slug)],
);

export const courses = sqliteTable(
  "courses",
  {
    id: id(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    thumbnailUrl: text("thumbnail_url"),
    category: text("category"),
    level: text("level").notNull().default("BEGINNER"),
    isFree: integer("is_free", { mode: "boolean" }).notNull().default(true),
    price: integer("price"),
    published: integer("published", { mode: "boolean" })
      .notNull()
      .default(false),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at"),
  },
  (table) => [uniqueIndex("courses_slug_idx").on(table.slug)],
);

export const sections = sqliteTable("sections", {
  id: id(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0),
});

export const lessons = sqliteTable("lessons", {
  id: id(),
  sectionId: text("section_id")
    .notNull()
    .references(() => sections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type", { enum: LESSON_TYPES }).notNull().default("VIDEO"),
  videoKey: text("video_key"),
  durationSeconds: integer("duration_seconds"),
  content: text("content"),
  order: integer("order").notNull().default(0),
  isPreview: integer("is_preview", { mode: "boolean" })
    .notNull()
    .default(false),
});

export const enrollments = sqliteTable(
  "enrollments",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at"),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    // ---- Payment (paid tracks only; free courses stay NONE) ----
    paymentStatus: text("payment_status", { enum: PAYMENT_STATUSES })
      .notNull()
      .default("NONE"),
    /** Price snapshot (in the course's currency units) at enrollment time. */
    amount: integer("amount"),
    /** R2 object key of the payment screenshot the student uploaded. */
    paymentScreenshotKey: text("payment_screenshot_key"),
    paidAt: integer("paid_at", { mode: "timestamp" }),
  },
  (table) => [
    uniqueIndex("enrollments_user_course_idx").on(
      table.userId,
      table.courseId,
    ),
  ],
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    watchedSeconds: integer("watched_seconds").notNull().default(0),
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(false),
    lastWatchedAt: integer("last_watched_at", { mode: "timestamp" }),
  },
  (table) => [
    uniqueIndex("lesson_progress_user_lesson_idx").on(
      table.userId,
      table.lessonId,
    ),
  ],
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at"),
  },
  (table) => [
    uniqueIndex("reviews_user_course_idx").on(table.userId, table.courseId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  coursesTaught: many(courses),
  enrollments: many(enrollments),
  reviews: many(reviews),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(users, { fields: [courses.teacherId], references: [users.id] }),
  sections: many(sections),
  enrollments: many(enrollments),
  reviews: many(reviews),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, { fields: [sections.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  section: one(sections, { fields: [lessons.sectionId], references: [sections.id] }),
  progress: many(lessonProgress),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, { fields: [lessonProgress.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [lessonProgress.lessonId], references: [lessons.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  course: one(courses, { fields: [reviews.courseId], references: [courses.id] }),
}));
