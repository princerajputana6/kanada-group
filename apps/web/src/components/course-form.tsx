"use client";

import { useActionState } from "react";
import { Button, Input, Label, Select, Textarea } from "@kanada/ui";
import type { ActionState } from "@/actions/auth-actions";

export function CourseForm({
  action,
  defaultValues,
  submitLabel = "Save",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    title?: string;
    description?: string;
    category?: string | null;
    level?: string;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Course title</Label>
        <Input id="title" name="title" required defaultValue={defaultValues?.title} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={defaultValues?.description}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            placeholder="VLSI Design"
            defaultValue={defaultValues?.category ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="level">Level</Label>
          <Select id="level" name="level" defaultValue={defaultValues?.level ?? "BEGINNER"}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </Select>
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
