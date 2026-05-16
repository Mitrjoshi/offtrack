import { useNavigate } from "@tanstack/react-router";
import { useTable } from "tinybase/ui-react";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HabitAvatar } from "./habit-avatar";
import { WeekStrip } from "./week-strip";
import {
  daysBetween,
  hexAlpha,
  last7Days,
  type Habit,
  type Log,
} from "@/lib/habits";

export function HabitCard({
  habit,
  habitId,
  now,
  onQuickLog,
}: {
  habit: Habit;
  habitId: string;
  now: number;
  onQuickLog: () => void;
}) {
  const navigate = useNavigate();
  const logs = useTable("logs");
  const habitLogs = (Object.values(logs) as Log[]).filter(
    (l) => l.habitId === habitId,
  );

  const lastLog = [...habitLogs].sort((a, b) => b.timestamp - a.timestamp)[0];
  const streak = lastLog ? daysBetween(now, lastLog.timestamp) : null;
  const weekCount = last7Days(now, habitLogs).reduce((s, d) => s + d.count, 0);

  const goToDetail = () =>
    navigate({ to: "/habits/$habitId", params: { habitId } });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetail();
        }
      }}
      className="rounded-2xl border bg-card p-4 shadow-sm cursor-pointer transition-colors active:bg-muted/50"
    >
      {/* top row */}
      <div className="flex items-center gap-3">
        <HabitAvatar name={habit.name} color={habit.color} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate leading-tight">{habit.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {weekCount}× in last 7 days
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onQuickLog();
          }}
          className="shrink-0 rounded-full px-4"
        >
          Log
        </Button>
      </div>

      {/* streak banner */}
      <div
        className="mt-3 flex items-center justify-between rounded-xl px-3 py-2.5"
        style={{ backgroundColor: hexAlpha(habit.color, 0.08) }}
      >
        {streak === null ? (
          <span className="text-sm font-medium text-muted-foreground">
            No slip-ups logged yet
          </span>
        ) : streak === 0 ? (
          <span className="text-sm font-medium">
            Logged today — fresh start tomorrow
          </span>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: habit.color }}
            >
              {streak}
            </span>
            <span className="text-sm font-medium">
              day{streak === 1 ? "" : "s"} clean
            </span>
          </div>
        )}
        {streak !== null && streak >= 7 && (
          <Flame
            className="h-5 w-5"
            style={{ color: habit.color }}
            fill="currentColor"
          />
        )}
      </div>

      {/* 7-day activity strip */}
      <div className="mt-3">
        <WeekStrip color={habit.color} logs={habitLogs} now={now} />
      </div>
    </div>
  );
}
