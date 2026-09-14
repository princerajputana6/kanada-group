import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getCertificateData } from "@/lib/queries";
import { Certificate } from "@/components/certificate";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireRole(["STUDENT"]);
  const { slug } = await params;

  const data = await getCertificateData(slug, user.id);
  if (!data) notFound();

  const { course, enrollment, student } = data;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link
        href={`/student/courses/${slug}/learn`}
        className="mb-6 inline-block text-sm text-muted-foreground hover:underline print:hidden"
      >
        ← Back to course
      </Link>
      <Certificate
        studentName={student.name}
        courseTitle={course.title}
        teacherName={course.teacher.name}
        completedAt={enrollment.completedAt!}
        certificateId={enrollment.id}
      />
    </div>
  );
}
