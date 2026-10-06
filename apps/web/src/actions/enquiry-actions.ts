"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { enquiries, ENQUIRY_STATUSES, type EnquiryStatus } from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { enquirySchema } from "@/lib/validation";
import type { ActionState } from "./auth-actions";

/** Public enquiry submission from the header popup. Stored in `enquiries`. */
export async function submitEnquiryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = enquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    course: formData.get("course") || undefined,
    source: formData.get("source") || undefined,
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const d = parsed.data;
  const db = await getDb();
  await db.insert(enquiries).values({
    name: d.name,
    email: d.email.toLowerCase(),
    phone: d.phone,
    course: d.course ?? null,
    source: d.source ?? null,
    message: d.message ?? null,
  });

  revalidatePath("/admin/enquiries");
  return { success: true };
}

/** Admin updates an enquiry's status (NEW → CONTACTED → CLOSED). */
export async function setEnquiryStatusAction(
  enquiryId: string,
  status: EnquiryStatus,
) {
  await requireRole(["ADMIN"]);
  if (!ENQUIRY_STATUSES.includes(status)) throw new Error("Invalid status.");
  const db = await getDb();
  await db.update(enquiries).set({ status }).where(eq(enquiries.id, enquiryId));
  revalidatePath("/admin/enquiries");
}
