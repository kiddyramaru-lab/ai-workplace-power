import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Send, User, Bot, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { aiChat } from "@/lib/ai.functions";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

const SYSTEM_PROMPT =
  "You are Workmate AI, a helpful, concise assistant for workplace productivity. Answer clearly in markdown. If asked something you don't know, say so instead of guessing. Keep replies focused and skimmable.";

const INTRO_MESSAGE =
  "Hi there! 👋 I'm your Workmate AI assistant. I can help you draft emails, summarize text, brainstorm ideas, and more. What can I help with today?";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: crypto.randomUUID(), role: "assistant", content: INTRO_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, loading]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const { content } = await aiChat({
        data: {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...next.map((m) => ({ role: m.role, content: m.content })),
          ],
        },
      });
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content },
      ]);
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
            <h1 className="truncate text-sm font-semibold leading-tight">Workmate AI Chat</h1>
            <p className="truncate text-xs text-muted-foreground">
              Private &amp; temporary — nothing is saved
            </p>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-4 md:p-6">
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>
                Chat messages are not saved — this keeps your conversations private and temporary.
              </span>
            </div>

            <div className="space-y-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {loading && <TypingIndicator />}
            </div>
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
                placeholder="Message Workmate AI... (Shift+Enter for newline)"
                className="min-h-[56px] resize-none border-0 bg-transparent pr-14 focus-visible:ring-0"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="icon"
                className="absolute bottom-2 right-2 h-9 w-9 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary/15 text-primary",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn("min-w-0 max-w-[80%]", isUser && "text-right")}>
        {isUser ? (
          <div className="inline-block rounded-2xl rounded-tr-sm bg-secondary px-4 py-2.5 text-left text-sm text-secondary-foreground border border-border">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="rounded-2xl rounded-tl-sm border-l-2 border-primary bg-card/60 px-4 py-2.5">
            <div className="prose prose-sm prose-invert max-w-none prose-a:text-primary prose-strong:text-foreground">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border-l-2 border-primary bg-card/60 px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
      </div>
    </div>
  );
}
