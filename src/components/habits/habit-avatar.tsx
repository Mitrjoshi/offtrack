import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-10 w-10 rounded-xl text-sm",
  lg: "h-12 w-12 rounded-xl text-lg",
} as const;

export function HabitAvatar({
  name,
  color,
  size = "sm",
  className,
}: {
  name: string;
  color: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center font-bold text-white shrink-0",
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
