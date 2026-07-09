## Changes

### 1. Sidebar – Help entry
- Add a "Help" button to `src/components/app-sidebar.tsx` in `SidebarFooter` (visible in both expanded and icon-collapsed states, with tooltip).
- New `src/components/help-dialog.tsx`: shadcn `Dialog` styled with the black/pink theme. Contents:
  - Title "How can we help?"
  - Short intro of the tools (Email Generator, Chatbot, Output History).
  - Step-by-step tips ("Type your prompt → Generate → Copy or Edit").
  - Privacy reminder about local-first storage.
  - "Got it" close button (pink primary).
- Wire open state in the sidebar via `useState`.

### 2. Smart Email Generator – Clear button
- Extend `src/components/tool-page.tsx` with an optional reset affordance: add a pink-accented `Trash2` icon button in the Inputs card header that resets form state to `defaultState` AND clears the current `output`.
- Show a small confirmation toast ("Cleared"). Because it lives in `ToolPage`, it will appear on Email; keep behavior generic so it doesn't harm the other tools (or gate it with a `showClear` prop defaulting to true for Email only — will default to true everywhere since it's a benign UX addition and matches the spec of "seamless restart").

### 3. Chatbot – Zero persistence + intro + polish
Rewrite `src/routes/chat.tsx`:
- Remove all `loadThreads` / `upsertThread` / `deleteThread` / `ChatThread` usage. Chat state lives only in React state (`useState<ChatMessage[]>`), reset on mount/navigation/refresh.
- Remove the thread sidebar (threads list, New chat, Delete). Replace with a single conversation view.
- On mount, seed messages with an assistant intro:  
  "Hi there! 👋 I'm your Workmate AI assistant. I can help you draft emails, summarize text, brainstorm ideas, and more. What can I help with today?"
- Keep Enter-to-send / Shift+Enter newline. Keep typing indicator (already present via `Loader2` "Thinking…"); refine as pink-tinted animated dots for a more conversational feel.
- Style: user bubbles = dark surface with subtle border; assistant text = pink left accent bar / pink prose accents on dark background (per existing theme tokens).
- Add a subtle inline note at the top of the chat: "Chat messages are not saved – this keeps your conversations private and temporary."
- Leave `src/lib/storage.ts` chat helpers in place but unused by the route (no breaking change to other code). Do not write chat data to IndexedDB from anywhere.

### 4. README.md
Create `README.md` at project root with:
- Project overview (privacy-first browser productivity assistant).
- Features implemented (local IndexedDB output storage, Smart Email Generator with clear button, ephemeral chatbot with intro, top bar with welcome/search/privacy, black & pink theme, help panel in sidebar, optional cloud sync groundwork).
- Tech stack (React, TypeScript, Tailwind CSS v4, TanStack Start/Router, Dexie.js/IndexedDB, Supabase via Lovable Cloud, Lovable AI Gateway).
- Setup instructions (`git clone`, `npm install`, `npm run dev`, env note).

### 5. Preserved / not touched
- Top bar (welcome, search, privacy notice), black & pink theme tokens, IndexedDB output storage for the 4 non-chat tools, existing tool routes (Notes, Planner, Research), auth modal code (kept but Help does not surface login CTA per request "No user accounts or login features anywhere in the UI" — I'll also hide the `UserMenu` from the chat header to comply; other tool headers already use `UserMenu` — please confirm whether to hide it globally).

## Technical notes
- No DB migration.
- Files added: `src/components/help-dialog.tsx`, `README.md`.
- Files edited: `src/components/app-sidebar.tsx`, `src/components/tool-page.tsx`, `src/routes/chat.tsx`.
- Typecheck after changes.

## Open question
The spec says "No user accounts or login features anywhere in the UI," but the current app has a `UserMenu` (sign-in) in every tool header for optional cloud sync. Should I remove `UserMenu` from all headers, or leave it and only ensure Help/Chat don't mention login?
