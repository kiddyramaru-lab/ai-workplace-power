import { createFileRoute } from "@tanstack/react-router";
import { ListTodo } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolPage } from "@/components/tool-page";

export const Route = createFileRoute("/planner")({
  component: PlannerPage,
});

function PlannerPage() {
  return (
    <ToolPage
      tool="planner"
      title="AI Task Planner"
      description="Break projects into prioritized, time-boxed tasks"
      icon={<ListTodo className="h-4 w-4" />}
      defaultState={{ goal: "", deadline: "", hoursPerDay: "4", context: "" }}
      systemPrompt="You are a productivity coach and project planner. Given a goal, deadline, and available hours, produce a realistic markdown plan: **Overview** (1-2 lines), **Milestones** (numbered, with target dates), **Daily plan** (table: Day | Focus | Tasks | Est. hours), **Risks & mitigations**, **Definition of done**. Keep tasks concrete, verb-first, and time-boxed. Don't overload days beyond available hours."
      buildPrompt={(s) => {
        if (!s.goal?.trim()) return null;
        return [
          `Goal: ${s.goal}`,
          `Deadline: ${s.deadline || "(flexible)"}`,
          `Available hours/day: ${s.hoursPerDay}`,
          `Context: ${s.context || "(none)"}`,
        ].join("\n");
      }}
      suggestTitle={(s) => s.goal.slice(0, 60) || "Task plan"}
      ctaLabel="Build plan"
      renderForm={({ state, setField }) => (
        <>
          <div className="grid gap-2">
            <Label htmlFor="goal">Goal / project *</Label>
            <Textarea
              id="goal"
              placeholder="e.g. Ship v1 of the customer onboarding flow"
              value={state.goal}
              onChange={(e) => setField("goal", e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={state.deadline}
                onChange={(e) => setField("deadline", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Hours/day</Label>
              <Select value={state.hoursPerDay} onValueChange={(v) => setField("hoursPerDay", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["1", "2", "4", "6", "8"].map((v) => (
                    <SelectItem key={v} value={v}>{v} hours</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="context">Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="Team, constraints, dependencies, prior work..."
              value={state.context}
              onChange={(e) => setField("context", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </>
      )}
    />
  );
}
