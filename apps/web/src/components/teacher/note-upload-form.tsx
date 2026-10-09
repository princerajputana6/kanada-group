"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button, Input, Label, Select, Textarea } from "@kanada/ui";
import { uploadNoteAction } from "@/actions/teacher-actions";
import type { ActionState } from "@/actions/auth-actions";

const ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.odp,.txt";
const MAX_MB = 20;

export function NoteUploadForm({
  courses,
  defaultCourseId,
}: {
  courses: { id: string; title: string; sections: { id: string; title: string }[] }[];
  defaultCourseId?: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(uploadNoteAction, {});
  const [courseId, setCourseId] = useState(defaultCourseId ?? courses[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sections = courses.find((c) => c.id === courseId)?.sections ?? [];

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setFile(null);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        if (file && file.size > MAX_MB * 1024 * 1024) {
          e.preventDefault();
          setClientError(`Files must be ${MAX_MB} MB or smaller.`);
        }
      }}
    >
      {defaultCourseId ? (
        <input type="hidden" name="courseId" value={defaultCourseId} />
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="note-course">Course</Label>
          <Select id="note-course" name="courseId" required value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="note-section">Section (optional)</Label>
        <Select id="note-section" name="sectionId" defaultValue="" key={courseId}>
          <option value="">Whole course</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </Select>
      </div>

      <label
        htmlFor="note-file"
        className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/[0.03] sm:col-span-2"
      >
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <UploadCloud className="h-5 w-5" aria-hidden="true" />
        </span>
        {file ? (
          <span className="text-sm font-medium">
            {file.name} <span className="text-muted-foreground">· {(file.size / 1024 / 1024).toFixed(1)} MB</span>
          </span>
        ) : (
          <>
            <span className="text-sm font-medium">Choose a file to upload</span>
            <span className="text-xs text-muted-foreground">PDF, Word, PowerPoint, Excel or text · up to {MAX_MB} MB</span>
          </>
        )}
        <input
          id="note-file"
          name="file"
          type="file"
          required
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            setClientError(null);
            setFile(e.currentTarget.files?.[0] ?? null);
          }}
        />
      </label>

      <div className="space-y-1.5">
        <Label htmlFor="note-title">Title (optional)</Label>
        <Input id="note-title" name="title" maxLength={150} placeholder="Defaults to the file name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note-desc">Description (optional)</Label>
        <Textarea id="note-desc" name="description" rows={1} maxLength={1000} placeholder="e.g. Slides from week 3" />
      </div>

      <div className="flex items-center gap-3 sm:col-span-2">
        {(clientError || state.error) && <p className="text-sm text-destructive">{clientError ?? state.error}</p>}
        {state.success && !pending && <p className="text-sm text-emerald-700">Uploaded — students with access can download it now.</p>}
        <Button type="submit" disabled={pending} className="ml-auto">
          {pending ? "Uploading…" : "Upload notes"}
        </Button>
      </div>
    </form>
  );
}
