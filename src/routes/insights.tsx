import { createFileRoute, Link } from "@tanstack/react-router";
import { useTable } from "tinybase/ui-react";
import { ArrowLeft, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/useNow";
import { StatTile } from "@/components/habits/stat-tile";
import { cn } from "@/lib/utils";
import { DAY_MS, type Habit, type Log } from "@/lib/habits";

export const Route = createFileRoute("/insights")({
  component: InsightsPage,
});

const WEEK_MS = 7 * DAY_MS;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAYPARTS = [
  { label: "Night", sublabel: "12–6am" },
  { label: "Morning", sublabel: "6am–12pm" },
  { label: "Afternoon", sublabel: "12–6pm" },
  { label: "Evening", sublabel: "6pm–12am" },
];

function daypartIndex(hours: number) {
  if (hours < 6) return 0;
  if (hours < 12) return 1;
  if (hours < 18) return 2;
  return 3;
}

// eslint-disable-next-line react-refresh/only-export-components
function InsightsPage() {
  const habits = useTable("habits");
  const logs = useTable("logs");
  const now = useNow();

  const [filter, setFilter] = useState<string>("all"); // "all" or a habitId

  const habitIds = Object.keys(habits);
  const allLogs = Object.values(logs) as Log[];
  const filtered =
    filter === "all" ? allLogs : allLogs.filter((l) => l.habitId === filter);

  const total = filtered.length;

  // aggregations
  const byWeekday = [0, 0, 0, 0, 0, 0, 0];
  const byDaypart = [0, 0, 0, 0];
  for (const log of filtered) {
    const d = new Date(log.timestamp);
    byWeekday[d.getDay()]++;
    byDaypart[daypartIndex(d.getHours())]++;
  }

  const thisWeek = filtered.filter((l) => l.timestamp >= now - WEEK_MS).length;
  const lastWeek = filtered.filter(
    (l) => l.timestamp >= now - 2 * WEEK_MS && l.timestamp < now - WEEK_MS,
  ).length;
  const delta = thisWeek - lastWeek;

  const firstTs = total ? Math.min(...filtered.map((l) => l.timestamp)) : now;
  const weeksTracked = Math.max(1, Math.ceil((now - firstTs) / WEEK_MS));
  const avgPerWeek = total / weeksTracked;

  const worstWeekday = byWeekday.indexOf(Math.max(...byWeekday));
  const worstDaypart = byDaypart.indexOf(Math.max(...byDaypart));

  const filterColor =
    filter === "all" ? undefined : (habits[filter] as Habit)?.color;

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="flex items-center gap-1 px-3 py-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Insights</h1>
        </div>

        {/* Habit filter */}
        {habitIds.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-5 pb-3">
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All
            </FilterChip>
            {habitIds.map((id) => {
              const h = habits[id] as Habit;
              return (
                <FilterChip
                  key={id}
                  active={filter === id}
                  color={h.color}
                  onClick={() => setFilter(id)}
                >
                  {h.name}
                </FilterChip>
              );
            })}
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <p className="text-sm text-muted-foreground">
            No occurrences logged yet. Once you start logging, patterns will
            show up here.
          </p>
        </div>
      ) : (
        <div className="px-5 py-5 space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <StatTile value={total} label="total logged" />
            <StatTile value={avgPerWeek.toFixed(1)} label="avg / week" />
            <StatTile value={thisWeek} label="this week" />
          </div>

          {/* Trend */}
          <TrendCard delta={delta} />

          {/* Worst-time callout */}
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-sm">
              <span className="text-muted-foreground">
                Slip-ups happen most on{" "}
              </span>
              <span className="font-semibold">
                {WEEKDAYS_FULL[worstWeekday]}{" "}
                {DAYPARTS[worstDaypart].label.toLowerCase()}s
              </span>
              <span className="text-muted-foreground">
                . Worth planning around.
              </span>
            </p>
          </div>

          {/* By day of week */}
          <ChartCard title="By day of week">
            <BarChart
              color={filterColor}
              data={WEEKDAYS.map((label, i) => ({
                label,
                value: byWeekday[i],
              }))}
            />
          </ChartCard>

          {/* By time of day */}
          <ChartCard title="By time of day">
            <BarChart
              color={filterColor}
              data={DAYPARTS.map((dp, i) => ({
                label: dp.label,
                sublabel: dp.sublabel,
                value: byDaypart[i],
              }))}
            />
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
        active ? "text-white" : "bg-muted text-muted-foreground",
      )}
      style={active ? { backgroundColor: color ?? "#6366f1" } : undefined}
    >
      {children}
    </button>
  );
}

function TrendCard({ delta }: { delta: number }) {
  const flat = delta === 0;
  const improving = delta < 0;

  const Icon = flat ? Minus : improving ? TrendingDown : TrendingUp;
  const tone = flat
    ? "text-muted-foreground"
    : improving
      ? "text-emerald-600"
      : "text-red-600";
  const message = flat
    ? "Same as last week."
    : improving
      ? `${-delta} fewer than last week — keep it up.`
      : `${delta} more than last week.`;

  return (
    <div className="rounded-2xl border bg-card p-4 flex items-center gap-3">
      <div
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center bg-muted",
          tone,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function BarChart({
  data,
  color,
}: {
  data: { label: string; sublabel?: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-16 shrink-0">
            <span className="text-xs font-medium">{d.label}</span>
            {d.sublabel && (
              <span className="block text-[10px] text-muted-foreground leading-tight">
                {d.sublabel}
              </span>
            )}
          </div>
          <div className="flex-1 h-6 rounded-md bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-md transition-all",
                !color && "bg-primary",
              )}
              style={{
                width: `${(d.value / max) * 100}%`,
                ...(color ? { backgroundColor: color } : {}),
              }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}
