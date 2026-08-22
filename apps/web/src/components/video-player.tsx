"use client";

import { useRef } from "react";
import { updateProgressAction, markLessonCompleteAction } from "@/actions/progress-actions";

export function VideoPlayer({
  lessonId,
  initialSeconds,
}: {
  lessonId: string;
  initialSeconds: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSaved = useRef(initialSeconds);

  return (
    <video
      ref={videoRef}
      controls
      preload="metadata"
      className="aspect-video w-full rounded-lg bg-black"
      src={`/api/stream/${lessonId}`}
      onLoadedMetadata={() => {
        if (videoRef.current && initialSeconds > 0) {
          videoRef.current.currentTime = initialSeconds;
        }
      }}
      onTimeUpdate={(e) => {
        const t = e.currentTarget.currentTime;
        if (t - lastSaved.current >= 5) {
          lastSaved.current = t;
          void updateProgressAction(lessonId, t);
        }
      }}
      onPause={(e) => {
        void updateProgressAction(lessonId, e.currentTarget.currentTime);
      }}
      onEnded={() => {
        void markLessonCompleteAction(lessonId);
      }}
    />
  );
}
