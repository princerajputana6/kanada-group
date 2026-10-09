import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { courses, enrollments } from "@kanada/db";
import { requireRole } from "@/lib/session";
import { getDb } from "@/lib/db";
import { PageHeader, Panel } from "@/components/teacher/ui";
import { NewTicketForm } from "@/components/support/new-ticket-form";

export const metadata: Metadata = { title: "New support ticket | Kanada Group" };

export default async function NewTicketPage() {
  const me = await requireRole(["STUDENT", "TEACHER"]);
  const db = await getDb();
  const options =
    me.role === "TEACHER"
      ? await db.query.courses.findMany({ where: eq(courses.teacherId, me.id), columns: { id: true, title: true } })
      : (
          await db.query.enrollments.findMany({
            where: eq(enrollments.userId, me.id),
            with: { course: { columns: { id: true, title: true } } },
          })
        ).map((e) => e.course);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-8">
      <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground">← Support</Link>
      <PageHeader title="Open a support ticket" description="Give us the details and we'll get back to you — you'll be emailed when we reply." />
      <Panel>
        <NewTicketForm courses={options} />
      </Panel>
    </div>
  );
}
