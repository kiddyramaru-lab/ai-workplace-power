import { useState } from "react";
import { LogOut, RefreshCw, User as UserIcon, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/lib/auth-context";

export function UserMenu() {
  const { user, signOut, syncNow } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="h-8 gap-2 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Sign in to sync across devices</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <AuthModal open={open} onOpenChange={setOpen} />
      </>
    );
  }

  const initials =
    (user.email ?? "?")
      .split("@")[0]
      .split(/[._-]/)
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm ring-2 ring-primary/30 transition-shadow hover:ring-primary/60"
          aria-label="Account menu"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            try {
              await syncNow();
              toast.success("Synced");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Sync failed");
            }
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Sync outputs now
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <UserCircle2 className="mr-2 h-4 w-4" /> Manage account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            toast.success("Signed out — back to local-only");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
