"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@kanada/ui";
import { submitPaymentAction } from "@/actions/enrollment-actions";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * After scanning the QR and paying, the student uploads a screenshot. The
 * file is sent to a server action that stores it in R2 (via the Worker
 * binding) and marks the enrollment SUBMITTED for admin review.
 */
export function PaymentUpload({ enrollmentId, amountDue }: { enrollmentId: string; amountDue: number }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const needsProof = amountDue > 0;

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    if (f && f.size > MAX_BYTES) {
      setError("Screenshot must be 10 MB or smaller.");
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function submit() {
    if (needsProof && !file) return;
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      if (file) fd.append("file", file);
      fd.append("note", note);
      await submitPaymentAction(enrollmentId, fd);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor={`proof-${enrollmentId}`} className="text-xs font-medium text-muted-foreground">
          Payment screenshot{needsProof ? "" : " (optional)"}
        </label>
        <input
          id={`proof-${enrollmentId}`}
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onPick}
          className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-medium hover:file:bg-secondary/70"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`note-${enrollmentId}`} className="text-xs font-medium text-muted-foreground">
          Comment (optional)
        </label>
        <textarea
          id={`note-${enrollmentId}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="e.g. UPI transaction ID, the name on the paying account, or anything we should know"
          className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="button" className="w-full" disabled={(needsProof && !file) || busy} onClick={submit}>
        {busy ? "Submitting…" : needsProof ? "Submit payment proof" : "Submit for approval"}
      </Button>
    </div>
  );
}
