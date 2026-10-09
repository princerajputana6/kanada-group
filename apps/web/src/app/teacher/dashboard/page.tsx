import Link from "next/link";
import {
  BookOpen,
  CalendarPlus,
  CheckCircle2,
  FileUp,
  Radio,
  Star,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import { Badge, Progress, buttonVariants, cn } from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getTeacherOverview } from "@/lib/teacher-queries";
import { formatIst, liveState } from "@/lib/time";
import { formatDate } from "@/lib/utils";
import { EmptyState, PageHeader, Panel, StatCard } from "@/components/teacher/ui";
import { DateTile, LiveStatusBadge } from "@/components/teacher/live-class-item";

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function TeacherOverviewPage() {
  const user = await requireRole(["TEACHER"]);
  const { stats, upcoming, recentEnrollments, courses } = await getTeacherOverview(user.id);
  const next = upcoming[0];
  // "Dr. Vibhu Srivastava" → "Dr. Vibhu"; "Sulekha Dwivedi" → "Sulekha".
  const parts = (user.name ?? "").trim().split(/\s+/);
  const firstName = /^(dr|prof|mr|mrs|ms|er)\.?$/i.test(parts[0] ?? "") ? parts.slice(0, 2).join(" ") : (parts[0] ?? "");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Instructor dashboard"
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        description="Here's what's happening across your courses today."
        actions={
          <>
            <Link href="/teacher/live" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
              <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Schedule class
            </Link>
            <Link href="/teacher/notes" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1.5")}>
              <FileUp className="h-4 w-4" aria-hidden="true" /> Upload notes
            </Link>
          </>
        }
      />

      {next && (
        <section className="theme-dark relative overflow-hidden rounded-3xl bg-background p-6 sm:p-8">
          <div aria-hidden="true" className="glow-purple absolute -right-24 -top-24 h-72 w-72 rounded-full" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <DateTile date={next.startsAt} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Next live class</p>
                <LiveStatusBadge startsAt={next.startsAt} durationMinutes={next.durationMinutes} />
              </div>
              <p className="mt-1 text-xl font-semibold text-white">{next.title}</p>
              <p className="text-sm text-muted-foreground">
                {next.course.title} · {formatIst(next.startsAt)} · {next.durationMinutes} min
              </p>
            </div>
            <Link
              href={`/live/${next.id}/join`}
              target="_blank"
              rel="noopener"
              className={cn(buttonVariants(), "gap-2")}
            >
              <Video className="h-4 w-4" aria-hidden="true" />
              {liveState(next.startsAt, next.durationMinutes) === "upcoming" ? "Open meeting" : "Start class"}
            </Link>
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Students" value={stats.students} hint={`${stats.activeLearners} active in the last 7 days`} />
        <StatCard icon={BookOpen} label="Enrollments" value={stats.enrollments} hint={`+${stats.newEnrollments30} in 30 days`} tone="violet" />
        <StatCard icon={Radio} label="Upcoming classes" value={stats.upcomingClasses} hint={`${stats.notes} notes shared`} tone="amber" />
        <StatCard
          icon={stats.avgRating ? Star : CheckCircle2}
          label={stats.avgRating ? "Average rating" : "Completions"}
          value={stats.avgRating ? stats.avgRating.toFixed(1) : stats.completions}
          hint={stats.avgRating ? `${stats.reviewCount} review${stats.reviewCount === 1 ? "" : "s"}` : "Students who finished a course"}
          tone="emerald"
        />
      </div>

      {stats.pendingPayments > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <Wallet className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <p>
            <strong>{stats.pendingPayments}</strong> enrollment{stats.pendingPayments === 1 ? " is" : "s are"} waiting on payment
            verification — those students can&apos;t access paid content, notes or live classes yet.
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Upcoming live classes"
          action={<Link href="/teacher/live" className="text-sm font-medium text-primary hover:underline">Manage →</Link>}
        >
          {upcoming.length === 0 ? (
            <EmptyState icon={Radio} title="No classes scheduled">
              <Link href="/teacher/live" className="text-primary hover:underline">Schedule a live class</Link> — students get an email with the details.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((c) => (
                <li key={c.id} className="flex items-center gap-4 py-3">
                  <DateTile date={c.startsAt} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {c.course.title} · {formatIst(c.startsAt)}
                    </p>
                  </div>
                  <LiveStatusBadge startsAt={c.startsAt} durationMinutes={c.durationMinutes} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent enrollments"
          action={<Link href="/teacher/students" className="text-sm font-medium text-primary hover:underline">All students →</Link>}
        >
          {recentEnrollments.length === 0 ? (
            <EmptyState icon={Users} title="No enrollments yet" />
          ) : (
            <ul className="divide-y divide-border">
              {recentEnrollments.map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {e.user.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.courseTitle}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(e.enrolledAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        title="Your courses"
        action={<Link href="/teacher/courses" className="text-sm font-medium text-primary hover:underline">View all →</Link>}
      >
        {courses.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses yet">
            <Link href="/teacher/courses/new" className="text-primary hover:underline">Create your first course</Link>.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border">
            {courses.slice(0, 5).map((c) => (
              <li key={c.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_10rem] sm:items-center">
                <div className="min-w-0">
                  <Link href={`/teacher/courses/${c.id}/edit`} className="font-medium hover:text-primary">
                    {c.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {c.students} student{c.students === 1 ? "" : "s"} · {c.lessons} lessons · {c.notes} notes
                  </p>
                </div>
                <Badge variant={c.published ? "success" : "outline"}>{c.published ? "Published" : "Draft"}</Badge>
                <div className="flex items-center gap-2">
                  <Progress value={c.completionRate} className="h-1.5" />
                  <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{c.completionRate}%</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
