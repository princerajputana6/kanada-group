"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { users } from "@kanada/db";
import { getDb } from "@/lib/db";
import { signInSchema, registrationSchema } from "@/lib/validation";
import { signIn, signOut } from "@/auth";
import { sendWelcomeEmail } from "@/lib/email";

async function originFromHeaders(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export type ActionState = { error?: string; success?: boolean };

export async function signUpAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    whatsapp: formData.get("whatsapp"),
    qualification: formData.get("qualification"),
    branch: formData.get("branch"),
    completionYear: formData.get("completionYear"),
    affiliation: formData.get("affiliation"),
    workExperience: formData.get("workExperience"),
    priorTools: formData.get("priorTools"),
    interestField: formData.get("interestField"),
    resumeKey: formData.get("resumeKey"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const d = parsed.data;
  const email = d.email.toLowerCase();
  const db = await getDb();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(d.password, 10);
  await db.insert(users).values({
    name: d.name,
    email,
    passwordHash,
    role: "STUDENT",
    whatsapp: d.whatsapp,
    qualification: d.qualification,
    branch: d.branch,
    completionYear: d.completionYear,
    affiliation: d.affiliation,
    workExperience: d.workExperience,
    priorTools: d.priorTools,
    interestField: d.interestField,
    resumeKey: d.resumeKey,
  });

  // Best-effort welcome email (never blocks registration).
  try {
    await sendWelcomeEmail({ to: email, name: d.name, appUrl: await originFromHeaders() });
  } catch {
    // swallowed — email is non-critical
  }

  await signIn("credentials", {
    email,
    password: d.password,
    redirectTo: "/student/dashboard",
  });

  return { success: true };
}

export async function signInAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: (formData.get("callbackUrl") as string) || "/post-sign-in",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  return { success: true };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
