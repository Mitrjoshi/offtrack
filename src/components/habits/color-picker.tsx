import { COLORS } from "@/lib/habits";

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex gap-2.5">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="h-9 w-9 rounded-full transition-transform active:scale-90"
          style={{
            backgroundColor: color,
            outline: value === color ? `2px solid ${color}` : "none",
            outlineOffset: 2,
          }}
        />
      ))}
    </div>
  );
}
