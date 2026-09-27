import { Card, CardContent, CardHeader, CardTitle } from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default async function AdminAccountPage() {
  const admin = await requireRole(["ADMIN"]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My account</h1>
        <p className="mt-1 text-muted-foreground">
          Signed in as {admin.name} ({admin.email})
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
