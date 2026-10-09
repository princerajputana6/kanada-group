"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import { buttonVariants, cn } from "@kanada/ui";
import { liveState, type LiveState } from "@/lib/time";

/** Enables itself when the join window opens — no reload needed. */
export function JoinButton({
  classId,
  startsAt,
  durationMinutes,
  size = "sm",
}: {
  classId: string;
  startsAt: string;
  durationMinutes: number;
  size?: "sm" | "default";
}) {
  const start = new Date(startsAt);
  const [state, setState] = useState<LiveState>(() => liveState(start, durationMinutes));
  useEffect(() => {
    const t = setInterval(() => setState(liveState(new Date(startsAt), durationMinutes)), 30_000);
    return () => clearInterval(t);
  }, [startsAt, durationMinutes]);

  if (state === "ended") return <span className="text-sm text-muted-foreground">Ended</span>;
  if (state === "upcoming") {
    return (
      <span className={cn(buttonVariants({ size, variant: "outline" }), "pointer-events-none gap-1.5 opacity-60")} aria-disabled="true">
        <Video className="h-4 w-4" aria-hidden="true" /> Opens 15 min before
      </span>
    );
  }
  return (
    <a href={`/live/${classId}/join`} target="_blank" rel="noopener" className={cn(buttonVariants({ size }), "gap-1.5")}>
      <Video className="h-4 w-4" aria-hidden="true" /> {state === "live" ? "Join now" : "Join class"}
    </a>
  );
}
