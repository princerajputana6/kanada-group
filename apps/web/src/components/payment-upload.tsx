"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@kanada/ui";
import { requestPaymentUploadUrlAction } from "@/actions/upload-actions";
import { submitPaymentAction } from "@/actions/enrollment-actions";

const MAX_BYTES = 10 * 1024 * 1024;

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

/**
 * After scanning the QR and paying, the student uploads a screenshot. On a
 * successful R2 upload the enrollment is marked SUBMITTED for admin review.
 */
export function PaymentUpload({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pct, setPct] = useState<number | null>(null);
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
    setPct(0);
    try {
      const { url, key } = await requestPaymentUploadUrlAction(
        enrollmentId,
        file.name,
        file.type,
      );
      await uploadWithProgress(url, file, setPct);
      await submitPaymentAction(enrollmentId, key);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPct(null);
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
      {pct !== null && <p className="text-xs text-muted-foreground">Uploading… {pct}%</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        type="button"
        className="w-full"
        disabled={!file || pct !== null}
        onClick={submit}
      >
        {pct !== null ? "Uploading…" : "Submit payment proof"}
      </Button>
    </div>
  );
}
