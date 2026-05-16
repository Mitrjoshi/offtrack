import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "./color-picker";
import { DEFAULT_COLOR } from "@/lib/habits";

export function HabitFormDialog({
  open,
  onOpenChange,
  mode,
  initialName = "",
  initialColor = DEFAULT_COLOR,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialName?: string;
  initialColor?: string;
  onSubmit: (name: string, color: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  // seed fields each time the dialog opens
  useEffect(() => {
    if (open) {
      setName(initialName);
      setColor(initialColor);
    }
  }, [open, initialName, initialColor]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim(), color);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New habit" : "Edit habit"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit name</Label>
            <Input
              id="habit-name"
              placeholder="e.g. Smoking, Nail biting…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!name.trim()}
          >
            {mode === "create" ? "Create habit" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
