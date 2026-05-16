import { cn } from "@/lib/utils";
import { last7Days, type Log } from "@/lib/habits";

export function WeekStrip({
  color,
  logs,
  now,
}: {
  color: string;
  logs: Log[];
  now: number;
}) {
  const week = last7Days(now, logs);
  return (
    <div className="flex items-center justify-between px-1">
      {week.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold",
              day.count === 0 &&
                "border-[1.5px] border-border text-transparent",
              day.count === 0 && day.isToday && "border-foreground/40",
            )}
            style={
              day.count > 0
                ? { backgroundColor: color, color: "#fff" }
                : undefined
            }
          >
            {day.count || "0"}
          </div>
          <span
            className={cn(
              "text-[10px]",
              day.isToday
                ? "font-bold text-foreground"
                : "text-muted-foreground",
            )}
          >
            {day.label}
          </span>
        </div>
      ))}
    </div>
  );
}
