import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { LifeBuoy, Plus } from "lucide-react";
import { supportTickets } from "@kanada/db";
import { buttonVariants, cn } from "@kanada/ui";
import { requireUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { CATEGORY_LABEL } from "@/lib/support";
import { EmptyState, PageHeader } from "@/components/teacher/ui";
import { TicketStatusBadge } from "@/components/support/thread";

export const metadata: Metadata = { title: "Support | Kanada Group" };

export default async function SupportPage() {
  const me = await requireUser();
  if (me.role === "ADMIN") redirect("/admin/support");
  const db = await getDb();
  const tickets = await db.query.supportTickets.findMany({
    where: eq(supportTickets.userId, me.id),
    with: { messages: { columns: { id: true, fromStaff: true }, orderBy: (m, { desc: d }) => [d(m.createdAt)], limit: 1 } },
    orderBy: [desc(supportTickets.lastActivityAt)],
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-8">
      <PageHeader
        eyebrow="Help centre"
        title="Support"
        description="Something not working, or a question about payments or a course? Open a ticket and our team will reply here and by email."
        actions={
          <Link href="/support/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
            <Plus className="h-4 w-4" aria-hidden="true" /> New ticket
          </Link>
        }
      />
      {tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No tickets yet">
          <Link href="/support/new" className="text-primary hover:underline">Open a ticket</Link> whenever you need help.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {tickets.map((t) => {
            const awaitingYou = t.messages[0]?.fromStaff && (t.status === "IN_PROGRESS" || t.status === "OPEN");
            return (
              <li key={t.id}>
                <Link href={`/support/${t.id}`} className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-foreground/[0.03] sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      <span className="text-muted-foreground">#{t.number}</span> {t.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_LABEL[t.category]} · updated {formatDate(t.lastActivityAt)}
                      {awaitingYou && <span className="ml-2 font-medium text-primary">· New reply from support</span>}
                    </p>
                  </div>
                  <TicketStatusBadge status={t.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
