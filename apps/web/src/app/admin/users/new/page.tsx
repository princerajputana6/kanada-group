import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { AddUserForm } from "@/components/admin/add-user-form";

export default async function AdminNewUserPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { role } = await searchParams;
  const defaultRole =
    role === "TEACHER" || role === "ADMIN" ? role : "STUDENT";

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/admin/users" className="text-sm text-muted-foreground hover:text-foreground">
          ← All users
        </Link>
        <h1 className="mt-3 text-3xl font-bold">Add user</h1>
        <p className="mt-1 text-muted-foreground">
          Register a student, tutor or admin to manage the portal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New account</CardTitle>
        </CardHeader>
        <CardContent>
          <AddUserForm defaultRole={defaultRole} />
        </CardContent>
      </Card>
    </div>
  );
}
