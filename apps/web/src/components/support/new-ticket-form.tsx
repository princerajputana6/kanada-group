"use client";

import { useActionState } from "react";
import { Button, Input, Label, Select, Textarea } from "@kanada/ui";
import { createTicketAction } from "@/actions/support-actions";
import type { ActionState } from "@/actions/auth-actions";
import { CATEGORY_LABEL, PRIORITY_LABEL } from "@/lib/support";

export function NewTicketForm({ courses }: { courses: { id: string; title: string }[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createTicketAction, {});
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="t-subject">Subject</Label>
        <Input id="t-subject" name="subject" required minLength={4} maxLength={150} placeholder="e.g. Payment approved but course still locked" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="t-category">Category</Label>
        <Select id="t-category" name="category" defaultValue="GENERAL">
          {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="t-priority">Priority</Label>
        <Select id="t-priority" name="priority" defaultValue="NORMAL">
          {Object.entries(PRIORITY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </div>
      {courses.length > 0 && (
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="t-course">Related course (optional)</Label>
          <Select id="t-course" name="courseId" defaultValue="">
            <option value="">Not about a specific course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </Select>
        </div>
      )}
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="t-body">Describe the problem</Label>
        <Textarea id="t-body" name="body" required minLength={5} maxLength={5000} rows={7} placeholder="What happened, what you expected, and any steps to reproduce it." />
      </div>
      {state.error && <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit ticket"}</Button>
      </div>
    </form>
  );
}
