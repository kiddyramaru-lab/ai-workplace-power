import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ToolPage } from "@/components/tool-page";

export const Route = createFileRoute("/notes")({
  component: NotesPage,
});

function NotesPage() {
  return (
    <ToolPage
      tool="notes"
      title="Meeting Notes Summarizer"
      description="Turn transcripts into decisions, actions & owners"
      icon={<FileText className="h-4 w-4" />}
      defaultState={{ title: "", audience: "Team", transcript: "" }}
      systemPrompt="You are an expert at summarizing meetings. Produce a concise, well-structured markdown summary with these sections in order: **TL;DR** (2-3 lines), **Key decisions**, **Action items** (as a table: Owner | Task | Due), **Open questions**, **Next steps**. Be faithful to the transcript; do not invent facts. If a section is empty, write '_None captured._'."
      buildPrompt={(s) => {
        if (!s.transcript?.trim()) return null;
        return [
          `Meeting: ${s.title || "(untitled)"}`,
          `Audience for summary: ${s.audience}`,
          "",
          "Transcript / raw notes:",
          s.transcript,
        ].join("\n");
      }}
      suggestTitle={(s) => s.title || "Meeting summary"}
      ctaLabel="Summarize"
      renderForm={({ state, setField }) => (
        <>
          <div className="grid gap-2">
            <Label htmlFor="title">Meeting title</Label>
            <Input
              id="title"
              placeholder="e.g. Q4 roadmap sync"
              value={state.title}
              onChange={(e) => setField("title", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Summarize for</Label>
            <Select value={state.audience} onValueChange={(v) => setField("audience", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Team", "Executives", "Clients", "Personal notes"].map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="transcript">Transcript or raw notes *</Label>
            <Textarea
              id="transcript"
              placeholder="Paste the transcript, chat log, or your rough notes..."
              value={state.transcript}
              onChange={(e) => setField("transcript", e.target.value)}
              className="min-h-[240px] font-mono text-xs"
            />
          </div>
        </>
      )}
    />
  );
}
