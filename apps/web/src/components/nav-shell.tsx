"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@kanada/ui";

/**
 * Client chrome for the navbar: transparent → frosted on scroll, the
 * entrance slide, and the mobile menu. Links/actions are rendered by the
 * server Navbar (session-aware) and passed in.
 */
export function NavShell({
  links,
  actions,
}: {
  links: React.ReactNode;
  actions: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled || open
          ? "border-white/[0.08] bg-[rgba(5,5,5,0.75)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5 font-display text-[17px] font-bold tracking-tight">
          <span
            aria-hidden="true"
            className="relative grid h-7 w-7 place-items-center rounded-lg bg-[linear-gradient(135deg,#7C3AED,#22D3EE)] shadow-[0_0_24px_-4px_rgba(139,92,246,0.8)]"
          >
            <span className="h-2.5 w-2.5 rounded-[3px] border border-white/90" />
          </span>
          <span>
            Kanada Group <span className="text-electric-lilac">LMS</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 text-sm font-medium md:flex">
          {links}
          <div className="flex items-center gap-3">{actions}</div>
        </nav>

        <button
          type="button"
          className="relative -mr-2 grid h-10 w-10 place-items-center rounded-full md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={cn("absolute h-px w-5 bg-white transition-transform duration-300", open ? "rotate-45" : "-translate-y-1.5")} />
          <span className={cn("absolute h-px w-5 bg-white transition-opacity duration-300", open && "opacity-0")} />
          <span className={cn("absolute h-px w-5 bg-white transition-transform duration-300", open ? "-rotate-45" : "translate-y-1.5")} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full overflow-hidden border-b border-white/[0.08] bg-[rgba(5,5,5,0.94)] backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-5 px-4 py-6 text-base font-medium sm:px-8 [&_a]:py-1">
              {links}
              <div className="flex flex-wrap items-center gap-3 pt-2">{actions}</div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
