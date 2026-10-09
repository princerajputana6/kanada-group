import Link from "next/link";
import { LifeBuoy, Search } from "lucide-react";
import { Badge, Button, Input, Select } from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { CATEGORY_LABEL, PRIORITY_LABEL, STATUS_META } from "@/lib/support";
import { EmptyState, PageHeader } from "@/components/teacher/ui";
import { TicketStatusBadge } from "@/components/support/thread";

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; priority?: string; q?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { status = "active", category, priority, q } = await searchParams;
  const db = await getDb();
  const all = await db.query.supportTickets.findMany({
    with: {
      user: { columns: { name: true, email: true, role: true } },
      messages: { columns: { fromStaff: true }, orderBy: (m, { desc }) => [desc(m.createdAt)], limit: 1 },
    },
    orderBy: (t, { desc }) => [desc(t.lastActivityAt)],
  });
  const query = q?.trim().toLowerCase();
  const rows = all.filter(
    (t) =>
      (status === "all" ||
        (status === "active" ? t.status === "OPEN" || t.status === "IN_PROGRESS" : t.status === status)) &&
      (!category || t.category === category) &&
      (!priority || t.priority === priority) &&
      (!query ||
        t.subject.toLowerCase().includes(query) ||
        t.user.name.toLowerCase().includes(query) ||
        t.user.email.toLowerCase().includes(query) ||
        String(t.number) === query.replace("#", "")),
  );
  const needsReply = all.filter((t) => (t.status === "OPEN" || t.status === "IN_PROGRESS") && !t.messages[0]?.fromStaff).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Support tickets"
        description={`${needsReply} ticket${needsReply === 1 ? "" : "s"} waiting for a reply.`}
      />
      <form method="get" role="search" className="grid gap-3 rounded-3xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input name="q" type="search" defaultValue={q ?? ""} placeholder="Subject, name, email or #number" aria-label="Search tickets" className="pl-9" />
        </div>
        <Select name="status" defaultValue={status} aria-label="Status">
          <option value="active">Open &amp; in progress</option>
          {Object.entries(STATUS_META).map(([v, m]) => (
            <option key={v} value={v}>{m.label}</option>
          ))}
          <option value="all">All statuses</option>
        </Select>
        <Select name="category" defaultValue={category ?? ""} aria-label="Category">
          <option value="">Any category</option>
          {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
        <Select name="priority" defaultValue={priority ?? ""} aria-label="Priority">
          <option value="">Any priority</option>
          {Object.entries(PRIORITY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
        <Button type="submit" className="h-10">Filter</Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No tickets here">Nothing matches these filters.</EmptyState>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {rows.map((t) => {
            const waiting = (t.status === "OPEN" || t.status === "IN_PROGRESS") && !t.messages[0]?.fromStaff;
            return (
              <li key={t.id}>
                <Link href={`/admin/support/${t.id}`} className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-foreground/[0.03] sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      <span className="text-muted-foreground">#{t.number}</span> {t.subject}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.user.name} ({t.user.role === "TEACHER" ? "teacher" : "student"}) · {CATEGORY_LABEL[t.category]} · updated {formatDate(t.lastActivityAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {waiting && <Badge variant="secondary">Needs reply</Badge>}
                    {t.priority === "HIGH" && <Badge variant="destructive">High</Badge>}
                    <TicketStatusBadge status={t.status} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
