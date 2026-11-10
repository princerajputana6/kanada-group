import Link from "next/link";
import { buttonVariants, cn } from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getAdminStats } from "@/lib/queries";
import { UsersTable, type AdminUserRow } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const currentUser = await requireRole(["ADMIN"]);
  const { users } = await getAdminStats();

  const rows: AdminUserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    banned: u.banned,
    createdAt: u.createdAt,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All users</h1>
          <p className="mt-1 text-muted-foreground">
            Students, teachers and admins. Filter the list, or open a name for full details and
            account actions.
          </p>
        </div>
        <Link href="/admin/users/new" className={cn(buttonVariants({ size: "sm" }))}>
          + Add user
        </Link>
      </div>
      <div className="mt-6">
        <UsersTable users={rows} currentUserId={currentUser.id} />
      </div>
    </div>
  );
}
