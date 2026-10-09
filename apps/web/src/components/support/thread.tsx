import { Badge, cn } from "@kanada/ui";
import { formatIst } from "@/lib/time";
import { STATUS_META } from "@/lib/support";

export function TicketStatusBadge({ status }: { status: keyof typeof STATUS_META }) {
  const m = STATUS_META[status];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

export function TicketThread({
  messages,
  viewerIsStaff,
}: {
  messages: { id: string; body: string; fromStaff: boolean; createdAt: Date; author: { name: string } | null }[];
  viewerIsStaff: boolean;
}) {
  return (
    <ol className="space-y-4">
      {messages.map((m) => {
        const mine = viewerIsStaff ? m.fromStaff : !m.fromStaff;
        return (
          <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-3xl border px-4 py-3 sm:max-w-[75%]",
                m.fromStaff ? "border-primary/25 bg-primary/[0.06]" : "border-border bg-card",
                mine ? "rounded-br-lg" : "rounded-bl-lg",
              )}
            >
              <p className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{m.author?.name ?? "Deleted user"}</span>
                {m.fromStaff && <Badge variant="secondary">Kanada support</Badge>}
                <span>{formatIst(m.createdAt)}</span>
              </p>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
