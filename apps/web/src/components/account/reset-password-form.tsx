"use client";

import { useActionState } from "react";
import { Button, Input, Label } from "@kanada/ui";
import { resetPasswordAction } from "@/actions/account-actions";
import type { ActionState } from "@/actions/auth-actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    resetPasswordAction.bind(null, token),
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" autoFocus />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Reset password"}
      </Button>
    </form>
  );
}
