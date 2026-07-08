import { useEffect, useState } from "react";
import { Copy, Pin, PinOff, Trash2, Save, Wand2, Cloud, CloudOff } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  type SavedOutput,
  type ToolKey,
  deleteOutput,
  outputsForTool,
  saveOutput,
  togglePin,
} from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth-modal";

type Props = {
  tool: ToolKey;
  output: string;
  onOutputChange: (v: string) => void;
  loading: boolean;
  suggestedTitle?: string;
  onLoadHistory?: (content: string) => void;
};

export function OutputPanel({
  tool,
  output,
  onOutputChange,
  loading,
  suggestedTitle,
  onLoadHistory,
}: Props) {
  const [history, setHistory] = useState<SavedOutput[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuth();

  const refresh = () => {
    outputsForTool(tool).then(setHistory).catch(() => setHistory([]));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, user?.id]);

  const handleSave = async () => {
    if (!output.trim()) return;
    try {
      await saveOutput({
        tool,
        title: suggestedTitle?.trim() || output.slice(0, 60),
        content: output,
      });
      refresh();
      toast.success(user ? "Saved & synced" : "Saved on this device");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const handleCopyForget = async () => {
    await navigator.clipboard.writeText(output);
    onOutputChange("");
    toast.success("Copied — output cleared");
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold">Output</CardTitle>
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="ghost" onClick={handleCopy} disabled={!output}>
            <Copy className="mr-1 h-3.5 w-3.5" /> Copy
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCopyForget} disabled={!output}>
            <Wand2 className="mr-1 h-3.5 w-3.5" /> Copy &amp; forget
          </Button>
          <Button size="sm" variant="default" onClick={handleSave} disabled={!output}>
            <Save className="mr-1 h-3.5 w-3.5" /> Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="edit">
          <TabsList className="mb-3">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="history">History ({history.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <Textarea
              value={output}
              onChange={(e) => onOutputChange(e.target.value)}
              placeholder={
                loading ? "Generating..." : "Your AI output will appear here. It's fully editable."
              }
              className="min-h-[360px] font-mono text-sm leading-relaxed"
            />
          </TabsContent>
          <TabsContent value="preview">
            <div className="prose prose-sm dark:prose-invert min-h-[360px] max-w-none rounded-md border bg-muted/30 p-4">
              {output ? (
                <ReactMarkdown>{output}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">Nothing to preview yet.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="mb-3 flex items-center justify-between gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                {user ? (
                  <>
                    <Cloud className="h-3.5 w-3.5 text-primary" />
                    <span>Synced to your account</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-3.5 w-3.5" />
                    <span>Stored on this device only</span>
                  </>
                )}
              </div>
              {!user && (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="font-medium text-primary hover:underline"
                >
                  Sign in to sync
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No saved outputs yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="group rounded-lg border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onLoadHistory?.(item.content)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="truncate text-sm font-medium">{item.title}</div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">
                          {item.content}
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </button>
                      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={async () => {
                            await togglePin(item.id);
                            refresh();
                          }}
                        >
                          {item.pinned ? (
                            <PinOff className="h-3.5 w-3.5" />
                          ) : (
                            <Pin className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={async () => {
                            await deleteOutput(item.id);
                            refresh();
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {item.pinned && (
                      <span className="mt-2 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Pinned
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-[11px] text-muted-foreground">
              Last {20} kept per tool. Data never leaves your browser unless you sign in.
            </p>
            <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
