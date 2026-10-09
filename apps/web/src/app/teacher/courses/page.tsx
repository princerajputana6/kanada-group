import Link from "next/link";
import { BookOpen, FileText, Plus, Radio, Star, Users } from "lucide-react";
import { Badge, Progress, buttonVariants, cn } from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getTeacherOverview } from "@/lib/teacher-queries";
import { formatIst } from "@/lib/time";
import { EmptyState, PageHeader } from "@/components/teacher/ui";

export default async function TeacherCoursesPage() {
  const user = await requireRole(["TEACHER"]);
  const { courses } = await getTeacherOverview(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Teach"
        title="My courses"
        description="Build curriculum, share notes and run live classes for each course."
        actions={
          <Link href="/teacher/courses/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
            <Plus className="h-4 w-4" aria-hidden="true" /> New course
          </Link>
        }
      />
      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet">
          Create your first course to start adding lessons, notes and live classes.
        </EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {courses.map((c) => (
            <article
              key={c.id}
              className="group relative flex flex-col rounded-3xl border border-border bg-card p-6 shadow-[var(--glass-shadow)] transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold leading-snug">
                  <Link href={`/teacher/courses/${c.id}/edit`} className="after:absolute after:inset-0 group-hover:text-primary">
                    {c.title}
                  </Link>
                </h2>
                <div className="flex shrink-0 gap-1.5">
                  {c.isFree && <Badge variant="secondary">Free</Badge>}
                  <Badge variant={c.published ? "success" : "outline"}>{c.published ? "Published" : "Draft"}</Badge>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {[
                  { icon: Users, label: "Students", value: c.students },
                  { icon: BookOpen, label: "Lessons", value: c.lessons },
                  { icon: FileText, label: "Notes", value: c.notes },
                  { icon: Star, label: "Rating", value: c.avgRating ? c.avgRating.toFixed(1) : "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-2xl bg-secondary/60 px-3 py-2.5">
                    <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
                    </dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>Completion rate</span>
                  <span className="tabular-nums">{c.completionRate}%</span>
                </div>
                <Progress value={c.completionRate} className="h-1.5" />
              </div>
              <p className="mt-5 flex items-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
                <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                {c.nextClass ? `Next class: ${c.nextClass.title} · ${formatIst(c.nextClass.startsAt)}` : "No upcoming live class"}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
