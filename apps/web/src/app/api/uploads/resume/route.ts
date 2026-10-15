import { NextResponse } from "next/server";
import { resumeKeyFor } from "@kanada/storage";
import { putObject } from "@/lib/storage";

const MAX_RESUME_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Registration resume upload (PDF → R2). A plain route rather than a server
 * action on purpose: server-action IDs change with every deploy, so a
 * registration page left open across a deploy (common on phones that
 * restore tabs) failed with "An unexpected response was received from the
 * server". This URL is stable across deploys.
 *
 * Unauthenticated by necessity (the account doesn't exist yet): PDFs only,
 * verified by their %PDF signature (phone pickers often send no MIME type),
 * ≤10 MB, stored under a random server-generated key.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload failed — please try again." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose your resume PDF." }, { status: 400 });
  }
  if (file.size > MAX_RESUME_BYTES) {
    return NextResponse.json({ error: "Resume must be 10 MB or smaller." }, { status: 413 });
  }
  const bytes = await file.arrayBuffer();
  const sig = new TextDecoder().decode(new Uint8Array(bytes, 0, Math.min(1024, bytes.byteLength)));
  if (!sig.includes("%PDF-")) {
    return NextResponse.json({ error: "Resume must be a PDF file." }, { status: 415 });
  }

  const key = resumeKeyFor(crypto.randomUUID(), "resume.pdf");
  await putObject(key, bytes, "application/pdf");
  return NextResponse.json({ key }, { headers: { "Cache-Control": "no-store" } });
}
