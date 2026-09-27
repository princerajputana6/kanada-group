"use client";

import { useActionState, useState } from "react";
import { Button } from "@kanada/ui";
import { resetUserPasswordAction, type ResetPasswordState } from "@/actions/admin-actions";

/**
 * Generates a temporary password for the user and shows it exactly once.
 * The user's existing sessions end immediately.
 */
export function ResetPassword({ userId, userName }: { userId: string; userName: string }) {
  const [state, action, pending] = useActionState<ResetPasswordState>(
    resetUserPasswordAction.bind(null, userId),
    {},
  );
  const [copied, setCopied] = useState(false);

  if (state.password) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        <p className="font-medium text-foreground">Temporary password for {userName}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <code className="select-all rounded-lg bg-card px-3 py-2 font-mono text-base tracking-wider text-foreground ring-1 ring-border">
            {state.password}
          </code>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(state.password!).then(() => setCopied(true), () => {});
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="mt-3 text-muted-foreground">
          Shown only once — share it privately with the student. Their other sessions have been
          signed out.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Reset ${userName}'s password? Their current password will stop working.`)) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Resetting…" : "Reset password"}
      </Button>
      {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
