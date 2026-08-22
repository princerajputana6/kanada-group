"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants, cn } from "@kanada/ui";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Hero() {
  return (
    <section className="overflow-hidden border-b border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center lg:text-left"
        >
          <motion.p
            variants={item}
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary"
          >
            Inspired by ancient wisdom. Driven by modern innovation.
          </motion.p>
          <motion.h1
            variants={item}
            className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:mx-0"
          >
            Learn Digital &amp; Analog VLSI Design from Industry Experts
          </motion.h1>
          <motion.p
            variants={item}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground lg:mx-0"
          >
            Kanada Group&apos;s training ecosystem — semiconductor fundamentals, CMOS
            technology, RTL to tapeout, and analog IC design — now on your schedule.
          </motion.p>
          <motion.div
            variants={item}
            className="mt-8 flex justify-center gap-3 lg:justify-start"
          >
            <Link href="/courses" className={cn(buttonVariants({ size: "lg" }))}>
              Browse courses
            </Link>
            <Link
              href="/sign-up"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Create a free account
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-xl">
            <video
              className="aspect-video w-full object-cover"
              src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="absolute -bottom-4 left-4 right-4 rounded-lg border border-border bg-card px-4 py-3 shadow-lg sm:left-6 sm:right-auto sm:min-w-64"
          >
            <p className="text-xs font-medium text-muted-foreground">Now playing</p>
            <p className="text-sm font-semibold">CMOS Inverter Operation</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
