import { Download, FileSpreadsheet, FileText, Presentation } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { deleteNoteAction } from "@/actions/teacher-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { formatBytes } from "./ui";

export function NoteIcon({ fileName }: { fileName: string }) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const Icon = ["ppt", "pptx", "odp"].includes(ext) ? Presentation : ["xls", "xlsx"].includes(ext) ? FileSpreadsheet : FileText;
  const tone = ext === "pdf" ? "bg-red-500/10 text-red-600" : ["doc", "docx", "odt"].includes(ext) ? "bg-blue-500/10 text-blue-600" : ["ppt", "pptx", "odp"].includes(ext) ? "bg-orange-500/10 text-orange-600" : "bg-emerald-500/10 text-emerald-600";
  return (
    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

export function NoteItem({
  note,
  showCourse = true,
  canDelete = true,
}: {
  note: {
    id: string;
    title: string;
    description: string | null;
    fileName: string;
    sizeBytes: number;
    createdAt: Date;
    course?: { title: string } | null;
    section?: { title: string } | null;
  };
  showCourse?: boolean;
  canDelete?: boolean;
}) {
  return (
    <li className="flex items-center gap-4 py-3">
      <NoteIcon fileName={note.fileName} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{note.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[showCourse ? note.course?.title : null, note.section?.title, `${note.fileName.split(".").pop()?.toUpperCase()} · ${formatBytes(note.sizeBytes)}`, formatDate(note.createdAt)]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {note.description && <p className="mt-0.5 truncate text-sm text-muted-foreground">{note.description}</p>}
      </div>
      <a href={`/api/notes/${note.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium hover:border-primary/40 hover:text-primary" download>
        <Download className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Download</span>
      </a>
      {canDelete && (
        <form action={deleteNoteAction.bind(null, note.id)}>
          <ConfirmSubmitButton size="sm" variant="ghost" className="text-destructive" confirmText={`Delete "${note.title}"? Students will no longer be able to download it.`}>
            Delete
          </ConfirmSubmitButton>
        </form>
      )}
    </li>
  );
}
