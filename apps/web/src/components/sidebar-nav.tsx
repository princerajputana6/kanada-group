"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@kanada/ui";

export function SidebarNav({
  items,
  layoutId,
}: {
  items: { href: string; label: string }[];
  layoutId: string;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 text-sm">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative block rounded-md px-3 py-2 font-medium transition-colors",
              active ? "text-primary-foreground" : "hover:bg-secondary",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-md bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
