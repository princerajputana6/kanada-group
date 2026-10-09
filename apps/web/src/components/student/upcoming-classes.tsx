import { Radio } from "lucide-react";
import { formatIst } from "@/lib/time";
import { DateTile, LiveStatusBadge } from "@/components/teacher/live-class-item";
import { JoinButton } from "./join-button";

export type StudentClass = {
  id: string;
  title: string;
  description: string | null;
  startsAt: Date;
  durationMinutes: number;
  course?: { title: string; slug: string } | null;
  teacher?: { name: string } | null;
};

export function UpcomingClassesList({ classes, showCourse = true }: { classes: StudentClass[]; showCourse?: boolean }) {
  if (classes.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Radio className="h-4 w-4" aria-hidden="true" /> No live classes scheduled right now.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {classes.map((c) => (
        <li key={c.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <DateTile date={c.startsAt} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{c.title}</p>
              <LiveStatusBadge startsAt={c.startsAt} durationMinutes={c.durationMinutes} />
            </div>
            <p className="text-sm text-muted-foreground">
              {[showCourse ? c.course?.title : null, c.teacher?.name && `with ${c.teacher.name}`, `${formatIst(c.startsAt)} · ${c.durationMinutes} min`]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {c.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
          </div>
          <JoinButton classId={c.id} startsAt={c.startsAt.toISOString()} durationMinutes={c.durationMinutes} />
        </li>
      ))}
    </ul>
  );
}
