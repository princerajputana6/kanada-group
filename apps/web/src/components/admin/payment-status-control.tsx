"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge, Select } from "@kanada/ui";
import { setPaymentStatusAction } from "@/actions/enrollment-actions";

const LABEL: Record<string, string> = {
  AWAITING: "Awaiting payment",
  SUBMITTED: "Under review",
  PAID: "Paid",
  REJECTED: "Rejected",
  NONE: "—",
};

function variantFor(status: string): "secondary" | "default" | "destructive" | "outline" {
  if (status === "PAID") return "default";
  if (status === "REJECTED") return "destructive";
  if (status === "SUBMITTED") return "outline";
  return "secondary";
}

/**
 * Admin dropdown to verify/reject a payment. Changing it to Paid or Rejected
 * runs the server action (which emails the student on Paid) and refreshes.
 */
export function PaymentStatusControl({
  enrollmentId,
  status,
}: {
  enrollmentId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(next: string) {
    if (next !== "PAID" && next !== "REJECTED") return;
    setError(null);
    startTransition(async () => {
      try {
        await setPaymentStatusAction(enrollmentId, next);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <Badge variant={variantFor(status)}>{LABEL[status] ?? status}</Badge>
        <Select
          aria-label="Set payment status"
          defaultValue=""
          disabled={pending}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-[130px] text-xs"
        >
          <option value="" disabled>
            {pending ? "Saving…" : "Change…"}
          </option>
          <option value="PAID">Mark as Paid</option>
          <option value="REJECTED">Reject</option>
        </Select>
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
