import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";

export function AuthModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"in" | "up" | null>(null);

  const handle = async (mode: "in" | "up") => {
    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }
    setBusy(mode);
    try {
      if (mode === "in") {
        await signIn(email, password);
        toast.success("Signed in");
      } else {
        await signUp(email, password);
        toast.success("Account created — check your inbox to confirm");
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Auth failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">Sync your workspace</DialogTitle>
          <DialogDescription className="text-center">
            Optional — your outputs stay on this device unless you sign in.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="in">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="in">Sign in</TabsTrigger>
            <TabsTrigger value="up">Create account</TabsTrigger>
          </TabsList>
          {(["in", "up"] as const).map((mode) => (
            <TabsContent key={mode} value={mode} className="space-y-3 pt-3">
              <div className="grid gap-2">
                <Label htmlFor={`${mode}-email`}>Email</Label>
                <Input
                  id={`${mode}-email`}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${mode}-pw`}>Password</Label>
                <Input
                  id={`${mode}-pw`}
                  type="password"
                  autoComplete={mode === "in" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handle(mode)}
                disabled={busy !== null}
                className="w-full"
              >
                {busy === mode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "in" ? "Signing in..." : "Creating..."}
                  </>
                ) : mode === "in" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
