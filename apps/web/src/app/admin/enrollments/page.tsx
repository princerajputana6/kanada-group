import { getPaymentEnrollments } from "@/lib/admin-queries";
import { PaymentsTable } from "@/components/admin/payments-table";

export default async function AdminEnrollmentsPage() {
  const rows = await getPaymentEnrollments();
  const pending = rows.filter((r) => r.status === "SUBMITTED").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Payments &amp; Enrollments</h1>
        <p className="mt-1 text-muted-foreground">
          Verify paid-track payments.{" "}
          {pending > 0 ? `${pending} awaiting review.` : "Nothing awaiting review."}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No paid enrollments yet.</p>
      ) : (
        <PaymentsTable rows={rows} />
      )}
    </div>
  );
}
