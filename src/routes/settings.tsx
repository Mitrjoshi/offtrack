/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, useTable } from "tinybase/ui-react";
import {
  ArrowLeft,
  Download,
  Upload,
  Sun,
  Moon,
  Trash2,
  Info,
} from "lucide-react";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const APP_VERSION = "1.0.0";

function SettingsPage() {
  const store = useStore();
  const habits = useTable("habits");
  const logs = useTable("logs");
  const { theme, setTheme } = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const habitCount = Object.keys(habits).length;
  const logCount = Object.keys(logs).length;

  const handleExport = () => {
    if (!store) return;
    const blob = new Blob([store.getJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habits-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFilePick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    try {
      const text = await file.text();
      JSON.parse(text); // validate it's at least JSON
      setImportError(null);
      setPendingImport(text);
    } catch {
      setImportError("That file isn't valid backup data.");
    }
  };

  const handleConfirmImport = () => {
    if (!store || !pendingImport) return;
    try {
      store.setJson(pendingImport);
      setPendingImport(null);
    } catch {
      setPendingImport(null);
      setImportError("Couldn't load that backup file.");
    }
  };

  const handleReset = () => {
    store?.delTables();
    setResetOpen(false);
  };

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
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </div>

      <div className="px-5 py-5 space-y-6">
        {/* Appearance */}
        <Section title="Appearance">
          <Row label="Theme" description="Light or dark mode">
            <div className="flex rounded-lg border p-0.5">
              <ThemeButton
                active={theme === "light"}
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4" />
              </ThemeButton>
              <ThemeButton
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4" />
              </ThemeButton>
            </div>
          </Row>
        </Section>

        {/* Data */}
        <Section title="Data">
          <div className="px-4 py-3 text-sm text-muted-foreground">
            {habitCount} habit{habitCount === 1 ? "" : "s"} · {logCount} log
            {logCount === 1 ? "" : "s"} stored on this device.
          </div>
          <RowButton
            icon={<Download className="h-4 w-4" />}
            label="Export backup"
            description="Save all data as a JSON file"
            onClick={handleExport}
          />
          <RowButton
            icon={<Upload className="h-4 w-4" />}
            label="Import backup"
            description="Restore data from a JSON file"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFilePick}
          />
        </Section>

        {/* Danger zone */}
        <Section title="Danger zone">
          <RowButton
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete all data"
            description="Remove every habit and log"
            destructive
            onClick={() => setResetOpen(true)}
          />
        </Section>

        {/* About */}
        <Section title="About">
          <Row label="Unhabit" description={`Version ${APP_VERSION}`}>
            <Info className="h-4 w-4 text-muted-foreground" />
          </Row>
        </Section>
      </div>

      {/* Import confirm */}
      <Dialog
        open={pendingImport !== null}
        onOpenChange={(o) => !o && setPendingImport(null)}
      >
        <DialogContent className=" max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Import this backup?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This replaces all {habitCount} current habit
            {habitCount === 1 ? "" : "s"} and {logCount} log
            {logCount === 1 ? "" : "s"} with the file's contents. This can't be
            undone.
          </p>
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPendingImport(null)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleConfirmImport}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import error */}
      <Dialog
        open={importError !== null}
        onOpenChange={(o) => !o && setImportError(null)}
      >
        <DialogContent className=" max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Import failed</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{importError}</p>
          <DialogFooter>
            <Button className="w-full" onClick={() => setImportError(null)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset confirm */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className=" max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete all data?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Every habit and logged occurrence will be permanently removed.
            Consider exporting a backup first.
          </p>
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setResetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleReset}
            >
              Delete everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="px-1 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="rounded-2xl border bg-card divide-y overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function RowButton({
  icon,
  label,
  description,
  destructive,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  description?: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-muted/50"
    >
      <span
        className={cn(
          "shrink-0",
          destructive ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block text-sm font-medium",
            destructive && "text-destructive",
          )}
        >
          {label}
        </span>
        {description && (
          <span className="block text-xs text-muted-foreground mt-0.5">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

function ThemeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 w-10 items-center justify-center rounded-md transition-colors",
        active ? "bg-foreground text-background" : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
