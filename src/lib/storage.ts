// Local-first storage backed by IndexedDB via Dexie.
// Outputs (up to MAX_PER_TOOL per tool) and chat threads are persisted locally.
// When signed in, saves and deletes are mirrored to Supabase for cross-device sync.

import Dexie, { type Table } from "dexie";
import { supabase } from "@/integrations/supabase/client";

export type ToolKey = "email" | "notes" | "planner" | "research";

export type SavedOutput = {
  id: string;
  tool: ToolKey;
  title: string;
  content: string;
  createdAt: number;
  pinned?: boolean;
  remoteId?: string | null;
};

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

const MAX_PER_TOOL = 20;

class AiwpDB extends Dexie {
  outputs!: Table<SavedOutput, string>;
  threads!: Table<ChatThread, string>;

  constructor() {
    super("aiwp");
    this.version(1).stores({
      outputs: "id, tool, createdAt, pinned, remoteId",
      threads: "id, updatedAt",
    });
  }
}

let _db: AiwpDB | null = null;
function db(): AiwpDB {
  if (typeof window === "undefined") {
    throw new Error("Local storage is only available in the browser");
  }
  if (!_db) _db = new AiwpDB();
  return _db;
}

// ---- Outputs ----

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function outputsForTool(tool: ToolKey): Promise<SavedOutput[]> {
  if (typeof window === "undefined") return [];
  const all = await db().outputs.where("tool").equals(tool).toArray();
  return all.sort(
    (a, b) => Number(b.pinned ?? 0) - Number(a.pinned ?? 0) || b.createdAt - a.createdAt,
  );
}

async function trimTool(tool: ToolKey) {
  const all = await outputsForTool(tool);
  const pinned = all.filter((o) => o.pinned);
  const unpinned = all.filter((o) => !o.pinned);
  const keep = Math.max(0, MAX_PER_TOOL - pinned.length);
  const overflow = unpinned.slice(keep);
  if (overflow.length) {
    await db().outputs.bulkDelete(overflow.map((o) => o.id));
    // Best-effort remote cleanup for overflow items linked to remote rows.
    const uid = await currentUserId();
    if (uid) {
      const remoteIds = overflow.map((o) => o.remoteId).filter((x): x is string => !!x);
      if (remoteIds.length) {
        await supabase.from("outputs").delete().in("id", remoteIds);
      }
    }
  }
}

export async function saveOutput(
  o: Omit<SavedOutput, "id" | "createdAt">,
): Promise<SavedOutput> {
  const created: SavedOutput = {
    ...o,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    remoteId: null,
  };
  await db().outputs.put(created);

  // Mirror to cloud if signed in
  const uid = await currentUserId();
  if (uid) {
    const { data, error } = await supabase
      .from("outputs")
      .insert({
        user_id: uid,
        tool_name: created.tool,
        title: created.title,
        content: created.content,
        pinned: !!created.pinned,
        created_at: new Date(created.createdAt).toISOString(),
      })
      .select("id")
      .single();
    if (!error && data) {
      created.remoteId = data.id;
      await db().outputs.put(created);
    }
  }

  await trimTool(created.tool);
  return created;
}

export async function deleteOutput(id: string) {
  const row = await db().outputs.get(id);
  await db().outputs.delete(id);
  if (row?.remoteId) {
    const uid = await currentUserId();
    if (uid) await supabase.from("outputs").delete().eq("id", row.remoteId);
  }
}

export async function togglePin(id: string) {
  const row = await db().outputs.get(id);
  if (!row) return;
  const next = { ...row, pinned: !row.pinned };
  await db().outputs.put(next);
  if (next.remoteId) {
    const uid = await currentUserId();
    if (uid) await supabase.from("outputs").update({ pinned: next.pinned }).eq("id", next.remoteId);
  }
}

export async function updateOutput(id: string, content: string) {
  const row = await db().outputs.get(id);
  if (!row) return;
  const next = { ...row, content };
  await db().outputs.put(next);
  if (next.remoteId) {
    const uid = await currentUserId();
    if (uid) await supabase.from("outputs").update({ content }).eq("id", next.remoteId);
  }
}

// ---- Sync ----

const DAY = 24 * 60 * 60 * 1000;

/**
 * Two-way merge on login. Uploads local rows that have no remoteId, and
 * downloads any remote rows from the last 30 days that aren't already local.
 * Dedupes by (content, createdAt-second precision).
 */
export async function syncOnLogin(userId: string) {
  const since = new Date(Date.now() - 30 * DAY).toISOString();

  const { data: remoteRows, error } = await supabase
    .from("outputs")
    .select("id, tool_name, title, content, pinned, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const local = await db().outputs.toArray();
  const dedupeKey = (content: string, createdAt: number) =>
    `${content}::${Math.floor(createdAt / 1000)}`;
  const seenKeys = new Set(local.map((l) => dedupeKey(l.content, l.createdAt)));

  // 1) Pull remote → local for anything not already present locally.
  const toAdd: SavedOutput[] = [];
  const remoteById = new Map<string, (typeof remoteRows)[number]>();
  for (const r of remoteRows ?? []) {
    remoteById.set(r.id, r);
    const createdAt = new Date(r.created_at).getTime();
    const key = dedupeKey(r.content, createdAt);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    toAdd.push({
      id: crypto.randomUUID(),
      tool: r.tool_name as ToolKey,
      title: r.title ?? "",
      content: r.content,
      createdAt,
      pinned: !!r.pinned,
      remoteId: r.id,
    });
  }
  if (toAdd.length) await db().outputs.bulkPut(toAdd);

  // 2) Push local → remote for anything without a remoteId.
  const unsynced = local.filter((l) => !l.remoteId);
  for (const l of unsynced) {
    const { data, error: insertErr } = await supabase
      .from("outputs")
      .insert({
        user_id: userId,
        tool_name: l.tool,
        title: l.title,
        content: l.content,
        pinned: !!l.pinned,
        created_at: new Date(l.createdAt).toISOString(),
      })
      .select("id")
      .single();
    if (!insertErr && data) {
      await db().outputs.put({ ...l, remoteId: data.id });
    }
  }

  // 3) Attach remoteIds to any local rows that matched a remote by content+ts.
  for (const l of local) {
    if (l.remoteId) continue;
    for (const r of remoteRows ?? []) {
      const rCreated = new Date(r.created_at).getTime();
      if (r.content === l.content && Math.floor(rCreated / 1000) === Math.floor(l.createdAt / 1000)) {
        await db().outputs.put({ ...l, remoteId: r.id });
        break;
      }
    }
  }

  const tools: ToolKey[] = ["email", "notes", "planner", "research"];
  await Promise.all(tools.map((t) => trimTool(t)));
}

/** Detach remote links on logout; keep local data. */
export async function clearRemoteLinks() {
  const all = await db().outputs.toArray();
  const patched = all.filter((o) => o.remoteId).map((o) => ({ ...o, remoteId: null }));
  if (patched.length) await db().outputs.bulkPut(patched);
}

// ---- Chat threads ----

export async function loadThreads(): Promise<ChatThread[]> {
  if (typeof window === "undefined") return [];
  const all = await db().threads.toArray();
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsertThread(thread: ChatThread) {
  await db().threads.put(thread);
}

export async function deleteThread(id: string) {
  await db().threads.delete(id);
}
