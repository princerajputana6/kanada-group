"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { coupons, courses, enrollments } from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { COUPON_CODE_RE, normalizeCouponCode } from "@/lib/coupons";
import { parseIstLocal } from "@/lib/time";
import type { ActionState } from "./auth-actions";

const idSchema = z.string().min(1).max(64);

const couponSchema = z
  .object({
    code: z.string().regex(COUPON_CODE_RE, "Use 3–32 letters, numbers, - or _ (e.g. WELCOME20)."),
    description: z.string().trim().max(200).optional(),
    discountType: z.enum(["PERCENT", "FIXED"]),
    discountValue: z.coerce.number().int("Use a whole number.").min(1, "Discount must be at least 1."),
    courseId: z.string().max(64).optional(),
    maxRedemptions: z.coerce.number().int().min(1, "Limit must be at least 1.").optional(),
    validFrom: z.string().optional(),
    validUntil: z.string().optional(),
    active: z.boolean(),
  })
  .refine((v) => v.discountType !== "PERCENT" || v.discountValue <= 100, {
    message: "A percentage discount can be at most 100.",
  });

/** Dates arrive as YYYY-MM-DD (IST): from = start of day, until = end of day. */
function dayBoundary(day: string | undefined, end: boolean) {
  if (!day) return null;
  return parseIstLocal(`${day}T${end ? "23:59" : "00:00"}`);
}

async function readCouponForm(formData: FormData) {
  const parsed = couponSchema.safeParse({
    code: normalizeCouponCode(formData.get("code")),
    description: formData.get("description") || undefined,
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    courseId: formData.get("courseId") || undefined,
    maxRedemptions: formData.get("maxRedemptions") || undefined,
    validFrom: formData.get("validFrom") || undefined,
    validUntil: formData.get("validUntil") || undefined,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." } as const;
  const v = parsed.data;

  const validFrom = dayBoundary(v.validFrom, false);
  const validUntil = dayBoundary(v.validUntil, true);
  if (v.validFrom && !validFrom) return { error: "Invalid start date." } as const;
  if (v.validUntil && !validUntil) return { error: "Invalid end date." } as const;
  if (validFrom && validUntil && validUntil < validFrom) return { error: "The end date is before the start date." } as const;

  if (v.courseId) {
    const db = await getDb();
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, v.courseId),
      columns: { isFree: true },
    });
    if (!course) return { error: "Course not found." } as const;
    if (course.isFree) return { error: "Coupons only apply to paid courses." } as const;
  }

  return {
    values: {
      code: v.code,
      description: v.description || null,
      discountType: v.discountType,
      discountValue: v.discountValue,
      courseId: v.courseId || null,
      maxRedemptions: v.maxRedemptions ?? null,
      validFrom,
      validUntil,
      active: v.active,
    },
  } as const;
}

export async function createCouponAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireRole(["ADMIN"]);
  const res = await readCouponForm(formData);
  if ("error" in res) return { error: res.error };
  const db = await getDb();
  if (await db.query.coupons.findFirst({ where: eq(coupons.code, res.values.code), columns: { id: true } })) {
    return { error: `A coupon with code ${res.values.code} already exists.` };
  }
  await db.insert(coupons).values({ ...res.values, createdBy: admin.id });
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCouponAction(couponId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["ADMIN"]);
  idSchema.parse(couponId);
  const res = await readCouponForm(formData);
  if ("error" in res) return { error: res.error };
  const db = await getDb();
  const clash = await db.query.coupons.findFirst({ where: eq(coupons.code, res.values.code), columns: { id: true } });
  if (clash && clash.id !== couponId) return { error: `A coupon with code ${res.values.code} already exists.` };
  await db.update(coupons).set(res.values).where(eq(coupons.id, couponId));
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponAction(couponId: string) {
  await requireRole(["ADMIN"]);
  idSchema.parse(couponId);
  const db = await getDb();
  const c = await db.query.coupons.findFirst({ where: eq(coupons.id, couponId), columns: { active: true } });
  if (!c) return;
  await db.update(coupons).set({ active: !c.active }).where(eq(coupons.id, couponId));
  revalidatePath("/admin/coupons");
}

/** Enrollments keep their code + discount snapshot; only the link is cleared. */
export async function deleteCouponAction(couponId: string) {
  await requireRole(["ADMIN"]);
  idSchema.parse(couponId);
  const db = await getDb();
  await db.update(enrollments).set({ couponId: null }).where(eq(enrollments.couponId, couponId));
  await db.delete(coupons).where(eq(coupons.id, couponId));
  revalidatePath("/admin/coupons");
}
