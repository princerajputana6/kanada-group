import "server-only";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { coupons, enrollments } from "@kanada/db";
import { getDb } from "./db";

export const COUPON_CODE_RE = /^[A-Z0-9][A-Z0-9_-]{2,31}$/;

export function normalizeCouponCode(raw: unknown): string {
  return String(raw ?? "").trim().toUpperCase();
}

export function computeDiscount(type: "PERCENT" | "FIXED", value: number, price: number): number {
  const raw = type === "PERCENT" ? Math.round((price * value) / 100) : value;
  return Math.max(0, Math.min(price, raw));
}

/** Submitted or paid enrollments that used the coupon (pending AWAITING ones don't count). */
export async function couponUses(couponId: string, excludeEnrollmentId?: string) {
  const db = await getDb();
  const [row] = await db
    .select({ n: sql<number>`count(*)` })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.couponId, couponId),
        inArray(enrollments.paymentStatus, ["SUBMITTED", "PAID"]),
        excludeEnrollmentId ? ne(enrollments.id, excludeEnrollmentId) : undefined,
      ),
    );
  return Number(row?.n ?? 0);
}

export type CouponCheck =
  | { ok: true; couponId: string; code: string; discount: number; finalPrice: number; label: string }
  | { ok: false; error: string };

/**
 * Validates a code for a course at its current price. Used when the student
 * applies it and again when they submit payment, so a coupon that expired
 * or ran out in between can't slip through.
 */
export async function checkCoupon(
  rawCode: string,
  course: { id: string; price: number | null; isFree: boolean },
  enrollmentId?: string,
): Promise<CouponCheck> {
  const code = normalizeCouponCode(rawCode);
  if (!COUPON_CODE_RE.test(code)) return { ok: false, error: "That coupon code isn't valid." };
  if (course.isFree || !course.price) return { ok: false, error: "Coupons only apply to paid courses." };

  const db = await getDb();
  const c = await db.query.coupons.findFirst({ where: eq(coupons.code, code) });
  const now = Date.now();
  if (!c || !c.active) return { ok: false, error: "That coupon code isn't valid." };
  if (c.courseId && c.courseId !== course.id) return { ok: false, error: "This coupon isn't valid for this course." };
  if (c.validFrom && now < c.validFrom.getTime()) return { ok: false, error: "This coupon isn't active yet." };
  if (c.validUntil && now > c.validUntil.getTime()) return { ok: false, error: "This coupon has expired." };
  if (c.maxRedemptions != null && (await couponUses(c.id, enrollmentId)) >= c.maxRedemptions) {
    return { ok: false, error: "This coupon has reached its usage limit." };
  }

  const discount = computeDiscount(c.discountType, c.discountValue, course.price);
  return {
    ok: true,
    couponId: c.id,
    code: c.code,
    discount,
    finalPrice: course.price - discount,
    label: c.discountType === "PERCENT" ? `${c.discountValue}% off` : `₹${c.discountValue.toLocaleString("en-IN")} off`,
  };
}
