import { Target } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Target className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <h3 className="text-base font-semibold">No habits yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">
        Tap the + button to add a habit you want to break.
      </p>
    </div>
  );
}
