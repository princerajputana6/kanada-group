"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

const MY_BUILD = process.env.NEXT_PUBLIC_BUILD_ID;
const CHECK_EVERY_MS = 60_000;

/**
 * Detects a tab running an older build than the server (phones restore tabs
 * for days). Server-action IDs change on every deploy, so such a tab's forms
 * fail with "An unexpected response was received from the server". When the
 * tab is opened, restored or brought back into view we compare build IDs:
 * an untouched page reloads silently; a page with typed input gets a banner
 * instead, so nobody loses what they've entered.
 */
export function StaleBuildGuard() {
  const [stale, setStale] = useState(false);
  const dirty = useRef(false);
  const lastCheck = useRef(0);

  useEffect(() => {
    if (!MY_BUILD) return;
    const markDirty = () => {
      dirty.current = true;
    };
    document.addEventListener("input", markDirty, true);

    async function check() {
      if (Date.now() - lastCheck.current < CHECK_EVERY_MS) return;
      lastCheck.current = Date.now();
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const { buildId } = (await res.json()) as { buildId?: string };
        if (!buildId || buildId === MY_BUILD) return;
        // Never loop: reload at most once per server build.
        const marker = `kg-reloaded-for:${buildId}`;
        let alreadyReloaded = false;
        try {
          alreadyReloaded = sessionStorage.getItem(marker) === "1";
          if (!alreadyReloaded && !dirty.current) sessionStorage.setItem(marker, "1");
        } catch {
          /* storage unavailable */
        }
        if (!dirty.current && !alreadyReloaded) window.location.reload();
        else setStale(true);
      } catch {
        /* offline — try again later */
      }
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        lastCheck.current = 0;
        void check();
      }
    };
    void check();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("input", markDirty, true);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  if (!stale) return null;
  return (
    <div
      role="alert"
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-primary/30 bg-card px-4 py-3 text-sm shadow-[0_20px_50px_-20px_rgba(10,8,30,0.45)]"
    >
      <p className="flex-1">
        <span className="font-semibold">The site has been updated.</span> Refresh this page before
        submitting so your form goes through.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 font-medium text-primary-foreground"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
      </button>
    </div>
  );
}
