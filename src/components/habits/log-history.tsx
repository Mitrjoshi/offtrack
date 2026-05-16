import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Log } from "@/lib/habits";

export type LogEntry = Log & { id: string };

export function LogHistory({
  color,
  logs,
  onDelete,
}: {
  color: string;
  logs: LogEntry[];
  onDelete: (logId: string) => void;
}) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
        No slip-ups logged yet. Keep it up.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card divide-y overflow-hidden">
      {logs.map((log) => (
        <div key={log.id} className="flex items-center gap-3 px-4 py-3">
          <div
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {new Date(log.timestamp).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(log.timestamp).toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(log.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
