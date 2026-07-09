import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ToolShell } from "@/components/tool-shell";
import { OutputPanel } from "@/components/output-panel";
import { aiChat } from "@/lib/ai.functions";
import type { ToolKey } from "@/lib/storage";


export type ToolPageProps = {
  tool: ToolKey;
  title: string;
  description: string;
  icon: ReactNode;
  systemPrompt: string;
  /** Renders the tool's input form. Must call onChange with a serializable state object. */
  renderForm: (args: {
    state: Record<string, string>;
    setField: (key: string, value: string) => void;
  }) => ReactNode;
  /** Build the user prompt from form state. Return null to block submission. */
  buildPrompt: (state: Record<string, string>) => string | null;
  /** Suggested title for saved output. */
  suggestTitle?: (state: Record<string, string>) => string;
  ctaLabel?: string;
  defaultState?: Record<string, string>;
};

export function ToolPage({
  tool,
  title,
  description,
  icon,
  systemPrompt,
  renderForm,
  buildPrompt,
  suggestTitle,
  ctaLabel = "Generate",
  defaultState = {},
}: ToolPageProps) {
  const [state, setState] = useState<Record<string, string>>(defaultState);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (key: string, value: string) =>
    setState((s) => ({ ...s, [key]: value }));

  const handleGenerate = async () => {
    const prompt = buildPrompt(state);
    if (!prompt) {
      toast.error("Please fill in the required fields");
      return;
    }
    setLoading(true);
    try {
      const { content } = await aiChat({
        data: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        },
      });
      setOutput(content);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell title={title} description={description} icon={icon}>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="text-base">Inputs</CardTitle>
              <CardDescription>
                Fill in the details. Structured prompts produce sharper outputs.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => {
                setState(defaultState);
                setOutput("");
                toast.success("Cleared");
              }}
              title="Clear inputs and output"
              aria-label="Clear inputs and output"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderForm({ state, setField })}
            <Button onClick={handleGenerate} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> {ctaLabel}
                </>
              )}
            </Button>
          </CardContent>
        </Card>


        <OutputPanel
          tool={tool}
          output={output}
          onOutputChange={setOutput}
          loading={loading}
          suggestedTitle={suggestTitle?.(state)}
          onLoadHistory={setOutput}
        />
      </div>
    </ToolShell>
  );
}
