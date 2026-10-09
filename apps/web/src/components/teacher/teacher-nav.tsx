"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  FileText,
  LayoutDashboard,
  Plus,
  Radio,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@kanada/ui";

type Item = { href: string; label: string; icon: LucideIcon; badge?: number };

export function TeacherNav({
  name,
  upcomingClasses,
  pendingPayments,
}: {
  name: string;
  upcomingClasses: number;
  pendingPayments: number;
}) {
  const pathname = usePathname();
  const groups: { title: string; items: Item[] }[] = [
    {
      title: "Teach",
      items: [
        { href: "/teacher/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/teacher/courses", label: "My courses", icon: BookOpen },
        { href: "/teacher/live", label: "Live classes", icon: Radio, badge: upcomingClasses },
        { href: "/teacher/notes", label: "Notes & materials", icon: FileText },
      ],
    },
    {
      title: "Learners",
      items: [
        { href: "/teacher/students", label: "Students", icon: Users, badge: pendingPayments },
        { href: "/teacher/analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
    { title: "Settings", items: [{ href: "/account", label: "Account", icon: Settings }] },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-[var(--glass-shadow)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-electric-cyan font-display text-sm font-bold text-white">
              {initials || "T"}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{name}</p>
              <p className="text-xs text-muted-foreground">Instructor</p>
            </div>
          </div>
          <Link
            href="/teacher/courses/new"
            className="mt-4 flex h-10 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> New course
          </Link>
        </div>

        <nav aria-label="Teacher" className="mt-6 space-y-6">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {g.title}
              </p>
              <ul className="space-y-1">
                {g.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          active ? "text-primary-foreground" : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="teacher-nav-active"
                            className="absolute inset-0 rounded-xl bg-primary shadow-[0_8px_24px_-12px_hsl(var(--primary))]"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        <Icon className="relative h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="relative flex-1">{item.label}</span>
                        {!!item.badge && (
                          <span
                            className={cn(
                              "relative min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold tabular-nums",
                              active ? "bg-white/25 text-white" : "bg-primary/10 text-primary",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile: horizontal tab bar */}
      <nav aria-label="Teacher" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-2 pb-1">
          {groups.flatMap((g) => g.items).map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                  {!!item.badge && <span className="tabular-nums">· {item.badge}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
