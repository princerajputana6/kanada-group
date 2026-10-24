"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@kanada/ui";

/**
 * Section navigation for the student/admin areas. Phones get a single
 * horizontal, swipeable row of pills (the parent provides overflow-x-auto);
 * from `lg` up it becomes a vertical sidebar list.
 */
export function SidebarNav({
  items,
  layoutId,
}: {
  items: { href: string; label: string }[];
  layoutId: string;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex w-max gap-2 pb-1 text-sm lg:w-auto lg:flex-col lg:gap-1 lg:pb-0">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative block whitespace-nowrap rounded-full px-4 py-2 font-medium transition-colors lg:rounded-md lg:px-3",
              active ? "text-primary-foreground" : "bg-secondary/70 hover:bg-secondary lg:bg-transparent",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary lg:rounded-md"
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
