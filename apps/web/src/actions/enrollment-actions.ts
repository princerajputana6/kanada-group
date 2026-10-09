"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { courses, enrollments, users } from "@kanada/db";
import { paymentKeyFor } from "@kanada/storage";
import { getDb } from "@/lib/db";
import { putObject } from "@/lib/storage";
import { checkCoupon } from "@/lib/coupons";
import { requireRole } from "@/lib/session";
import {
  sendPaymentApprovedEmail,
  sendPaymentSubmittedEmail,
} from "@/lib/email";

const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024; // 10 MB

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
    // Paid tracks can be purchased directly — no Foundations prerequisite.
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
 * Student uploads a payment screenshot (image) → stored in R2 via the Worker
 * binding, enrollment moves to SUBMITTED for admin review, receipt emailed.
 */
export async function submitPaymentAction(enrollmentId: string, formData: FormData) {
  const user = await requireRole(["STUDENT"]);
  const db = await getDb();

  const enrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, user.id)),
    with: { course: true },
  });
  if (!enrollment) throw new Error("Enrollment not found.");
  if (enrollment.paymentStatus === "PAID" || enrollment.paymentStatus === "SUBMITTED") return;

  const note = String(formData.get("note") ?? "").trim().slice(0, 1000) || null;

  // Re-validate the coupon: it may have expired or run out since it was applied.
  let finalAmount = enrollment.course.price ?? enrollment.amount ?? 0;
  if (enrollment.couponCode) {
    const check = await checkCoupon(enrollment.couponCode, enrollment.course, enrollment.id);
    if (!check.ok) {
      await db
        .update(enrollments)
        .set({ couponId: null, couponCode: null, discount: null, amount: enrollment.course.price ?? null })
        .where(eq(enrollments.id, enrollment.id));
      revalidatePath(`/courses/${enrollment.course.slug}`);
      throw new Error(`${check.error} It has been removed — please review the price and try again.`);
    }
    finalAmount = check.finalPrice;
  }

  // A screenshot is required unless a coupon brought the price to ₹0.
  const file = formData.get("file");
  let screenshotKey: string | null = null;
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) throw new Error("Payment proof must be an image.");
    if (file.size > MAX_SCREENSHOT_BYTES) throw new Error("Screenshot must be 10 MB or smaller.");
    screenshotKey = paymentKeyFor(enrollmentId, crypto.randomUUID(), file.name);
    await putObject(screenshotKey, await file.arrayBuffer(), file.type);
  } else if (finalAmount > 0) {
    throw new Error("Please attach your payment screenshot.");
  }

  await db
    .update(enrollments)
    .set({ paymentStatus: "SUBMITTED", paymentScreenshotKey: screenshotKey, paymentNote: note, amount: finalAmount })
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
  revalidatePath("/admin/enrollments");
}

export type CouponState = { error?: string; success?: boolean };

/** Applies a coupon to the student's pending enrollment; the QR shows the final price. */
export async function applyCouponAction(
  enrollmentId: string,
  _prev: CouponState,
  formData: FormData,
): Promise<CouponState> {
  const user = await requireRole(["STUDENT"]);
  const db = await getDb();
  const enrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, user.id)),
    with: { course: true },
  });
  if (!enrollment) return { error: "Enrollment not found." };
  if (enrollment.paymentStatus !== "AWAITING" && enrollment.paymentStatus !== "REJECTED") {
    return { error: "A coupon can't be changed after the payment is submitted." };
  }
  const check = await checkCoupon(String(formData.get("code") ?? ""), enrollment.course, enrollment.id);
  if (!check.ok) return { error: check.error };

  await db
    .update(enrollments)
    .set({ couponId: check.couponId, couponCode: check.code, discount: check.discount, amount: check.finalPrice })
    .where(eq(enrollments.id, enrollment.id));
  revalidatePath(`/courses/${enrollment.course.slug}`);
  return { success: true };
}

export async function removeCouponAction(enrollmentId: string) {
  const user = await requireRole(["STUDENT"]);
  const db = await getDb();
  const enrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, user.id)),
    with: { course: true },
  });
  if (!enrollment || (enrollment.paymentStatus !== "AWAITING" && enrollment.paymentStatus !== "REJECTED")) return;
  await db
    .update(enrollments)
    .set({ couponId: null, couponCode: null, discount: null, amount: enrollment.course.price ?? null })
    .where(eq(enrollments.id, enrollment.id));
  revalidatePath(`/courses/${enrollment.course.slug}`);
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
