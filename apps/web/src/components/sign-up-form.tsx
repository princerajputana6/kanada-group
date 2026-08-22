"use client";

import { useActionState, useState } from "react";
import { Button, Input, Label, cn } from "@kanada/ui";
import { signUpAction } from "@/actions/auth-actions";
import type { ActionState } from "@/actions/auth-actions";

export function SignUpForm() {
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signUpAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label>I am a…</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["STUDENT", "TEACHER"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                role === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input hover:bg-secondary",
              )}
            >
              {r === "STUDENT" ? "Student" : "Teacher"}
            </button>
          ))}
        </div>
        <input type="hidden" name="role" value={role} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
