import type { ReactNode } from "react";
import { HelpCircle, Mail, MessageSquare, History, Shield } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type HelpDialogProps = {
  trigger: ReactNode;
};

export function HelpDialog({ trigger }: HelpDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <HelpCircle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl">How can we help?</DialogTitle>
          <DialogDescription>
            A quick tour of Workmate AI — your privacy‑first productivity companion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <HelpItem
            icon={<Mail className="h-4 w-4" />}
            title="Smart Email Generator"
            body="Describe who you're writing to and the key points. Pick a tone and length, hit Generate, then copy or edit the draft. Use the pink Clear button to reset instantly."
          />
          <HelpItem
            icon={<MessageSquare className="h-4 w-4" />}
            title="Chatbot"
            body="Ask questions, brainstorm, or draft on the fly. Press Enter to send, Shift+Enter for a new line. Conversations are temporary and disappear when you leave."
          />
          <HelpItem
            icon={<History className="h-4 w-4" />}
            title="Output History"
            body="Every generation is saved locally so you can revisit or pin your best drafts. Nothing leaves your device."
          />

          <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              All data stays on your device. Cloud sync is optional and off by default.
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Quick tips</p>
            <ol className="list-decimal space-y-0.5 pl-4">
              <li>Type your prompt or fill the inputs.</li>
              <li>Click Generate.</li>
              <li>Copy, edit, or pin the output.</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-full sm:w-auto">Got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HelpItem({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
