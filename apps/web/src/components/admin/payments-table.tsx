"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PaymentStatus } from "@kanada/db";
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
import { PaymentStatusControl } from "@/components/admin/payment-status-control";
import { formatPrice, formatDate } from "@/lib/utils";

export interface PaymentRow {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  courseSlug: string;
  amount: number | null;
  status: PaymentStatus;
  hasScreenshot: boolean;
  enrolledAt: Date;
  note: string | null;
  couponCode: string | null;
  discount: number | null;
}

const STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "SUBMITTED", label: "Under review" },
  { value: "AWAITING", label: "Awaiting payment" },
  { value: "PAID", label: "Paid" },
  { value: "REJECTED", label: "Rejected" },
];

export function PaymentsTable({ rows }: { rows: PaymentRow[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | PaymentStatus>("ALL");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "ALL" && r.status !== status) return false;
      if (
        term &&
        !`${r.studentName} ${r.studentEmail} ${r.courseTitle}`.toLowerCase().includes(term)
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
          placeholder="Search student, email or course…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-sm"
          aria-label="Search payments"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as "ALL" | PaymentStatus)}
          className="h-10 sm:w-48"
          aria-label="Filter by payment status"
        >
          <option value="ALL">Any status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <span className="text-sm text-muted-foreground sm:ml-auto">
          {filtered.length} of {rows.length}
        </span>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Final amount</TableHead>
              <TableHead>Proof &amp; comment</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <span className="block font-medium">{r.studentName}</span>
                  <span className="block text-xs text-muted-foreground">{r.studentEmail}</span>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/courses/${r.courseSlug}`}
                    className="hover:text-primary hover:underline"
                  >
                    {r.courseTitle}
                  </Link>
                </TableCell>
                <TableCell className="tabular-nums">
                  <span className="block font-medium">{formatPrice(r.amount)}</span>
                  {r.couponCode && (
                    <span className="block text-xs text-emerald-700">
                      {r.couponCode} · −{formatPrice(r.discount ?? 0)}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {r.note && (
                    <p
                      className="mb-1 max-w-64 whitespace-pre-wrap break-words text-xs text-muted-foreground"
                      title="Student's comment"
                    >
                      “{r.note}”
                    </p>
                  )}
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
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No payments match these filters.
          </p>
        )}
      </div>
    </div>
  );
}
