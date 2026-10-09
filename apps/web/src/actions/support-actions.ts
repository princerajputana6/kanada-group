"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  supportMessages,
  supportTickets,
  users,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketStatus,
} from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireRole, requireUser } from "@/lib/session";
import { trustedOrigin } from "@/lib/origin";
import { buildTicketEmail, escapeHtml, sendEmailBatch } from "@/lib/email";
import { STATUS_META } from "@/lib/support";
import type { ActionState } from "./auth-actions";

const bodySchema = z.string().trim().min(5, "Please write at least a few words.").max(5000, "Keep it under 5000 characters.");

function revalidateTicket(id?: string) {
  revalidatePath("/support");
  revalidatePath("/admin/support");
  if (id) {
    revalidatePath(`/support/${id}`);
    revalidatePath(`/admin/support/${id}`);
  }
}

/** Best-effort email to every active admin. */
async function notifyAdmins(heading: string, intro: string, t: { id: string; number: number; subject: string }, excerpt: string) {
  try {
    const db = await getDb();
    const admins = await db.query.users.findMany({
      where: and(eq(users.role, "ADMIN"), eq(users.banned, false)),
      columns: { email: true },
    });
    const url = `${await trustedOrigin()}/admin/support/${t.id}`;
    await sendEmailBatch(
      admins.map((a) =>
        buildTicketEmail({ to: a.email, heading, intro, ticketNumber: t.number, subject: t.subject, excerpt, ticketUrl: url, cta: "Open ticket" }),
      ),
    );
  } catch (err) {
    console.error("[support] admin notification failed", err);
  }
}

async function notifyOwner(
  owner: { email: string; name: string },
  heading: string,
  intro: string,
  t: { id: string; number: number; subject: string },
  excerpt?: string,
) {
  try {
    const url = `${await trustedOrigin()}/support/${t.id}`;
    await sendEmailBatch([
      buildTicketEmail({ to: owner.email, heading, intro, ticketNumber: t.number, subject: t.subject, excerpt, ticketUrl: url, cta: "View ticket" }),
    ]);
  } catch (err) {
    console.error("[support] user notification failed", err);
  }
}

export async function createTicketAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(["STUDENT", "TEACHER"]);
  const parsed = z
    .object({
      subject: z.string().trim().min(4, "Add a short subject.").max(150),
      category: z.enum(TICKET_CATEGORIES),
      priority: z.enum(TICKET_PRIORITIES),
      courseId: z.string().max(64).optional(),
      body: bodySchema,
    })
    .safeParse({
      subject: formData.get("subject"),
      category: formData.get("category") || "GENERAL",
      priority: formData.get("priority") || "NORMAL",
      courseId: formData.get("courseId") || undefined,
      body: formData.get("body"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = await getDb();
  // Simple running ticket number; the unique index guards the rare race.
  let ticket: { id: string; number: number; subject: string } | undefined;
  for (let attempt = 0; attempt < 3 && !ticket; attempt++) {
    const [row] = await db.select({ max: sql<number>`coalesce(max(${supportTickets.number}), 1000)` }).from(supportTickets);
    try {
      [ticket] = await db
        .insert(supportTickets)
        .values({
          number: Number(row?.max ?? 1000) + 1,
          userId: user.id,
          subject: parsed.data.subject,
          category: parsed.data.category,
          priority: parsed.data.priority,
          courseId: parsed.data.courseId || null,
        })
        .returning({ id: supportTickets.id, number: supportTickets.number, subject: supportTickets.subject });
    } catch (err) {
      if (attempt === 2) throw err;
    }
  }
  if (!ticket) return { error: "Couldn't create the ticket. Please try again." };

  await db.insert(supportMessages).values({ ticketId: ticket.id, authorId: user.id, body: parsed.data.body });
  await notifyAdmins("New support ticket", `${escapeHtml(user.name ?? "A user")} (${user.role === "TEACHER" ? "teacher" : "student"}) opened a ticket.`, ticket, parsed.data.body);
  revalidateTicket();
  redirect(`/support/${ticket.id}?created=1`);
}

async function loadTicket(ticketId: string) {
  z.string().min(1).max(64).parse(ticketId);
  const db = await getDb();
  const t = await db.query.supportTickets.findFirst({
    where: eq(supportTickets.id, ticketId),
    with: { user: { columns: { id: true, name: true, email: true } } },
  });
  if (!t) throw new Error("Ticket not found.");
  return t;
}

export async function replyTicketAction(ticketId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await requireUser();
  const t = await loadTicket(ticketId);
  const isStaff = me.role === "ADMIN";
  if (!isStaff && t.userId !== me.id) return { error: "Ticket not found." };
  if (t.status === "CLOSED" && !isStaff) return { error: "This ticket is closed. Open a new ticket if you still need help." };

  const body = bodySchema.safeParse(formData.get("body"));
  if (!body.success) return { error: body.error.issues[0]?.message };

  const db = await getDb();
  await db.insert(supportMessages).values({ ticketId: t.id, authorId: me.id, body: body.data, fromStaff: isStaff });

  // Staff reply moves OPEN → IN_PROGRESS; an owner reply reopens a resolved ticket.
  const nextStatus: TicketStatus =
    isStaff ? (t.status === "OPEN" ? "IN_PROGRESS" : t.status) : t.status === "RESOLVED" ? "OPEN" : t.status;
  await db
    .update(supportTickets)
    .set({ status: nextStatus, lastActivityAt: new Date() })
    .where(eq(supportTickets.id, t.id));

  if (isStaff) {
    await notifyOwner(t.user, "Support replied to your ticket", `Hi ${escapeHtml(t.user.name)}, our team replied to your ticket.`, t, body.data);
  } else {
    await notifyAdmins("New reply on a ticket", `${escapeHtml(t.user.name)} replied.`, t, body.data);
  }
  revalidateTicket(t.id);
  return { success: true };
}

/** Admins set any status; ticket owners may only close or reopen their own. */
export async function setTicketStatusAction(ticketId: string, status: TicketStatus) {
  const me = await requireUser();
  const next = z.enum(TICKET_STATUSES).parse(status);
  const t = await loadTicket(ticketId);
  const isStaff = me.role === "ADMIN";
  if (!isStaff) {
    if (t.userId !== me.id) throw new Error("Ticket not found.");
    if (next !== "CLOSED" && next !== "OPEN") throw new Error("Not allowed.");
  }
  if (t.status === next) return;
  const db = await getDb();
  await db.update(supportTickets).set({ status: next, lastActivityAt: new Date() }).where(eq(supportTickets.id, t.id));
  if (isStaff) {
    await notifyOwner(
      t.user,
      `Ticket ${STATUS_META[next].label.toLowerCase()}`,
      `Hi ${escapeHtml(t.user.name)}, the status of your ticket changed to <strong>${STATUS_META[next].label}</strong>.`,
      t,
    );
  }
  revalidateTicket(t.id);
}

export async function setTicketPriorityAction(ticketId: string, formData: FormData) {
  await requireRole(["ADMIN"]);
  const priority = z.enum(TICKET_PRIORITIES).parse(formData.get("priority"));
  const t = await loadTicket(ticketId);
  const db = await getDb();
  await db.update(supportTickets).set({ priority }).where(eq(supportTickets.id, t.id));
  revalidateTicket(t.id);
}
