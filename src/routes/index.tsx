import { createFileRoute, Link } from "@tanstack/react-router";
import { useTable, useStore } from "tinybase/ui-react";
import { Plus, Flame, Target, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/useNow";
import { HabitCard } from "@/components/habits/habit-card";
import { StatTile } from "@/components/habits/stat-tile";
import { EmptyState } from "@/components/habits/empty-state";
import { HabitFormDialog } from "@/components/habits/habit-form-dialog";
import {
  DAY_MS,
  daysBetween,
  startOfDay,
  type Habit,
  type Log,
} from "@/lib/habits";

export const Route = createFileRoute("/")({
  component: Index,
});

// eslint-disable-next-line react-refresh/only-export-components
function Index() {
  const habits = useTable("habits");
  const logs = useTable("logs");
  const store = useStore();
  const now = useNow();

  const [createOpen, setCreateOpen] = useState(false);

  const habitIds = Object.keys(habits);
  const allLogs = Object.values(logs) as Log[];

  // overview stats
  const weekStart = startOfDay(now) - 6 * DAY_MS;
  const weekTotal = allLogs.filter((l) => l.timestamp >= weekStart).length;

  const streaks = habitIds
    .map((id) => {
      const last = allLogs
        .filter((l) => l.habitId === id)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      return last ? daysBetween(now, last.timestamp) : null;
    })
    .filter((s): s is number => s !== null);
  const bestStreak = streaks.length ? Math.max(...streaks) : 0;

  const handleCreateHabit = (name: string, color: string) => {
    if (!store) return;
    store.setRow("habits", crypto.randomUUID(), {
      name,
      color,
      createdAt: Date.now(),
    });
  };

  const handleQuickLog = (habitId: string) => {
    if (!store) return;
    store.setRow("logs", crypto.randomUUID(), {
      habitId,
      timestamp: now,
      note: "",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track what you want to change
              </p>
            </div>
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {habitIds.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              <StatTile
                variant="muted"
                icon={<Target className="h-3.5 w-3.5" />}
                value={habitIds.length}
                label="tracking"
              />
              <StatTile
                variant="muted"
                icon={<Flame className="h-3.5 w-3.5" />}
                value={bestStreak}
                label="best streak"
              />
              <StatTile variant="muted" value={weekTotal} label="this week" />
            </div>
          )}
        </div>
      </div>

      {/* Habit List */}
      <div className="px-5 py-5 space-y-3">
        {habitIds.length === 0 ? (
          <EmptyState />
        ) : (
          habitIds.map((habitId) => (
            <HabitCard
              key={habitId}
              now={now}
              habitId={habitId}
              habit={habits[habitId] as Habit}
              onQuickLog={() => handleQuickLog(habitId)}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <Button
        size="lg"
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg shadow-primary/25"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <HabitFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSubmit={handleCreateHabit}
      />
    </div>
  );
}
