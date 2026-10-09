"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, Textarea } from "@kanada/ui";
import { replyTicketAction } from "@/actions/support-actions";
import type { ActionState } from "@/actions/auth-actions";

export function ReplyForm({ ticketId, placeholder, label = "Send reply" }: { ticketId: string; placeholder?: string; label?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(replyTicketAction.bind(null, ticketId), {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.success) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <label htmlFor={`reply-${ticketId}`} className="sr-only">Reply</label>
      <Textarea id={`reply-${ticketId}`} name="body" required minLength={5} maxLength={5000} rows={4} placeholder={placeholder ?? "Write a reply…"} />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Sending…" : label}</Button>
    </form>
  );
}
