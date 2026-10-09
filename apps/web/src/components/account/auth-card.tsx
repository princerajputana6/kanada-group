import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@kanada/ui";
import { GradientOrb } from "@/components/ui/GradientOrb";

/** Centered card shell shared by the sign-in / password-recovery pages. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-16">
      <GradientOrb color="purple" className="left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2" />
      <Card className="relative w-full animate-fade-scale-in p-2">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
