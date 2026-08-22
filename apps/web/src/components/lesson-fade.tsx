"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function LessonFade({ lessonKey, children }: { lessonKey: string; children: ReactNode }) {
  return (
    <motion.div
      key={lessonKey}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
