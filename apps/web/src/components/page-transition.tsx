"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/**
 * Enter-only fade, keyed by pathname — deliberately not AnimatePresence.
 * AnimatePresence needs the outgoing tree to stay mounted mid-exit, which
 * fights with Next's Server Component streaming/Suspense boundaries here:
 * on some navigations the incoming content got stuck at the initial
 * opacity: 0 (present in the DOM, invisible on screen). A plain keyed
 * remount with only an enter animation has no such coordination to get
 * stuck on.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
