"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  Badge,
  Button,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kanada/ui";
import {
  deleteUserAction,
  setUserBannedAction,
  setUserRoleAction,
} from "@/actions/admin-actions";
import { ResetPassword } from "@/components/admin/reset-password";
import { formatDate } from "@/lib/utils";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  banned: boolean;
  createdAt: Date;
}

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"ALL" | Role>("ALL");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "BANNED">("ALL");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "ALL" && u.role !== role) return false;
      if (status === "ACTIVE" && u.banned) return false;
      if (status === "BANNED" && !u.banned) return false;
      if (term && !`${u.name} ${u.email}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [users, q, role, status]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          placeholder="Search name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
          aria-label="Search users"
        />
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value as "ALL" | Role)}
          className="h-10 sm:w-40"
          aria-label="Filter by role"
        >
          <option value="ALL">All roles</option>
          <option value="STUDENT">Students</option>
          <option value="TEACHER">Teachers</option>
          <option value="ADMIN">Admins</option>
        </Select>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as "ALL" | "ACTIVE" | "BANNED")}
          className="h-10 sm:w-40"
          aria-label="Filter by status"
        >
          <option value="ALL">Any status</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
        </Select>
        <span className="text-sm text-muted-foreground sm:ml-auto">
          {filtered.length} of {users.length}
        </span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} />
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No users match these filters.
          </p>
        )}
      </div>
    </div>
  );
}

function UserRow({ user, isSelf }: { user: AdminUserRow; isSelf: boolean }) {
  const [pending, start] = useTransition();
  const [role, setRole] = useState<Role>(user.role);

  function onDelete() {
    if (
      !window.confirm(
        `Permanently delete ${user.name} (${user.email})? This removes their enrollments, progress and support history and can't be undone.`,
      )
    ) {
      return;
    }
    start(async () => {
      try {
        await deleteUserAction(user.id);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Could not delete this user.");
      }
    });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link href={`/admin/users/${user.id}`} className="hover:text-primary">
          {user.name}
        </Link>{" "}
        {isSelf && <span className="text-muted-foreground">(you)</span>}
      </TableCell>
      <TableCell className="text-muted-foreground">{user.email}</TableCell>
      <TableCell>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            start(() => setUserRoleAction(user.id, role));
          }}
        >
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            disabled={isSelf || pending}
            className="h-8 w-28 text-xs"
            aria-label={`Role for ${user.name}`}
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </Select>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={isSelf || pending || role === user.role}
          >
            Save
          </Button>
        </form>
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant={user.banned ? "destructive" : "success"}>
            {user.banned ? "Banned" : "Active"}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            disabled={isSelf || pending}
            onClick={() => start(() => setUserBannedAction(user.id, !user.banned))}
          >
            {user.banned ? "Unban" : "Ban"}
          </Button>
        </div>
      </TableCell>
      <TableCell>
        {isSelf ? (
          <span className="block text-right text-xs text-muted-foreground">—</span>
        ) : (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ResetPassword userId={user.id} userName={user.name} />
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              disabled={pending}
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
