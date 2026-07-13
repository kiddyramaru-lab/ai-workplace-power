import type { ReactNode } from "react";
import { Settings, Sun, Moon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme, type Theme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

type SettingsDialogProps = {
  trigger: ReactNode;
};

export function SettingsDialog({ trigger }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Settings className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>
            Personalize your Workmate AI experience.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Appearance</h3>
          </div>

          <div
            role="radiogroup"
            aria-label="Theme"
            className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-1"
          >
            {options.map((opt) => {
              const active = theme === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            Choose how Workmate AI looks. Your preference is saved locally.
          </p>
        </section>
      </DialogContent>
    </Dialog>
  );
}
