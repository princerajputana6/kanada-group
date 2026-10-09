import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { users } from "@kanada/db";
import { Card, CardContent, CardHeader, CardTitle } from "@kanada/ui";
import { requireUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { ProfileForm } from "@/components/account/profile-form";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export const metadata: Metadata = { title: "My account | Kanada Group" };

export default async function AccountPage() {
  const me = await requireUser();
  const db = await getDb();
  const row = await db.query.users.findFirst({
    where: eq(users.id, me.id),
    columns: { name: true, email: true, bio: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-8">
      <div>
        <p className="eyebrow mb-4">Account</p>
        <h1 className="text-3xl font-bold">My account</h1>
        <p className="mt-1 text-muted-foreground">Your profile and sign-in settings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm name={row?.name ?? me.name ?? ""} email={row?.email ?? me.email ?? ""} bio={row?.bio ?? null} />
        </CardContent>
      </Card>
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
