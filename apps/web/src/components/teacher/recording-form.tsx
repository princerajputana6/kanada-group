"use client";

import { useActionState } from "react";
import { Button, Input } from "@kanada/ui";
import { setRecordingUrlAction } from "@/actions/teacher-actions";
import type { ActionState } from "@/actions/auth-actions";

export function RecordingForm({ classId, recordingUrl }: { classId: string; recordingUrl: string | null }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(setRecordingUrlAction.bind(null, classId), {});
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label htmlFor={`rec-${classId}`} className="sr-only">
        Recording link
      </label>
      <Input id={`rec-${classId}`} name="recordingUrl" type="url" defaultValue={recordingUrl ?? ""} placeholder="Recording link (Drive, YouTube unlisted…)" className="h-9 text-sm" />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Saving…" : recordingUrl ? "Update" : "Add recording"}
      </Button>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
