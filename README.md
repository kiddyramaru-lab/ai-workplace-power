# Workmate AI — Workplace Productivity Assistant

A privacy‑first, browser‑based office productivity assistant. Draft emails, summarize meetings, plan tasks, do quick research, and chat with an AI — all with a modern black & pink dark UI.

## Project overview

Workmate AI is a local‑first web app for professionals. Your generated outputs live in your browser (IndexedDB) so nothing leaves your device by default. Optional cloud sync is available via Lovable Cloud if you ever want your history across devices. The chatbot is intentionally **ephemeral** — no messages are ever stored.

## Features

- **Smart Email Generator** — Structured inputs (recipient, tone, length, key points) with a pink **Clear** icon to reset the tool in one click.
- **Meeting Notes Summarizer** — Turn raw notes into crisp summaries, decisions, and action items.
- **AI Task Planner** — Break goals into prioritized, actionable steps.
- **AI Research Assistant** — Ask a question, get an organized brief with sources you can verify.
- **Ephemeral Chatbot** — Zero persistence. Opens with a friendly intro from the AI, supports Enter‑to‑send, live typing indicator. Nothing is saved to disk or the cloud.
- **Local‑first Output History** — Last 20 outputs per tool are stored locally with pin / edit / delete / copy. Optional cloud sync when you opt in.
- **Top bar** — Personalized welcome message, quick search, and persistent privacy notice.
- **Black & Pink dark theme** — Modern SaaS aesthetic with pink accents (`--primary`) on a near‑black surface.
- **Help panel** — Sidebar "Help" button opens a friendly guide with usage tips and privacy notes.
- **Responsive sidebar navigation** — Collapsible on desktop, works on mobile.
- **Responsible AI disclaimer** — Reminders throughout the UI to review AI output before sending.

## Tech stack

- **React 19** + **TypeScript**
- **TanStack Start** & **TanStack Router** (file‑based routing, SSR‑ready)
- **Tailwind CSS v4** with shadcn/ui primitives
- **IndexedDB via Dexie.js** for local‑first storage
- **Supabase** (via Lovable Cloud) for optional auth & cloud sync
- **Lovable AI Gateway** for model access
- **Vite 7** build tooling

## Getting started

Prerequisites: Node.js 20+ and npm (or bun).

```bash
# 1. Clone
git clone <your-repo-url>
cd <project-folder>

# 2. Install dependencies
npm install

# 3. Configure environment
# Copy .env and fill in required values (Lovable Cloud provisions these automatically).

# 4. Run the dev server
npm run dev
```

The app runs on `http://localhost:8080` by default.

### Useful scripts

| Command             | What it does                            |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Start the Vite dev server               |
| `npm run build`     | Production build                        |
| `npm run build:dev` | Development‑mode build (source maps)    |
| `npm run preview`   | Preview the production build locally    |
| `npm run lint`      | Run ESLint                              |
| `npm run format`    | Run Prettier                            |

## Privacy

- Outputs are stored in **your browser** (IndexedDB). Clearing site data removes them.
- The chatbot has **no persistence**: refresh or navigate away and the conversation is gone.
- Cloud sync is **off by default** and opt‑in.

## License

Proprietary — all rights reserved.
