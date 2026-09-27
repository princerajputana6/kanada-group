"use client";

import { useActionState } from "react";
import { Button, Select } from "@kanada/ui";
import { adminEnrollAction } from "@/actions/admin-actions";
import type { ActionState } from "@/actions/auth-actions";

export function EnrollForm({
  userId,
  courses,
}: {
  userId: string;
  courses: { id: string; title: string; published: boolean }[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    adminEnrollAction.bind(null, userId),
    {},
  );

  if (courses.length === 0) {
    return <p className="text-sm text-muted-foreground">Enrolled in every course.</p>;
  }

  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label htmlFor="enroll-course" className="sr-only">
        Course
      </label>
      <Select id="enroll-course" name="courseId" required defaultValue="" className="sm:max-w-sm">
        <option value="" disabled>
          Choose a course…
        </option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
            {c.published ? "" : " (unpublished)"}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Enrolling…" : "Enroll"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-700">Enrolled.</p>}
    </form>
  );
}
