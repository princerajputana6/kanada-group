"use client";

import { useActionState, useState } from "react";
import { Button, Input, Label, Select } from "@kanada/ui";
import { adminCreateUserAction } from "@/actions/admin-actions";
import type { ActionState } from "@/actions/auth-actions";

type Role = "STUDENT" | "TEACHER" | "ADMIN";

export function AddUserForm({ defaultRole = "STUDENT" }: { defaultRole?: Role }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    adminCreateUserAction,
    {},
  );
  const [role, setRole] = useState<Role>(defaultRole);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="role">Role</Label>
        <Select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Tutor (Teacher)</option>
          <option value="ADMIN">Admin</option>
        </Select>
        <p className="text-xs text-muted-foreground">
          {role === "STUDENT"
            ? "A learner account. They can enroll and take courses."
            : role === "TEACHER"
              ? "A tutor account. They can create and manage their own courses."
              : "A full admin. They can manage users, payments and the whole portal."}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required autoComplete="off" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="off" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Temporary password</Label>
        <Input
          id="password"
          name="password"
          type="text"
          required
          minLength={8}
          autoComplete="off"
          placeholder="At least 8 characters"
        />
        <p className="text-xs text-muted-foreground">
          Share this with the user — they can change it after signing in.
        </p>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create user"}
      </Button>
    </form>
  );
}
