import type { Metadata } from "next";
import { AuthCard } from "@/components/account/auth-card";
import { ForgotPasswordForm } from "@/components/account/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password | Kanada Group" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter the email you registered with and we'll send you a link to choose a new one."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
