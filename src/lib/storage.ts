// Local-first storage for AI outputs and chat threads.
// Uses localStorage for simplicity; keeps most-recent 20 outputs per tool.

export type ToolKey = "email" | "notes" | "planner" | "research";

export type SavedOutput = {
  id: string;
  tool: ToolKey;
  title: string;
  content: string;
  createdAt: number;
  pinned?: boolean;
};

const OUTPUTS_KEY = "aiwp.outputs.v1";
const THREADS_KEY = "aiwp.chat.threads.v1";
const MAX_PER_TOOL = 20;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function loadOutputs(): SavedOutput[] {
  return safeGet<SavedOutput[]>(OUTPUTS_KEY, []);
}

export function outputsForTool(tool: ToolKey): SavedOutput[] {
  return loadOutputs()
    .filter((o) => o.tool === tool)
    .sort((a, b) => Number(b.pinned ?? 0) - Number(a.pinned ?? 0) || b.createdAt - a.createdAt);
}

export function saveOutput(o: Omit<SavedOutput, "id" | "createdAt">): SavedOutput {
  const all = loadOutputs();
  const created: SavedOutput = {
    ...o,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const next = [created, ...all];
  // Trim per-tool to MAX_PER_TOOL, but preserve pinned
  const perTool = new Map<ToolKey, SavedOutput[]>();
  for (const item of next) {
    const arr = perTool.get(item.tool) ?? [];
    arr.push(item);
    perTool.set(item.tool, arr);
  }
  const trimmed: SavedOutput[] = [];
  for (const [, arr] of perTool) {
    const pinned = arr.filter((a) => a.pinned);
    const rest = arr.filter((a) => !a.pinned).slice(0, MAX_PER_TOOL - pinned.length);
    trimmed.push(...pinned, ...rest);
  }
  safeSet(OUTPUTS_KEY, trimmed);
  return created;
}

export function deleteOutput(id: string) {
  safeSet(
    OUTPUTS_KEY,
    loadOutputs().filter((o) => o.id !== id),
  );
}

export function togglePin(id: string) {
  const all = loadOutputs().map((o) => (o.id === id ? { ...o, pinned: !o.pinned } : o));
  safeSet(OUTPUTS_KEY, all);
}

export function updateOutput(id: string, content: string) {
  const all = loadOutputs().map((o) => (o.id === id ? { ...o, content } : o));
  safeSet(OUTPUTS_KEY, all);
}

// ---- Chat threads ----

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

export function loadThreads(): ChatThread[] {
  return safeGet<ChatThread[]>(THREADS_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveThreads(threads: ChatThread[]) {
  safeSet(THREADS_KEY, threads);
}

export function upsertThread(thread: ChatThread) {
  const all = loadThreads().filter((t) => t.id !== thread.id);
  saveThreads([thread, ...all]);
}

export function deleteThread(id: string) {
  saveThreads(loadThreads().filter((t) => t.id !== id));
}
