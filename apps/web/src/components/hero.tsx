"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, buttonVariants, cn } from "@kanada/ui";
import { AuroraOrbs, Magnetic } from "./motion-primitives";

export interface HeroCourse {
  slug: string;
  title: string;
  description: string;
  category: string | null;
  level: string;
}

export function Hero({
  courses,
  stats,
}: {
  courses: HeroCourse[];
  stats: { courses: number; teachers: number; students: number };
}) {
  const slides = courses.slice(0, 6);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <section className="relative overflow-hidden border-b border-border">
      <AuroraOrbs />
      <div className="absolute inset-0 bg-grid bg-grid-fade" />

      <div className="relative mx-auto grid max-w-6xl gap-16 px-4 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
        {/* Left — value proposition. CSS entrances (never rAF/observer-gated) so
            the hero can never be stranded blank. */}
        <div className="reveal-stagger text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border glass px-4 py-1.5 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Now enrolling · 20-week VLSI program
          </div>

          <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Master <span className="text-gradient">VLSI Design</span>
            <br />
            from silicon to signoff.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0">
            Industry-led Digital &amp; Analog VLSI training — semiconductor fundamentals,
            CMOS technology, RTL to tapeout, and analog IC design. Learn, build, and earn your
            certificate.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Magnetic>
              <Link
                href="/courses"
                className={cn(buttonVariants({ size: "lg" }), "glow-primary")}
              >
                Explore courses
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "glass")}
              >
                Start for free
              </Link>
            </Magnetic>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
            <div>
              <span className="text-lg font-bold text-foreground">{stats.courses}+</span> courses
            </div>
            <div className="h-4 w-px bg-border" />
            <div>
              <span className="text-lg font-bold text-foreground">{stats.teachers}</span> mentors
            </div>
            <div className="h-4 w-px bg-border" />
            <div>
              <span className="text-lg font-bold text-foreground">2</span> tracks
            </div>
          </div>
        </div>

        {/* Right — course showcase carousel */}
        <div className="reveal-in relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/25 via-fuchsia-500/10 to-accent/20 blur-2xl" />

          <div className="glass glass-border overflow-hidden rounded-3xl shadow-2xl">
            <div className="relative aspect-video">
              <video
                className="h-full w-full object-cover"
                src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Lesson preview
              </div>
            </div>

            <div className="relative min-h-[190px] p-6">
              {/* keyed so the CSS slide-in replays on each auto-advance */}
              <div key={index} className="animate-slide-in">
                {slide ? (
                  <>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {slide.category && <Badge variant="secondary">{slide.category}</Badge>}
                      <Badge variant="outline">{slide.level}</Badge>
                    </div>
                    <h3 className="text-xl font-semibold leading-snug">{slide.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {slide.description}
                    </p>
                    <Link
                      href={`/courses/${slide.slug}`}
                      className={cn(buttonVariants({ size: "sm" }), "mt-4 group")}
                    >
                      Enroll now
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </Link>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                    <p className="font-semibold">Courses coming soon</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Check back shortly for the full catalog.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {slides.length > 1 && (
            <div className="mt-5 flex justify-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.slug}
                  onClick={() => setIndex(i)}
                  aria-label={`Show course ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-8 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
