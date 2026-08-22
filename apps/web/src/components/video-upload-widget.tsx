"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@kanada/ui";
import { requestUploadUrlAction } from "@/actions/upload-actions";
import { confirmLessonVideoAction } from "@/actions/course-actions";

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration || 0);
    };
    video.onerror = () => resolve(0);
    video.src = URL.createObjectURL(file);
  });
}

export function VideoUploadWidget({ lessonId }: { lessonId: string }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setProgress(0);
    try {
      const { url, key } = await requestUploadUrlAction(lessonId, file.name, file.type);
      await uploadWithProgress(url, file, setProgress);
      const duration = await readVideoDuration(file);
      await confirmLessonVideoAction(lessonId, key, Math.round(duration));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-1">
      <input
        type="file"
        accept="video/*"
        onChange={handleFile}
        className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium"
      />
      {progress !== null && <Progress value={progress} className="mt-1" />}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
