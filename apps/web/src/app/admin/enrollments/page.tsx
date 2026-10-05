import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@kanada/ui";
import { getPaymentEnrollments } from "@/lib/admin-queries";
import { formatPrice, formatDate } from "@/lib/utils";
import { PaymentStatusControl } from "@/components/admin/payment-status-control";

export default async function AdminEnrollmentsPage() {
  const rows = await getPaymentEnrollments();
  const pending = rows.filter((r) => r.status === "SUBMITTED").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Payments &amp; Enrollments</h1>
        <p className="mt-1 text-muted-foreground">
          Verify paid-track payments. {pending > 0
            ? `${pending} awaiting review.`
            : "Nothing awaiting review."}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No paid enrollments yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <span className="block font-medium">{r.studentName}</span>
                    <span className="block text-xs text-muted-foreground">
                      {r.studentEmail}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/courses/${r.courseSlug}`}
                      className="hover:text-primary hover:underline"
                    >
                      {r.courseTitle}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">{formatPrice(r.amount)}</TableCell>
                  <TableCell>
                    {r.hasScreenshot ? (
                      <a
                        href={`/api/payment-screenshot/${r.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(r.enrolledAt)}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusControl enrollmentId={r.id} status={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
