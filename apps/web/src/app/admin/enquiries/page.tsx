import { getEnquiries } from "@/lib/admin-queries";
import { EnquiriesTable } from "@/components/admin/enquiries-table";

export default async function AdminEnquiriesPage() {
  const rows = await getEnquiries();
  const newCount = rows.filter((r) => r.status === "NEW").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Enquiries</h1>
        <p className="mt-1 text-muted-foreground">
          Course enquiries from the website popup.{" "}
          {newCount > 0 ? `${newCount} new.` : "All caught up."}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No enquiries yet.</p>
      ) : (
        <EnquiriesTable rows={rows} />
      )}
    </div>
  );
}
