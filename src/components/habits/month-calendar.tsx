import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hexAlpha, startOfDay, type Log } from "@/lib/habits";

export function MonthCalendar({
  color,
  logs,
  now,
}: {
  color: string;
  logs: Log[];
  now: number;
}) {
  const [offset, setOffset] = useState(0);

  const view = new Date(now);
  view.setDate(1);
  view.setMonth(view.getMonth() + offset);
  const year = view.getFullYear();
  const month = view.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const todayStart = startOfDay(now);

  const counts: Record<number, number> = {};
  for (const log of logs) {
    const d = new Date(log.timestamp);
    if (d.getFullYear() === year && d.getMonth() === month) {
      counts[d.getDate()] = (counts[d.getDate()] ?? 0) + 1;
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setOffset(offset - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">
          {view.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={offset >= 0}
          onClick={() => setOffset(offset + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const count = counts[day] ?? 0;
          const cellTs = new Date(year, month, day).getTime();
          const isToday = startOfDay(cellTs) === todayStart;
          const isFuture = startOfDay(cellTs) > todayStart;
          const alpha = count === 0 ? 0 : Math.min(0.4 + (count - 1) * 0.3, 1);
          return (
            <div
              key={day}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-xs font-medium",
                count === 0 && "bg-muted text-muted-foreground/50",
                count > 0 && (alpha >= 0.7 ? "text-white" : "text-foreground"),
                isToday && "ring-1 ring-foreground",
                isFuture && "opacity-30",
              )}
              style={
                count > 0
                  ? { backgroundColor: hexAlpha(color, alpha) }
                  : undefined
              }
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
