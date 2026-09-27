import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@kanada/ui";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { SignInForm } from "@/components/sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; passwordChanged?: string }>;
}) {
  const { callbackUrl, passwordChanged } = await searchParams;

  return (
    <div className="relative mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-16">
      <GradientOrb color="purple" className="left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2" />
      <Card className="relative w-full animate-fade-scale-in p-2">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          {passwordChanged && (
            <p className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
              Password changed. Sign in with your new password.
            </p>
          )}
          <SignInForm callbackUrl={callbackUrl} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
