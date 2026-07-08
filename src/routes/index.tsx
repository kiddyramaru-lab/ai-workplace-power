import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListTodo,
  Search,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  HardDrive,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserMenu } from "@/components/user-menu";


export const Route = createFileRoute("/")({
  component: Dashboard,
});

const tools = [
  {
    to: "/email" as const,
    icon: Mail,
    title: "Smart Email Generator",
    desc: "Draft polished, on-tone emails from a few bullet points.",
    accent: "from-blue-500/15 to-blue-500/0 text-blue-600",
  },
  {
    to: "/notes" as const,
    icon: FileText,
    title: "Meeting Notes Summarizer",
    desc: "Turn raw transcripts into decisions, actions, and owners.",
    accent: "from-emerald-500/15 to-emerald-500/0 text-emerald-600",
  },
  {
    to: "/planner" as const,
    icon: ListTodo,
    title: "AI Task Planner",
    desc: "Break down projects into prioritized, time-boxed tasks.",
    accent: "from-amber-500/15 to-amber-500/0 text-amber-600",
  },
  {
    to: "/research" as const,
    icon: Search,
    title: "AI Research Assistant",
    desc: "Get structured briefs on any topic, with pros, cons & sources.",
    accent: "from-fuchsia-500/15 to-fuchsia-500/0 text-fuchsia-600",
  },
  {
    to: "/chat" as const,
    icon: MessageSquare,
    title: "AI Chatbot",
    desc: "Threaded conversations with memory of past messages.",
    accent: "from-primary/15 to-primary/0 text-primary",
  },
];

function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">Dashboard</h1>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <section className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-3 rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-10">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Workplace AI
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
              Your AI-powered productivity workspace
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Draft emails, summarize meetings, plan your week, and research faster —
              all in one clean, local-first workspace. Every output is editable, saved
              on your device, and yours to keep.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <Badge icon={HardDrive}>Local-first storage</Badge>
              <Badge icon={Zap}>Powered by Lovable AI</Badge>
              <Badge icon={ShieldCheck}>Review before sending</Badge>
            </div>
          </div>

          <h3 className="mb-4 text-lg font-semibold">Tools</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => (
              <Link key={t.to} to={t.to} className="group">
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <CardHeader>
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${t.accent}`}
                    >
                      <t.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="flex items-center justify-between text-base">
                      {t.title}
                      <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </CardTitle>
                    <CardDescription>{t.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Responsible AI notice</p>
            <p className="mt-1">
              Generated content may be inaccurate, biased, or out of date. Always review and
              edit before using — especially for anything sent to customers, colleagues, or
              regulators. Outputs are saved only on this device unless you export them.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function Badge({ icon: Icon, children }: { icon: typeof Sparkles; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 font-medium">
      <Icon className="h-3 w-3" /> {children}
    </span>
  );
}
