import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { supportTickets } from "@kanada/db";
import { requireUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { formatIst } from "@/lib/time";
import { CATEGORY_LABEL, PRIORITY_LABEL } from "@/lib/support";
import { setTicketStatusAction } from "@/actions/support-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Panel } from "@/components/teacher/ui";
import { ReplyForm } from "@/components/support/reply-form";
import { TicketStatusBadge, TicketThread } from "@/components/support/thread";

export const metadata: Metadata = { title: "Support ticket | Kanada Group" };

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const me = await requireUser();
  const { id } = await params;
  if (me.role === "ADMIN") redirect(`/admin/support/${id}`);
  const { created } = await searchParams;
  const db = await getDb();
  const t = await db.query.supportTickets.findFirst({
    where: eq(supportTickets.id, id),
    with: {
      course: { columns: { title: true } },
      messages: { with: { author: { columns: { name: true } } }, orderBy: (m, { asc }) => [asc(m.createdAt)] },
    },
  });
  if (!t || t.userId !== me.id) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-8">
      <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground">← All tickets</Link>
      {created && (
        <p className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
          Ticket created. Our team has been notified and you&apos;ll get an email when we reply.
        </p>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Ticket #{t.number}</p>
          <h1 className="text-2xl font-bold tracking-tight">{t.subject}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[CATEGORY_LABEL[t.category], `${PRIORITY_LABEL[t.priority]} priority`, t.course?.title, `opened ${formatIst(t.createdAt)}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <TicketStatusBadge status={t.status} />
      </div>

      <TicketThread messages={t.messages} viewerIsStaff={false} />

      {t.status === "CLOSED" ? (
        <Panel>
          <p className="text-sm text-muted-foreground">This ticket is closed.</p>
          <form action={setTicketStatusAction.bind(null, t.id, "OPEN")} className="mt-3">
            <ConfirmSubmitButton size="sm" variant="outline" confirmText="Reopen this ticket?">Reopen ticket</ConfirmSubmitButton>
          </form>
        </Panel>
      ) : (
        <Panel title="Reply">
          <ReplyForm ticketId={t.id} />
          <form action={setTicketStatusAction.bind(null, t.id, "CLOSED")} className="mt-4 border-t border-border pt-4">
            <ConfirmSubmitButton size="sm" variant="ghost" confirmText="Close this ticket? You can reopen it later.">
              Problem solved — close ticket
            </ConfirmSubmitButton>
          </form>
        </Panel>
      )}
    </div>
  );
}
