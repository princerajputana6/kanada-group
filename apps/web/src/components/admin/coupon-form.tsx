"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, Input, Label, Select } from "@kanada/ui";
import { createCouponAction, updateCouponAction } from "@/actions/coupon-actions";
import type { ActionState } from "@/actions/auth-actions";

export type CouponFormValues = {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  courseId: string | null;
  maxRedemptions: number | null;
  validFrom: string;
  validUntil: string;
  active: boolean;
};

export function CouponForm({
  courses,
  edit,
}: {
  courses: { id: string; title: string; price: number | null }[];
  edit?: CouponFormValues;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    edit ? updateCouponAction.bind(null, edit.id) : createCouponAction,
    {},
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.success && !edit) ref.current?.reset();
  }, [state, edit]);
  const p = edit ? `c-${edit.id}-` : "c-new-";

  return (
    <form ref={ref} action={action} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${p}code`}>Code</Label>
        <Input id={`${p}code`} name="code" required maxLength={32} defaultValue={edit?.code} placeholder="WELCOME20" className="uppercase" autoComplete="off" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${p}type`}>Discount type</Label>
        <Select id={`${p}type`} name="discountType" defaultValue={edit?.discountType ?? "PERCENT"}>
          <option value="PERCENT">Percentage (%)</option>
          <option value="FIXED">Flat amount (₹)</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${p}value`}>Discount value</Label>
        <Input id={`${p}value`} name="discountValue" type="number" min={1} required defaultValue={edit?.discountValue} placeholder="20" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${p}course`}>Applies to</Label>
        <Select id={`${p}course`} name="courseId" defaultValue={edit?.courseId ?? ""}>
          <option value="">All paid courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${p}max`}>Usage limit</Label>
        <Input id={`${p}max`} name="maxRedemptions" type="number" min={1} defaultValue={edit?.maxRedemptions ?? undefined} placeholder="Unlimited" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${p}desc`}>Internal note</Label>
        <Input id={`${p}desc`} name="description" maxLength={200} defaultValue={edit?.description ?? ""} placeholder="e.g. Diwali campaign" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${p}from`}>Valid from (optional)</Label>
        <Input id={`${p}from`} name="validFrom" type="date" defaultValue={edit?.validFrom} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${p}until`}>Valid until (optional)</Label>
        <Input id={`${p}until`} name="validUntil" type="date" defaultValue={edit?.validUntil} />
      </div>
      <div className="flex items-end gap-3">
        <label className="flex h-10 items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={edit?.active ?? true} /> Active
        </label>
        <Button type="submit" disabled={pending} className="ml-auto">
          {pending ? "Saving…" : edit ? "Save coupon" : "Create coupon"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive sm:col-span-2 lg:col-span-3">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-700 sm:col-span-2 lg:col-span-3">{edit ? "Coupon updated." : "Coupon created."}</p>}
    </form>
  );
}
