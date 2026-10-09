"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, Input, Label, Select, Textarea } from "@kanada/ui";
import { scheduleLiveClassAction, updateLiveClassAction } from "@/actions/teacher-actions";
import type { ActionState } from "@/actions/auth-actions";

const DURATIONS = [30, 45, 60, 90, 120, 180];

export function ScheduleClassForm({
  courses,
  defaultCourseId,
  edit,
}: {
  courses: { id: string; title: string }[];
  defaultCourseId?: string;
  edit?: {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    startsAtLocal: string;
    durationMinutes: number;
    meetingUrl: string;
  };
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    edit ? updateLiveClassAction.bind(null, edit.id) : scheduleLiveClassAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.success && !edit) formRef.current?.reset();
  }, [state, edit]);

  const durations = edit && !DURATIONS.includes(edit.durationMinutes) ? [...DURATIONS, edit.durationMinutes] : DURATIONS;
  const idp = edit ? `edit-${edit.id}-` : "new-";

  return (
    <form ref={formRef} action={action} className="grid gap-4 sm:grid-cols-2">
      {edit ? (
        <input type="hidden" name="courseId" value={edit.courseId} />
      ) : (
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idp}course`}>Course</Label>
          <Select id={`${idp}course`} name="courseId" required defaultValue={defaultCourseId ?? ""}>
            <option value="" disabled>
              Choose a course…
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${idp}title`}>Class title</Label>
        <Input id={`${idp}title`} name="title" required minLength={3} maxLength={150} defaultValue={edit?.title} placeholder="e.g. CMOS inverter — live Q&A" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idp}startsAt`}>Date &amp; time (IST)</Label>
        <Input id={`${idp}startsAt`} name="startsAt" type="datetime-local" required defaultValue={edit?.startsAtLocal} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idp}duration`}>Duration</Label>
        <Select id={`${idp}duration`} name="durationMinutes" defaultValue={String(edit?.durationMinutes ?? 60)}>
          {durations.map((d) => (
            <option key={d} value={d}>
              {d >= 60 ? `${d / 60} hour${d === 60 ? "" : "s"}` : `${d} minutes`}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${idp}url`}>Meeting link</Label>
        <Input id={`${idp}url`} name="meetingUrl" type="url" required defaultValue={edit?.meetingUrl} placeholder="https://meet.google.com/… or https://zoom.us/j/…" />
        <p className="text-xs text-muted-foreground">Only students with access see a Join button — the link itself stays hidden until 15 minutes before class.</p>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${idp}desc`}>Agenda (optional)</Label>
        <Textarea id={`${idp}desc`} name="description" rows={3} maxLength={2000} defaultValue={edit?.description ?? ""} placeholder="What you'll cover, what to prepare…" />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        {!edit && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name="notify" value="on" defaultChecked />
            Email students with access
          </label>
        )}
        <Button type="submit" disabled={pending} className="ml-auto">
          {pending ? "Saving…" : edit ? "Save changes" : "Schedule class"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-700 sm:col-span-2">
          {edit ? "Class updated." : "Class scheduled — it now shows on students' dashboards."}
        </p>
      )}
    </form>
  );
}
