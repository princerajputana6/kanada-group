import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants, cn } from "@kanada/ui";
import { AuthCard } from "@/components/account/auth-card";
import { ResetPasswordForm } from "@/components/account/reset-password-form";
import { findValidResetToken } from "@/lib/password-reset";

export const metadata: Metadata = {
  title: "Reset password | Kanada Group",
  // The token is in the URL — don't leak it to other sites via Referer.
  referrer: "no-referrer",
  robots: { index: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const valid = await findValidResetToken(token);

  if (!token || !valid) {
    return (
      <AuthCard title="Link expired" subtitle="This password-reset link is invalid, expired or was already used.">
        <Link href="/forgot-password" className={cn(buttonVariants(), "w-full")}>
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" subtitle="You'll be signed out on all devices and can sign in with it right away.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
