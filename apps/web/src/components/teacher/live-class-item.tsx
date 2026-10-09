import Link from "next/link";
import { Clock, ExternalLink, Video } from "lucide-react";
import { Badge, buttonVariants, cn } from "@kanada/ui";
import { formatIstTime, istDayParts, liveState, toIstLocalInput } from "@/lib/time";
import { cancelLiveClassAction, deleteLiveClassAction } from "@/actions/teacher-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ScheduleClassForm } from "./schedule-class-form";
import { RecordingForm } from "./recording-form";

export type TeacherLiveClass = {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  startsAt: Date;
  durationMinutes: number;
  meetingUrl: string;
  recordingUrl: string | null;
  status: "SCHEDULED" | "CANCELLED";
  course: { id: string; title: string; slug: string };
};

export function LiveStatusBadge({ startsAt, durationMinutes, cancelled }: { startsAt: Date; durationMinutes: number; cancelled?: boolean }) {
  if (cancelled) return <Badge variant="destructive">Cancelled</Badge>;
  const state = liveState(startsAt, durationMinutes);
  if (state === "live")
    return (
      <Badge variant="success" className="gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> Live now
      </Badge>
    );
  if (state === "joinable") return <Badge variant="secondary">Starting soon</Badge>;
  if (state === "ended") return <Badge variant="outline">Ended</Badge>;
  return <Badge variant="outline">Upcoming</Badge>;
}

export function DateTile({ date }: { date: Date }) {
  const d = istDayParts(date);
  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary/10 text-center text-primary">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider">{d.month}</p>
        <p className="font-display text-2xl font-bold leading-none">{d.day}</p>
        <p className="text-[10px] font-medium uppercase">{d.weekday}</p>
      </div>
    </div>
  );
}

export function LiveClassItem({ cls, showCourse = true }: { cls: TeacherLiveClass; showCourse?: boolean }) {
  const state = liveState(cls.startsAt, cls.durationMinutes);
  const cancelled = cls.status === "CANCELLED";
  const ended = state === "ended";
  const end = new Date(cls.startsAt.getTime() + cls.durationMinutes * 60_000);

  return (
    <li className={cn("rounded-2xl border border-border p-4 sm:p-5", cancelled && "opacity-70")}>
      <div className="flex gap-4">
        <DateTile date={cls.startsAt} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("font-semibold", cancelled && "line-through")}>{cls.title}</p>
            <LiveStatusBadge startsAt={cls.startsAt} durationMinutes={cls.durationMinutes} cancelled={cancelled} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatIstTime(cls.startsAt)} – {formatIstTime(end)} IST
            </span>
            {showCourse && <span>{cls.course.title}</span>}
          </p>
          {cls.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{cls.description}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!cancelled && !ended && (
              <Link
                href={`/live/${cls.id}/join`}
                target="_blank"
                rel="noopener"
                className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
              >
                <Video className="h-4 w-4" aria-hidden="true" />
                {state === "live" || state === "joinable" ? "Start class" : "Open meeting"}
              </Link>
            )}
            {!cancelled && !ended && (
              <details className="group">
                <summary className={cn(buttonVariants({ size: "sm", variant: "outline" }), "cursor-pointer list-none")}>Edit</summary>
                <div className="mt-3 w-full rounded-2xl border border-border bg-background p-4 sm:min-w-[32rem]">
                  <ScheduleClassForm
                    courses={[]}
                    edit={{
                      id: cls.id,
                      courseId: cls.courseId,
                      title: cls.title,
                      description: cls.description,
                      startsAtLocal: toIstLocalInput(cls.startsAt),
                      durationMinutes: cls.durationMinutes,
                      meetingUrl: cls.meetingUrl,
                    }}
                  />
                </div>
              </details>
            )}
            {!cancelled && !ended && (
              <form action={cancelLiveClassAction.bind(null, cls.id)}>
                <ConfirmSubmitButton size="sm" variant="ghost" className="text-destructive" confirmText={`Cancel "${cls.title}"? Students with access will be emailed.`}>
                  Cancel class
                </ConfirmSubmitButton>
              </form>
            )}
            {(cancelled || ended) && (
              <form action={deleteLiveClassAction.bind(null, cls.id)}>
                <ConfirmSubmitButton size="sm" variant="ghost" confirmText={`Delete "${cls.title}" permanently?`}>
                  Delete
                </ConfirmSubmitButton>
              </form>
            )}
            {ended && cls.recordingUrl && (
              <a href={cls.recordingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Recording <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
          {ended && !cancelled && (
            <div className="mt-3">
              <RecordingForm classId={cls.id} recordingUrl={cls.recordingUrl} />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
