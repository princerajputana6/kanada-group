import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@kanada/ui";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="relative mx-auto flex min-h-[75vh] max-w-2xl items-center px-4 py-16">
      <GradientOrb color="cyan" className="left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2" />
      <Card className="relative w-full animate-fade-scale-in p-2">
        <CardHeader>
          <p className="eyebrow mb-2">VLSI Training Program</p>
          <CardTitle className="text-2xl">Register Yourself</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the Kanada Group VLSI Training Program. We bridge the gap between
            academia and the semiconductor industry with hands-on, tool-based training.
            Start with the free 8-week Foundations program right away.
          </p>
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
