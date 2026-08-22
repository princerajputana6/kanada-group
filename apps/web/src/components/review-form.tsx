"use client";

import { useActionState } from "react";
import { Button, Select, Textarea } from "@kanada/ui";
import { createReviewAction } from "@/actions/review-actions";
import type { ActionState } from "@/actions/auth-actions";

export function ReviewForm({
  courseSlug,
  initial,
}: {
  courseSlug: string;
  initial?: { rating: number; comment: string | null };
}) {
  const action = createReviewAction.bind(null, courseSlug);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="mb-6 space-y-3 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">{initial ? "Update your review" : "Leave a review"}</p>
      <div className="flex items-center gap-3">
        <Select name="rating" defaultValue={String(initial?.rating ?? 5)} className="w-32">
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} ({n})
            </option>
          ))}
        </Select>
      </div>
      <Textarea
        name="comment"
        placeholder="Share your experience with this course…"
        defaultValue={initial?.comment ?? ""}
      />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Saving…" : "Submit review"}
      </Button>
    </form>
  );
}
