"use client";

import { useActionState } from "react";
import { Button, Input, Label } from "@kanada/ui";
import { changeOwnPasswordAction } from "@/actions/account-actions";
import type { ActionState } from "@/actions/auth-actions";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(changeOwnPasswordAction, {});

  return (
    <form action={action} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="current">Current password</Label>
        <Input id="current" name="current" type="password" required autoComplete="current-password" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="next">New password</Label>
        <Input id="next" name="next" type="password" required minLength={8} autoComplete="new-password" />
        <p className="text-xs text-muted-foreground">At least 8 characters (12 for admins). A password manager is ideal.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Change password"}
      </Button>
      <p className="text-xs text-muted-foreground">
        You&apos;ll be signed out everywhere and asked to sign in with the new password.
      </p>
    </form>
  );
}
