"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge, Select } from "@kanada/ui";
import { setEnquiryStatusAction } from "@/actions/enquiry-actions";

type Status = "NEW" | "CONTACTED" | "CLOSED";

const LABEL: Record<Status, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

function variantFor(s: Status): "default" | "secondary" | "outline" {
  if (s === "NEW") return "default";
  if (s === "CONTACTED") return "outline";
  return "secondary";
}

export function EnquiryStatusControl({
  enquiryId,
  status,
}: {
  enquiryId: string;
  status: Status;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState<Status>(status);

  function onChange(next: Status) {
    setValue(next);
    startTransition(async () => {
      await setEnquiryStatusAction(enquiryId, next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variantFor(value)}>{LABEL[value]}</Badge>
      <Select
        aria-label="Enquiry status"
        value={value}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as Status)}
        className="h-8 w-[130px] text-xs"
      >
        <option value="NEW">New</option>
        <option value="CONTACTED">Contacted</option>
        <option value="CLOSED">Closed</option>
      </Select>
    </div>
  );
}
