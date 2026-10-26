"use client";

import { useActionState, useState } from "react";
import { Button, Input, Label, Select, Textarea } from "@kanada/ui";
import type { ActionState } from "@/actions/auth-actions";

export function CourseForm({
  action,
  defaultValues,
  submitLabel = "Save",
  hiddenFields,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    title?: string;
    description?: string;
    category?: string | null;
    level?: string;
    isFree?: boolean;
    price?: number | null;
    originalPrice?: number | null;
  };
  submitLabel?: string;
  hiddenFields?: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const [isFree, setIsFree] = useState<boolean>(defaultValues?.isFree ?? true);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
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
      <div className="space-y-3 rounded-xl border border-border p-4">
        <label className="flex items-center gap-2.5 text-sm font-medium">
          <input
            type="checkbox"
            name="isFree"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
          />
          This is a free course
        </label>
        {!isFree && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step={1}
                placeholder="4999"
                defaultValue={defaultValues?.price ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="originalPrice">Original price (₹, optional)</Label>
              <Input
                id="originalPrice"
                name="originalPrice"
                type="number"
                min={0}
                step={1}
                placeholder="9999"
                defaultValue={defaultValues?.originalPrice ?? ""}
              />
            </div>
            <p className="col-span-2 text-xs text-muted-foreground">
              Original price shows struck-through next to the price when it&apos;s higher.
            </p>
          </div>
        )}
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
