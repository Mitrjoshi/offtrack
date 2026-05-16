export type Habit = {
  name: string;
  color: string;
  createdAt: number;
};

export type Log = {
  habitId: string;
  timestamp: number;
  note: string;
};

/** One day in milliseconds. */
export const DAY_MS = 86_400_000;

/** Habit accent color palette. */
export const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

/** Default color for new habits. */
export const DEFAULT_COLOR = "#ef4444";

/** Midnight (local) of the day containing `ts`. */
export function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Whole days elapsed from `ts` to `now`. */
export function daysBetween(now: number, ts: number) {
  return Math.floor((now - ts) / DAY_MS);
}

/** Append an alpha channel (0–1) to a `#rrggbb` hex color. */
export function hexAlpha(hex: string, alpha: number) {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, "0");
  return hex + a;
}

/** Per-day occurrence counts for the last 7 days, oldest first. */
export function last7Days(now: number, logs: Log[]) {
  const today = startOfDay(now);
  return Array.from({ length: 7 }, (_, i) => {
    const start = today - (6 - i) * DAY_MS;
    const count = logs.filter(
      (l) => l.timestamp >= start && l.timestamp < start + DAY_MS,
    ).length;
    return {
      label: new Date(start).toLocaleDateString(undefined, {
        weekday: "narrow",
      }),
      count,
      isToday: i === 6,
    };
  });
}

/** Longest gap (in days) with no logged occurrences. */
export function longestCleanStreak(
  now: number,
  createdAt: number,
  logs: Log[],
) {
  if (logs.length === 0) return daysBetween(now, createdAt);
  const sorted = [...logs].sort((a, b) => a.timestamp - b.timestamp);
  let max = daysBetween(sorted[0].timestamp, createdAt);
  for (let i = 1; i < sorted.length; i++) {
    max = Math.max(
      max,
      daysBetween(sorted[i].timestamp, sorted[i - 1].timestamp),
    );
  }
  return Math.max(max, daysBetween(now, sorted[sorted.length - 1].timestamp));
}
