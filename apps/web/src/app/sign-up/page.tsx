import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@kanada/ui";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="relative mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-16">
      <GradientOrb color="purple" className="left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2" />
      <Card className="relative w-full animate-fade-scale-in p-2">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
