import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { supportTickets, TICKET_STATUSES } from "@kanada/db";
import { Button, Select, buttonVariants, cn } from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getDb } from "@/lib/db";
import { formatIst } from "@/lib/time";
import { CATEGORY_LABEL, PRIORITY_LABEL, STATUS_META } from "@/lib/support";
import { setTicketPriorityAction, setTicketStatusAction } from "@/actions/support-actions";
import { Panel } from "@/components/teacher/ui";
import { ReplyForm } from "@/components/support/reply-form";
import { TicketStatusBadge, TicketThread } from "@/components/support/thread";

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const db = await getDb();
  const t = await db.query.supportTickets.findFirst({
    where: eq(supportTickets.id, id),
    with: {
      user: { columns: { id: true, name: true, email: true, role: true } },
      course: { columns: { title: true, slug: true } },
      messages: { with: { author: { columns: { name: true } } }, orderBy: (m, { asc }) => [asc(m.createdAt)] },
    },
  });
  if (!t) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/support" className="text-sm text-muted-foreground hover:text-foreground">← Support tickets</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Ticket #{t.number} · opened {formatIst(t.createdAt)}</p>
          <h1 className="text-2xl font-bold tracking-tight">{t.subject}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {CATEGORY_LABEL[t.category]}
            {t.course && <> · <Link href={`/courses/${t.course.slug}`} className="hover:text-primary">{t.course.title}</Link></>}
          </p>
        </div>
        <TicketStatusBadge status={t.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          <TicketThread messages={t.messages} viewerIsStaff />
          <Panel title="Reply as support">
            <ReplyForm ticketId={t.id} placeholder="Your reply is emailed to the user." />
          </Panel>
        </div>
        <aside className="space-y-4">
          <Panel title="Requester">
            <p className="font-medium">{t.user.name}</p>
            <p className="break-all text-sm text-muted-foreground">{t.user.email}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{t.user.role.toLowerCase()}</p>
            <Link href={`/admin/users/${t.user.id}`} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-3 w-full")}>
              View profile
            </Link>
          </Panel>
          <Panel title="Status">
            <div className="grid gap-2">
              {TICKET_STATUSES.map((s) => (
                <form key={s} action={setTicketStatusAction.bind(null, t.id, s)}>
                  <Button type="submit" size="sm" variant={t.status === s ? "default" : "outline"} className="w-full" disabled={t.status === s}>
                    {STATUS_META[s].label}
                  </Button>
                </form>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">The user is emailed when you change the status.</p>
          </Panel>
          <Panel title="Priority">
            <form action={setTicketPriorityAction.bind(null, t.id)} className="flex gap-2">
              <Select name="priority" defaultValue={t.priority} aria-label="Priority" className="h-9">
                {Object.entries(PRIORITY_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Select>
              <Button type="submit" size="sm" variant="outline">Save</Button>
            </form>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
