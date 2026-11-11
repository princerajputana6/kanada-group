"use client";

import { useMemo, useState } from "react";
import {
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kanada/ui";
import { EnquiryStatusControl } from "@/components/admin/enquiry-status-control";
import { formatDate } from "@/lib/utils";

type Status = "NEW" | "CONTACTED" | "CLOSED";

export interface EnquiryRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  course: string | null;
  source: string | null;
  message: string | null;
  createdAt: Date;
  status: Status;
}

export function EnquiriesTable({ rows }: { rows: EnquiryRow[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | Status>("ALL");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "ALL" && r.status !== status) return false;
      if (
        term &&
        !`${r.name} ${r.phone} ${r.email} ${r.course ?? ""} ${r.message ?? ""}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [rows, q, status]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          placeholder="Search name, phone, email, course…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-sm"
          aria-label="Search enquiries"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as "ALL" | Status)}
          className="h-10 sm:w-44"
          aria-label="Filter by status"
        >
          <option value="ALL">Any status</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="CLOSED">Closed</option>
        </Select>
        <span className="text-sm text-muted-foreground sm:ml-auto">
          {filtered.length} of {rows.length}
        </span>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
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
            {filtered.map((r) => (
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
                  {r.message ? <span className="line-clamp-3">{r.message}</span> : "—"}
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
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No enquiries match these filters.
          </p>
        )}
      </div>
    </div>
  );
}
