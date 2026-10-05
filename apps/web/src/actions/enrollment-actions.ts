"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { courses, enrollments, users } from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { getFoundationsCompletion } from "@/lib/queries";
import {
  sendPaymentApprovedEmail,
  sendPaymentSubmittedEmail,
} from "@/lib/email";

async function originFromHeaders(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Student enrolls in a course.
 *  - Free course → active immediately (paymentStatus NONE).
 *  - Paid course → only allowed once the free Foundations program is 100%
 *    complete; creates an AWAITING-payment enrollment so the course page can
 *    show the QR + screenshot upload.
 */
export async function enrollAction(courseSlug: string) {
  const user = await requireRole(["STUDENT"]);
  const db = await getDb();

  const course = await db.query.courses.findFirst({
    where: and(eq(courses.slug, courseSlug), eq(courses.published, true)),
  });
  if (!course) throw new Error("Course not found.");

  const existing = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)),
  });

  if (!course.isFree) {
    const foundations = await getFoundationsCompletion(user.id);
    if (!foundations.completed) {
      throw new Error("Complete the free Foundations program before enrolling in a paid track.");
    }
    if (!existing) {
      await db.insert(enrollments).values({
        userId: user.id,
        courseId: course.id,
        paymentStatus: "AWAITING",
        amount: course.price ?? null,
      });
    }
  } else if (!existing) {
    await db.insert(enrollments).values({
      userId: user.id,
      courseId: course.id,
      paymentStatus: "NONE",
    });
  }

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/student/dashboard");
}

/**
 * Student uploads a payment screenshot (already in R2) → moves the enrollment
 * to SUBMITTED for admin review and emails a receipt.
 */
export async function submitPaymentAction(enrollmentId: string, screenshotKey: string) {
  const user = await requireRole(["STUDENT"]);
  const db = await getDb();

  const enrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, user.id)),
    with: { course: true },
  });
  if (!enrollment) throw new Error("Enrollment not found.");
  if (enrollment.paymentStatus === "PAID") return;

  await db
    .update(enrollments)
    .set({ paymentStatus: "SUBMITTED", paymentScreenshotKey: screenshotKey })
    .where(eq(enrollments.id, enrollmentId));

  try {
    if (user.email) {
      await sendPaymentSubmittedEmail({
        to: user.email,
        name: user.name ?? "there",
        courseTitle: enrollment.course.title,
      });
    }
  } catch {
    // non-critical
  }

  revalidatePath(`/courses/${enrollment.course.slug}`);
  revalidatePath("/student/dashboard");
}

/**
 * Admin verifies (or rejects) a payment. On PAID: records paidAt and emails
 * the student that their enrollment is active.
 */
export async function setPaymentStatusAction(
  enrollmentId: string,
  status: "PAID" | "REJECTED",
) {
  await requireRole(["ADMIN"]);
  const db = await getDb();

  const enrollment = await db.query.enrollments.findFirst({
    where: eq(enrollments.id, enrollmentId),
    with: { course: true },
  });
  if (!enrollment) throw new Error("Enrollment not found.");

  await db
    .update(enrollments)
    .set({ paymentStatus: status, paidAt: status === "PAID" ? new Date() : null })
    .where(eq(enrollments.id, enrollmentId));

  if (status === "PAID") {
    const student = await db.query.users.findFirst({
      where: eq(users.id, enrollment.userId),
    });
    if (student) {
      try {
        await sendPaymentApprovedEmail({
          to: student.email,
          name: student.name,
          courseTitle: enrollment.course.title,
          courseUrl: `${await originFromHeaders()}/courses/${enrollment.course.slug}`,
        });
      } catch {
        // non-critical
      }
    }
  }

  revalidatePath("/admin/enrollments");
  revalidatePath(`/courses/${enrollment.course.slug}`);
}
