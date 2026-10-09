"use client";

import { useActionState } from "react";
import { BadgePercent, X } from "lucide-react";
import { Button, Input } from "@kanada/ui";
import { applyCouponAction, removeCouponAction, type CouponState } from "@/actions/enrollment-actions";

/** Apply / remove a coupon on the payment step. */
export function CouponBox({ enrollmentId, appliedCode }: { enrollmentId: string; appliedCode: string | null }) {
  const [state, action, pending] = useActionState<CouponState, FormData>(applyCouponAction.bind(null, enrollmentId), {});

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800">
          <BadgePercent className="h-4 w-4" aria-hidden="true" /> {appliedCode} applied
        </span>
        <form action={removeCouponAction.bind(null, enrollmentId)}>
          <button type="submit" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" aria-hidden="true" /> Remove
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-1.5">
      <label htmlFor={`coupon-${enrollmentId}`} className="text-xs font-medium text-muted-foreground">
        Have a coupon?
      </label>
      <div className="flex gap-2">
        <Input
          id={`coupon-${enrollmentId}`}
          name="code"
          placeholder="Enter code"
          autoComplete="off"
          maxLength={32}
          className="h-9 uppercase"
          required
        />
        <Button type="submit" size="sm" variant="outline" disabled={pending} className="h-9">
          {pending ? "Checking…" : "Apply"}
        </Button>
      </div>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
