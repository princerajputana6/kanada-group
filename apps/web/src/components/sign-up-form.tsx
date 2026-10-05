"use client";

import { useActionState, useRef, useState, type ChangeEvent } from "react";
import { Button, Input, Label, Select, Textarea } from "@kanada/ui";
import { signUpAction, type ActionState } from "@/actions/auth-actions";
import { requestResumeUploadUrlAction } from "@/actions/upload-actions";

const MAX_RESUME_BYTES = 10 * 1024 * 1024; // 10 MB

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

/** A field whose value is a fixed list plus a free-text "Other". */
function OptionWithOther({
  name,
  label,
  options,
  required,
}: {
  name: string;
  label: string;
  options: string[];
  required?: boolean;
}) {
  const [choice, setChoice] = useState(options[0]);
  const [other, setOther] = useState("");
  const isOther = choice === "Other";
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Select
        id={name}
        value={choice}
        onChange={(e) => setChoice(e.target.value)}
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value="Other">Other</option>
      </Select>
      {isOther && (
        <Input
          placeholder={`Enter your ${label.toLowerCase()}`}
          value={other}
          onChange={(e) => setOther(e.target.value)}
          aria-label={`${label} (other)`}
        />
      )}
      {/* The resolved value sent to the server. */}
      <input type="hidden" name={name} value={isOther ? other : choice} />
    </div>
  );
}

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signUpAction,
    {},
  );

  const [resumeKey, setResumeKey] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleResume(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeError(null);
    setResumeKey("");
    if (file.type !== "application/pdf") {
      setResumeError("Resume must be a PDF file.");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError("Resume must be 10 MB or smaller.");
      return;
    }
    setUploadPct(0);
    try {
      const { url, key } = await requestResumeUploadUrlAction(file.name, file.type);
      await uploadWithProgress(url, file, setUploadPct);
      setResumeKey(key);
      setResumeName(file.name);
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadPct(null);
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">
            Password <span className="text-destructive">*</span>
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="whatsapp">
          WhatsApp Number <span className="text-destructive">*</span>
        </Label>
        <Input id="whatsapp" name="whatsapp" type="tel" required placeholder="+91…" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <OptionWithOther
          name="qualification"
          label="Course Completed/Enrolled"
          options={["B.Tech/B.E.", "M.Tech/M.S."]}
          required
        />
        <div className="space-y-1.5">
          <Label htmlFor="branch">
            Branch <span className="text-destructive">*</span>
          </Label>
          <Input id="branch" name="branch" required placeholder="e.g. ECE, EEE" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="completionYear">
            Course Completion Year <span className="text-destructive">*</span>
          </Label>
          <Input
            id="completionYear"
            name="completionYear"
            required
            placeholder="e.g. 2025"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="affiliation">
            Current Affiliation (Company/College) <span className="text-destructive">*</span>
          </Label>
          <Input id="affiliation" name="affiliation" required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="workExperience">
          Prior Work Experience <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="workExperience"
          name="workExperience"
          required
          placeholder="Describe your experience, or write NA"
          className="min-h-20"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="priorTools">
          Prior Tools Used <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="priorTools"
          name="priorTools"
          required
          placeholder="e.g. Cadence Virtuoso, Synopsys VCS… or write NA"
          className="min-h-20"
        />
      </div>

      <OptionWithOther
        name="interestField"
        label="Interested Field in VLSI"
        options={["Analog", "Digital"]}
        required
      />

      {/* Resume (PDF) upload → R2 before the form is submitted. */}
      <div className="space-y-1.5">
        <Label htmlFor="resume">
          Resume (PDF, max 10 MB) <span className="text-destructive">*</span>
        </Label>
        <input
          id="resume"
          ref={fileRef}
          type="file"
          accept="application/pdf"
          onChange={handleResume}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-secondary/70"
        />
        {uploadPct !== null && (
          <p className="text-xs text-muted-foreground">Uploading… {uploadPct}%</p>
        )}
        {resumeKey && (
          <p className="text-xs text-primary">✓ {resumeName} uploaded</p>
        )}
        {resumeError && <p className="text-xs text-destructive">{resumeError}</p>}
        <input type="hidden" name="resumeKey" value={resumeKey} />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button
        type="submit"
        className="w-full"
        disabled={pending || uploadPct !== null || !resumeKey}
      >
        {pending ? "Registering…" : "Register Yourself"}
      </Button>
    </form>
  );
}
