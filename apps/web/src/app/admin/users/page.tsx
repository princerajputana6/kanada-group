import Link from "next/link";
import { Badge, Button, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getAdminStats } from "@/lib/queries";
import { setUserBannedAction, setUserRoleAction } from "@/actions/admin-actions";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const currentUser = await requireRole(["ADMIN"]);
  const { users } = await getAdminStats();

  return (
    <div>
      <h1 className="text-3xl font-bold">All users</h1>
      <p className="mt-1 text-muted-foreground">Students, teachers and admins. Open a name for full details and account actions.</p>
      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentUser.id;
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/users/${user.id}`} className="hover:text-primary">
                      {user.name}
                    </Link>{" "}
                    {isSelf && <span className="text-muted-foreground">(you)</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <form
                      action={async (formData: FormData) => {
                        "use server";
                        await setUserRoleAction(
                          user.id,
                          formData.get("role") as "ADMIN" | "TEACHER" | "STUDENT",
                        );
                      }}
                      className="flex items-center gap-2"
                    >
                      <Select
                        name="role"
                        defaultValue={user.role}
                        disabled={isSelf}
                        className="h-8 w-32 text-xs"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="ADMIN">Admin</option>
                      </Select>
                      <Button type="submit" size="sm" variant="outline" disabled={isSelf}>
                        Save
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.banned ? "destructive" : "success"}>
                        {user.banned ? "Banned" : "Active"}
                      </Badge>
                      <form
                        action={async () => {
                          "use server";
                          await setUserBannedAction(user.id, !user.banned);
                        }}
                      >
                        <Button type="submit" size="sm" variant="ghost" disabled={isSelf}>
                          {user.banned ? "Unban" : "Ban"}
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
