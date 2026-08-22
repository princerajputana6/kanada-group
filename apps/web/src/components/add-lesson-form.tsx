"use client";

import { useActionState, useState } from "react";
import { Button, Input, Select, Textarea } from "@kanada/ui";
import { createLessonAction } from "@/actions/course-actions";
import type { ActionState } from "@/actions/auth-actions";

export function AddLessonForm({ sectionId }: { sectionId: string }) {
  const [type, setType] = useState<"VIDEO" | "TEXT">("VIDEO");
  const action = createLessonAction.bind(null, sectionId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="mt-2 space-y-2 rounded-md border border-dashed border-border p-3">
      <div className="flex gap-2">
        <Input name="title" placeholder="Lesson title" required className="h-8 text-sm" />
        <Select
          name="type"
          className="h-8 w-28 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as "VIDEO" | "TEXT")}
        >
          <option value="VIDEO">Video</option>
          <option value="TEXT">Text</option>
        </Select>
      </div>
      {type === "TEXT" && (
        <Textarea name="content" placeholder="Lesson content" rows={3} className="text-sm" />
      )}
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <input type="checkbox" name="isPreview" />
        Free preview (visible without enrolling)
      </label>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding…" : "Add lesson"}
      </Button>
    </form>
  );
}
