"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Input, Label } from "@kanada/ui";
import { requestPasswordResetAction } from "@/actions/account-actions";
import type { ActionState } from "@/actions/auth-actions";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(requestPasswordResetAction, {});

  if (state.success) {
    return (
      <div className="space-y-4 text-sm">
        <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-3 text-emerald-800">
          If an account exists for that email, we&apos;ve sent a link to reset your password. It
          expires in 60 minutes.
        </p>
        <p className="text-muted-foreground">
          Don&apos;t see it? Check your spam folder, or{" "}
          <button type="button" onClick={() => location.reload()} className="font-medium text-primary hover:underline">
            try again
          </button>
          .
        </p>
        <Link href="/sign-in" className="block font-medium text-primary hover:underline">
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Registered email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" autoFocus />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
