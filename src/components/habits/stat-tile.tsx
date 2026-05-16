import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatTile({
  value,
  label,
  icon,
  variant = "card",
}: {
  value: number | string;
  label: string;
  icon?: ReactNode;
  variant?: "card" | "muted";
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2.5",
        variant === "card" ? "border bg-card" : "bg-muted/60",
      )}
    >
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-lg font-bold tabular-nums text-foreground">
          {value}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
