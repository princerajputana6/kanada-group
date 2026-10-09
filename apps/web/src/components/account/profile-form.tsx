"use client";

import { useActionState } from "react";
import { Button, Input, Label, Textarea } from "@kanada/ui";
import { updateProfileAction } from "@/actions/account-actions";
import type { ActionState } from "@/actions/auth-actions";

export function ProfileForm({ name, bio, email }: { name: string; bio: string | null; email: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProfileAction, {});

  return (
    <form action={action} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={name} required minLength={2} maxLength={100} autoComplete="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email-ro">Email</Label>
        <Input id="email-ro" value={email} disabled readOnly />
        <p className="text-xs text-muted-foreground">Contact an admin to change the email on your account.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={bio ?? ""} maxLength={1000} rows={4} placeholder="A line or two about you" />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-700">Profile saved.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
