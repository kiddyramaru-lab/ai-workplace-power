import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { UserMenu } from "@/components/user-menu";

export function ToolShell({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            {icon}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-tight">{title}</h1>
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <UserMenu />
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      <footer className="border-t bg-muted/30 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-start gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            <span className="font-medium text-foreground">Responsible AI:</span> Generated
            content may be inaccurate, biased, or out of date. Always review and edit before
            using. Do not paste confidential data you would not send to a third-party service.
          </p>
        </div>
      </footer>
    </div>
  );
}
