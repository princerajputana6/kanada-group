"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Input, Label } from "@kanada/ui";
import { signInAction } from "@/actions/auth-actions";
import type { ActionState } from "@/actions/auth-actions";

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signInAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
