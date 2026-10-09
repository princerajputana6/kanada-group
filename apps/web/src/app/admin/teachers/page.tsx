import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight, GraduationCap, Plus } from "lucide-react";
import { users } from "@kanada/db";
import { Badge, buttonVariants, cn } from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getDb } from "@/lib/db";
import { getTeacherOverview } from "@/lib/teacher-queries";
import { EmptyState, PageHeader } from "@/components/teacher/ui";

export default async function AdminTeachersPage() {
  await requireRole(["ADMIN"]);
  const db = await getDb();
  const teachers = await db.query.users.findMany({
    where: eq(users.role, "TEACHER"),
    columns: { id: true, name: true, email: true, banned: true },
    orderBy: (u, { asc }) => [asc(u.name)],
  });
  const overviews = await Promise.all(teachers.map((t) => getTeacherOverview(t.id)));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Teachers"
        description="Open a teacher's workspace to manage their courses, curriculum, live classes, notes and students."
        actions={
          <Link href="/admin/users/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add teacher
          </Link>
        }
      />
      {teachers.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No teachers yet">Create a user with the Teacher role to get started.</EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {teachers.map((t, i) => {
            const s = overviews[i]!.stats;
            return (
              <li key={t.id}>
                <Link
                  href={`/admin/teachers/${t.id}/dashboard`}
                  className="group block rounded-3xl border border-border bg-card p-5 shadow-[var(--glass-shadow)] transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 font-display font-bold text-primary">
                        {t.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold group-hover:text-primary">{t.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{t.email}</p>
                      </div>
                    </div>
                    {t.banned && <Badge variant="destructive">Banned</Badge>}
                  </div>
                  <dl className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      ["Courses", s.courses],
                      ["Students", s.students],
                      ["Classes", s.upcomingClasses],
                      ["Notes", s.notes],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-secondary/60 px-2 py-2">
                        <dd className="font-display text-lg font-bold tabular-nums">{value}</dd>
                        <dt className="text-muted-foreground">{label}</dt>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Open workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
