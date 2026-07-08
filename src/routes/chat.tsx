import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Plus, Send, Trash2, Loader2, User, Bot } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { aiChat } from "@/lib/ai.functions";
import {
  type ChatMessage,
  type ChatThread,
  deleteThread,
  loadThreads,
  upsertThread,
} from "@/lib/storage";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

const SYSTEM_PROMPT =
  "You are Workplace AI, a helpful, concise assistant for workplace productivity. Answer clearly in markdown. If asked something you don't know, say so instead of guessing. Keep replies focused and skimmable.";

function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Bootstrap once on mount
  useEffect(() => {
    loadThreads().then((existing) => {
      if (existing.length === 0) {
        const t: ChatThread = {
          id: crypto.randomUUID(),
          title: "New chat",
          messages: [],
          updatedAt: Date.now(),
        };
        upsertThread(t);
        setThreads([t]);
        setActiveId(t.id);
      } else {
        setThreads(existing);
        setActiveId(existing[0].id);
      }
    });
  }, []);


  const active = threads.find((t) => t.id === activeId) ?? null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, loading]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeId]);

  const handleNew = () => {
    const t: ChatThread = {
      id: crypto.randomUUID(),
      title: "New chat",
      messages: [],
      updatedAt: Date.now(),
    };
    upsertThread(t);
    setThreads([t, ...threads]);
    setActiveId(t.id);
  };

  const handleDelete = (id: string) => {
    deleteThread(id);
    const next = threads.filter((t) => t.id !== id);
    setThreads(next);
    if (activeId === id) {
      setActiveId(next[0]?.id ?? null);
      if (next.length === 0) handleNew();
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !active || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    const isFirst = active.messages.length === 0;
    const updated: ChatThread = {
      ...active,
      title: isFirst ? text.slice(0, 40) : active.title,
      messages: [...active.messages, userMsg],
      updatedAt: Date.now(),
    };
    setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    upsertThread(updated);
    setInput("");
    setLoading(true);

    try {
      const { content } = await aiChat({
        data: {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...updated.messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        },
      });
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        createdAt: Date.now(),
      };
      const withReply: ChatThread = {
        ...updated,
        messages: [...updated.messages, assistantMsg],
        updatedAt: Date.now(),
      };
      setThreads((prev) => prev.map((t) => (t.id === withReply.id ? withReply : t)));
      upsertThread(withReply);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Chat failed";
      toast.error(msg);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-tight">AI Chatbot</h1>
            <p className="truncate text-xs text-muted-foreground">
              Threaded conversations, saved on this device
            </p>
          </div>
        </div>
        <UserMenu />

      </header>

      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[260px_1fr]">
        {/* Thread list */}
        <aside className="hidden flex-col border-r bg-muted/30 md:flex">
          <div className="p-3">
            <Button onClick={handleNew} className="w-full" size="sm">
              <Plus className="mr-2 h-4 w-4" /> New chat
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <ul className="space-y-1 p-2">
              {threads.map((t) => (
                <li key={t.id} className="group flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    className={cn(
                      "flex-1 truncate rounded-md px-3 py-2 text-left text-sm transition-colors",
                      t.id === activeId
                        ? "bg-background font-medium shadow-sm"
                        : "hover:bg-background/60 text-muted-foreground",
                    )}
                  >
                    {t.title || "New chat"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    aria-label="Delete thread"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </aside>

        {/* Conversation */}
        <div className="flex min-h-0 flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl p-4 md:p-6">
              {active && active.messages.length === 0 ? (
                <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/50 text-primary-foreground shadow-lg">
                    <MessageSquare className="h-7 w-7" />
                  </div>
                  <h2 className="text-lg font-semibold">How can I help today?</h2>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Ask questions, brainstorm ideas, or get help drafting anything for work.
                  </p>
                  <div className="mt-6 grid w-full max-w-md gap-2 sm:grid-cols-2">
                    {[
                      "Give me 3 icebreakers for a standup",
                      "Explain OKRs vs KPIs simply",
                      "Draft a polite decline for a meeting",
                      "Summarize this in bullets:",
                    ].map((p) => (
                      <button
                        key={p}
                        onClick={() => setInput(p)}
                        className="rounded-lg border bg-card p-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {active?.messages.map((m) => (
                    <MessageBubble key={m.id} message={m} />
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t bg-background p-3">
            <div className="mx-auto max-w-3xl">
              <div className="relative rounded-2xl border bg-card shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Message Workplace AI... (Shift+Enter for newline)"
                  className="min-h-[56px] resize-none border-0 bg-transparent pr-14 focus-visible:ring-0"
                  disabled={loading}
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="absolute bottom-2 right-2 h-9 w-9 rounded-xl"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                AI can make mistakes. Verify important information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn("min-w-0 max-w-[80%]", isUser && "text-right")}>
        {isUser ? (
          <div className="inline-block rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-left text-sm text-primary-foreground">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
