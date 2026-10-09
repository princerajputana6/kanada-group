"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { passwordResetTokens, users } from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { trustedOrigin } from "@/lib/origin";
import { sendPasswordChangedEmail, sendPasswordResetEmail } from "@/lib/email";
import {
  RESET_MAX_PER_HOUR,
  RESET_TTL_MINUTES,
  findValidResetToken,
  hashToken,
  newResetToken,
} from "@/lib/password-reset";
import { signOut } from "@/auth";
import type { ActionState } from "./auth-actions";

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");
const newPasswordSchema = z.string().min(8, "Password must be at least 8 characters.").max(200);

/**
 * Step 1 of "Forgot password". Always reports success for a well-formed
 * email so the form can't be used to discover which emails have accounts.
 */
export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = await getDb();
  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data) });
  if (user && !user.banned) {
    const hourAgo = new Date(Date.now() - 60 * 60_000);
    const recent = await db.query.passwordResetTokens.findMany({
      where: and(eq(passwordResetTokens.userId, user.id), gt(passwordResetTokens.createdAt, hourAgo)),
      columns: { id: true },
    });
    if (recent.length < RESET_MAX_PER_HOUR) {
      // Only the newest link works: retire earlier ones (kept, not deleted,
      // so they still count toward the hourly limit) and prune old rows.
      await db
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)));
      await db
        .delete(passwordResetTokens)
        .where(and(eq(passwordResetTokens.userId, user.id), lt(passwordResetTokens.createdAt, new Date(Date.now() - 86_400_000))));
      const token = newResetToken();
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash: await hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60_000),
      });
      const resetUrl = `${await trustedOrigin()}/reset-password?token=${encodeURIComponent(token)}`;
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
        expiresMinutes: RESET_TTL_MINUTES,
      });
    }
  }
  return { success: true };
}

/** Step 2: the link from the email. Ends all sessions on success. */
export async function resetPasswordAction(
  token: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({ password: newPasswordSchema, confirm: z.string() })
    .refine((v) => v.password === v.confirm, { message: "The passwords don't match." })
    .safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const row = await findValidResetToken(token);
  if (!row) return { error: "This reset link has expired or was already used. Request a new one." };

  const db = await getDb();
  const user = await db.query.users.findFirst({ where: eq(users.id, row.userId) });
  if (!user || user.banned) return { error: "This account can't be reset. Contact support." };

  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(parsed.data.password, 10), sessionsValidAfter: new Date() })
    .where(eq(users.id, user.id));
  // Burn this token and any other outstanding ones.
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)));

  await sendPasswordChangedEmail({ to: user.email, name: user.name, appUrl: await trustedOrigin() });
  redirect("/sign-in?reset=1");
}

const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: newPasswordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "The new passwords don't match." })
  .refine((v) => v.next !== v.current, { message: "Choose a different password." });

/** Any signed-in user changes their own password; all their sessions end. */
export async function changeOwnPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if (me.role === "ADMIN" && parsed.data.next.length < 12) {
    return { error: "Admin passwords need at least 12 characters." };
  }

  const db = await getDb();
  const row = await db.query.users.findFirst({ where: eq(users.id, me.id) });
  if (!row || !(await bcrypt.compare(parsed.data.current, row.passwordHash))) {
    return { error: "Your current password is incorrect." };
  }
  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(parsed.data.next, 10), sessionsValidAfter: new Date() })
    .where(eq(users.id, me.id));
  await sendPasswordChangedEmail({ to: row.email, name: row.name, appUrl: await trustedOrigin() });
  await signOut({ redirectTo: "/sign-in?passwordChanged=1" });
  return { success: true };
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await requireUser();
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Name is too short.").max(100),
      bio: z.string().trim().max(1000).optional(),
    })
    .safeParse({ name: formData.get("name"), bio: formData.get("bio") ?? undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = await getDb();
  await db
    .update(users)
    .set({ name: parsed.data.name, bio: parsed.data.bio || null })
    .where(eq(users.id, me.id));
  revalidatePath("/", "layout");
  return { success: true };
}
