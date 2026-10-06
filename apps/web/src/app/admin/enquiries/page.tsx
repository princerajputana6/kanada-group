import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@kanada/ui";
import { getEnquiries } from "@/lib/admin-queries";
import { formatDate } from "@/lib/utils";
import { EnquiryStatusControl } from "@/components/admin/enquiry-status-control";

export default async function AdminEnquiriesPage() {
  const rows = await getEnquiries();
  const newCount = rows.filter((r) => r.status === "NEW").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Enquiries</h1>
        <p className="mt-1 text-muted-foreground">
          Course enquiries from the website popup. {newCount > 0
            ? `${newCount} new.`
            : "All caught up."}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No enquiries yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Heard via</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>
                    <a href={`tel:${r.phone}`} className="block hover:text-primary">
                      {r.phone}
                    </a>
                    <a
                      href={`mailto:${r.email}`}
                      className="block text-xs text-muted-foreground hover:text-primary"
                    >
                      {r.email}
                    </a>
                  </TableCell>
                  <TableCell className="text-sm">{r.course ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.source ?? "—"}</TableCell>
                  <TableCell className="max-w-[260px] text-sm text-muted-foreground">
                    {r.message ? (
                      <span className="line-clamp-3">{r.message}</span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </TableCell>
                  <TableCell>
                    <EnquiryStatusControl enquiryId={r.id} status={r.status} />
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
