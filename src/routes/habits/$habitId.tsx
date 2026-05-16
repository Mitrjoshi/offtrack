import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useRow, useTable, useStore } from "tinybase/ui-react";
import { ArrowLeft, Pencil, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNow } from "@/hooks/useNow";
import { HabitAvatar } from "@/components/habits/habit-avatar";
import { StatTile } from "@/components/habits/stat-tile";
import { MonthCalendar } from "@/components/habits/month-calendar";
import { LogHistory, type LogEntry } from "@/components/habits/log-history";
import { HabitFormDialog } from "@/components/habits/habit-form-dialog";
import {
  daysBetween,
  hexAlpha,
  longestCleanStreak,
  startOfDay,
  type Habit,
  type Log,
} from "@/lib/habits";

export const Route = createFileRoute("/habits/$habitId")({
  component: RouteComponent,
});

// eslint-disable-next-line react-refresh/only-export-components
function RouteComponent() {
  const { habitId } = Route.useParams();
  const navigate = useNavigate();
  const store = useStore();
  const now = useNow();

  const habitRow = useRow("habits", habitId);
  const logsTable = useTable("logs");
  const habitExists = Object.keys(habitRow).length > 0;
  const habit = habitRow as Habit;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const habitLogs: LogEntry[] = Object.entries(logsTable)
    .map(([id, row]) => ({ id, ...(row as unknown as Log) }))
    .filter((l) => l.habitId === habitId)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (!habitExists) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6">
        <p className="text-muted-foreground">This habit no longer exists.</p>
        <Link to="/">
          <Button variant="outline">Back to habits</Button>
        </Link>
      </div>
    );
  }

  const streakSince = habitLogs[0]?.timestamp ?? habit.createdAt;
  const streak = daysBetween(now, streakSince);
  const loggedToday = startOfDay(streakSince) === startOfDay(now);

  const view = new Date(now);
  const thisMonthCount = habitLogs.filter((l) => {
    const d = new Date(l.timestamp);
    return (
      d.getMonth() === view.getMonth() && d.getFullYear() === view.getFullYear()
    );
  }).length;

  const best = longestCleanStreak(now, habit.createdAt, habitLogs);

  const handleSaveEdit = (name: string, color: string) => {
    if (!store) return;
    store.setCell("habits", habitId, "name", name);
    store.setCell("habits", habitId, "color", color);
  };

  const handleDelete = () => {
    if (!store) return;
    store.transaction(() => {
      habitLogs.forEach((l) => store.delRow("logs", l.id));
      store.delRow("habits", habitId);
    });
    navigate({ to: "/" });
  };

  const handleLog = () => {
    if (!store) return;
    store.setRow("logs", crypto.randomUUID(), {
      habitId,
      timestamp: Date.now(),
      note: "",
    });
  };

  const handleDeleteLog = (logId: string) => {
    store?.delRow("logs", logId);
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-28">
      {/* Header */}
      <div
        className="border-b"
        style={{ backgroundColor: hexAlpha(habit.color, 0.1) }}
      >
        <div className="flex items-center justify-between px-3 py-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Streak hero */}
        <div className="px-5 pb-7 pt-2 text-center">
          <HabitAvatar
            name={habit.name}
            color={habit.color}
            size="lg"
            className="mx-auto mb-3"
          />
          <h1 className="text-xl font-bold tracking-tight">{habit.name}</h1>
          <div className="mt-4">
            <div
              className="text-5xl font-bold tabular-nums"
              style={{ color: habit.color }}
            >
              {streak}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {loggedToday
                ? "logged today — fresh start tomorrow"
                : `day${streak === 1 ? "" : "s"} clean`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-5 pt-5">
        <StatTile value={habitLogs.length} label="total logs" />
        <StatTile value={thisMonthCount} label="this month" />
        <StatTile value={best} label="best streak" />
      </div>

      {/* Calendar */}
      <div className="mx-5 mt-5 rounded-2xl border bg-card p-4">
        <MonthCalendar color={habit.color} logs={habitLogs} now={now} />
      </div>

      {/* History */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">
          History
        </h2>
        <LogHistory
          color={habit.color}
          logs={habitLogs}
          onDelete={handleDeleteLog}
        />
      </div>

      {/* Fixed log button */}
      <div className="fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur px-5 py-3">
        <Button onClick={handleLog} className="w-full" size="lg">
          <Plus className="h-5 w-5 mr-1" />
          Log occurrence
        </Button>
      </div>

      {/* Edit dialog */}
      <HabitFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initialName={habit.name}
        initialColor={habit.color}
        onSubmit={handleSaveEdit}
      />

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className=" max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete “{habit.name}”?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This removes the habit and all {habitLogs.length} logged
            occurrences. This can’t be undone.
          </p>
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
