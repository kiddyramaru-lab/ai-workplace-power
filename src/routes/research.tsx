import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolPage } from "@/components/tool-page";

export const Route = createFileRoute("/research")({
  component: ResearchPage,
});

function ResearchPage() {
  return (
    <ToolPage
      tool="research"
      title="AI Research Assistant"
      description="Structured briefs on any topic"
      icon={<Search className="h-4 w-4" />}
      defaultState={{ topic: "", audience: "General business", depth: "Standard", questions: "" }}
      systemPrompt="You are a senior research analyst. Produce a well-structured markdown brief with: **Executive summary** (3-5 bullets), **Background**, **Key facts & data**, **Pros / Cons or Opportunities / Risks** (as a two-column table), **Notable examples**, **Open questions to investigate further**. Be precise; flag anything speculative. If you're not sure about a specific number or date, say so instead of guessing. Do not fabricate citations."
      buildPrompt={(s) => {
        if (!s.topic?.trim()) return null;
        return [
          `Topic: ${s.topic}`,
          `Intended audience: ${s.audience}`,
          `Depth: ${s.depth}`,
          `Specific questions to cover: ${s.questions || "(none)"}`,
        ].join("\n");
      }}
      suggestTitle={(s) => s.topic.slice(0, 60) || "Research brief"}
      ctaLabel="Research"
      renderForm={({ state, setField }) => (
        <>
          <div className="grid gap-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g. Impact of AI on customer support in SaaS"
              value={state.topic}
              onChange={(e) => setField("topic", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Audience</Label>
              <Select value={state.audience} onValueChange={(v) => setField("audience", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["General business", "Technical", "Executive / Board", "Marketing", "Sales"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Depth</Label>
              <Select value={state.depth} onValueChange={(v) => setField("depth", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Quick overview", "Standard", "Deep dive"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="questions">Specific questions (optional)</Label>
            <Textarea
              id="questions"
              placeholder={"- What are the leading vendors?\n- What ROI do teams report?"}
              value={state.questions}
              onChange={(e) => setField("questions", e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </>
      )}
    />
  );
}
