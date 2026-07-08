import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolPage } from "@/components/tool-page";

export const Route = createFileRoute("/email")({
  component: EmailPage,
});

function EmailPage() {
  return (
    <ToolPage
      tool="email"
      title="Smart Email Generator"
      description="Draft polished emails from bullet points"
      icon={<Mail className="h-4 w-4" />}
      defaultState={{ recipient: "", subject: "", tone: "Professional", length: "Medium", points: "" }}
      systemPrompt="You are an expert business communicator. Write clear, well-structured emails in the requested tone and length. Include a subject line at the top, then the greeting, body, and sign-off. Use plain, natural language."
      buildPrompt={(s) => {
        if (!s.points?.trim()) return null;
        return [
          `Recipient: ${s.recipient || "(unspecified)"}`,
          `Subject hint: ${s.subject || "(let me suggest)"}`,
          `Tone: ${s.tone}`,
          `Length: ${s.length}`,
          `Key points to cover:`,
          s.points,
        ].join("\n");
      }}
      suggestTitle={(s) => s.subject || `Email to ${s.recipient || "recipient"}`}
      ctaLabel="Draft email"
      renderForm={({ state, setField }) => (
        <>
          <div className="grid gap-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder="e.g. Alex, product manager at Acme"
              value={state.recipient}
              onChange={(e) => setField("recipient", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input
              id="subject"
              placeholder="Leave blank to let AI suggest"
              value={state.subject}
              onChange={(e) => setField("subject", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Tone</Label>
              <Select value={state.tone} onValueChange={(v) => setField("tone", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Professional", "Friendly", "Formal", "Direct", "Persuasive", "Apologetic"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Length</Label>
              <Select value={state.length} onValueChange={(v) => setField("length", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Short", "Medium", "Long"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="points">Key points *</Label>
            <Textarea
              id="points"
              placeholder={"- Confirm meeting Thursday at 3pm\n- Attach the Q4 report\n- Ask about the new pricing"}
              value={state.points}
              onChange={(e) => setField("points", e.target.value)}
              className="min-h-[140px]"
            />
          </div>
        </>
      )}
    />
  );
}
