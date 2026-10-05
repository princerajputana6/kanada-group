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
export function PaymentUpload({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await submitPaymentAction(enrollmentId, fd);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-medium hover:file:bg-secondary/70"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="button" className="w-full" disabled={!file || busy} onClick={submit}>
        {busy ? "Uploading…" : "Submit payment proof"}
      </Button>
    </div>
  );
}
