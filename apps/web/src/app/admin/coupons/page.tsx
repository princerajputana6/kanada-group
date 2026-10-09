import { inArray } from "drizzle-orm";
import { BadgePercent } from "lucide-react";
import { enrollments } from "@kanada/db";
import { Badge, buttonVariants, cn } from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getDb } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { toIstLocalInput } from "@/lib/time";
import { deleteCouponAction, toggleCouponAction } from "@/actions/coupon-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { CouponForm } from "@/components/admin/coupon-form";
import { EmptyState, PageHeader, Panel } from "@/components/teacher/ui";

function couponStatus(c: { active: boolean; validFrom: Date | null; validUntil: Date | null; maxRedemptions: number | null }, used: number) {
  const now = Date.now();
  if (!c.active) return { label: "Paused", variant: "outline" as const };
  if (c.validUntil && now > c.validUntil.getTime()) return { label: "Expired", variant: "destructive" as const };
  if (c.validFrom && now < c.validFrom.getTime()) return { label: "Scheduled", variant: "secondary" as const };
  if (c.maxRedemptions != null && used >= c.maxRedemptions) return { label: "Used up", variant: "destructive" as const };
  return { label: "Active", variant: "success" as const };
}

const day = (d: Date | null) => (d ? toIstLocalInput(d).slice(0, 10) : "");

export default async function AdminCouponsPage() {
  await requireRole(["ADMIN"]);
  const db = await getDb();
  const [all, paidCourses, usage] = await Promise.all([
    db.query.coupons.findMany({
      with: { course: { columns: { title: true } } },
      orderBy: (c, { desc }) => [desc(c.createdAt)],
    }),
    db.query.courses.findMany({
      where: (c, { eq }) => eq(c.isFree, false),
      columns: { id: true, title: true, price: true },
      orderBy: (c, { asc }) => [asc(c.title)],
    }),
    db.query.enrollments.findMany({
      where: inArray(enrollments.paymentStatus, ["SUBMITTED", "PAID"]),
      columns: { couponId: true, discount: true },
    }),
  ]);
  const used = new Map<string, { n: number; saved: number }>();
  for (const e of usage) {
    if (!e.couponId) continue;
    const u = used.get(e.couponId) ?? { n: 0, saved: 0 };
    u.n++;
    u.saved += e.discount ?? 0;
    used.set(e.couponId, u);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Coupons"
        description="Discount codes students can apply at the payment step. The QR step then shows the final price; payments still go through your approval queue."
      />

      <Panel title="Create a coupon">
        {paidCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Coupons apply to paid courses — there are none yet.</p>
        ) : (
          <CouponForm courses={paidCourses} />
        )}
      </Panel>

      <Panel title={`All coupons (${all.length})`}>
        {all.length === 0 ? (
          <EmptyState icon={BadgePercent} title="No coupons yet" />
        ) : (
          <ul className="space-y-3">
            {all.map((c) => {
              const u = used.get(c.id) ?? { n: 0, saved: 0 };
              const st = couponStatus(c, u.n);
              return (
                <li key={c.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="rounded-lg bg-primary/10 px-2 py-0.5 font-mono text-sm font-semibold text-primary">{c.code}</code>
                        <Badge variant={st.variant}>{st.label}</Badge>
                        <span className="font-medium">
                          {c.discountType === "PERCENT" ? `${c.discountValue}% off` : `${formatPrice(c.discountValue)} off`}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[
                          c.course?.title ?? "All paid courses",
                          `${u.n}${c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ""} used`,
                          u.saved > 0 && `${formatPrice(u.saved)} discounted`,
                          (c.validFrom || c.validUntil) &&
                            `${c.validFrom ? `from ${day(c.validFrom)}` : ""}${c.validFrom && c.validUntil ? " " : ""}${c.validUntil ? `until ${day(c.validUntil)}` : ""}`,
                          c.description,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <details>
                        <summary className={cn(buttonVariants({ size: "sm", variant: "outline" }), "cursor-pointer list-none")}>Edit</summary>
                        <div className="mt-3 w-full rounded-2xl border border-border bg-background p-4 lg:min-w-[44rem]">
                          <CouponForm
                            courses={paidCourses}
                            edit={{
                              id: c.id,
                              code: c.code,
                              description: c.description,
                              discountType: c.discountType,
                              discountValue: c.discountValue,
                              courseId: c.courseId,
                              maxRedemptions: c.maxRedemptions,
                              validFrom: day(c.validFrom),
                              validUntil: day(c.validUntil),
                              active: c.active,
                            }}
                          />
                        </div>
                      </details>
                      <form action={toggleCouponAction.bind(null, c.id)}>
                        <button type="submit" className={buttonVariants({ size: "sm", variant: "ghost" })}>
                          {c.active ? "Pause" : "Activate"}
                        </button>
                      </form>
                      <form action={deleteCouponAction.bind(null, c.id)}>
                        <ConfirmSubmitButton size="sm" variant="ghost" className="text-destructive" confirmText={`Delete coupon ${c.code}? Enrollments that used it keep their discount.`}>
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
