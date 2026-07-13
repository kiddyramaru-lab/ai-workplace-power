## Add Settings modal with Light/Dark theme toggle

### 1. Theme context (`src/lib/theme-context.tsx` — new)
- `ThemeProvider` with `theme: "light" | "dark"`, `setTheme`, `toggleTheme`.
- Reads `localStorage.getItem("theme")` on mount; defaults to `"dark"`.
- Applies by toggling the `dark` class on `document.documentElement` and persisting to localStorage.
- Export `useTheme()` hook.

### 2. Pre-hydration script (`src/routes/__root.tsx`)
- Add a small inline `<script>` in `RootShell`'s `<head>` that reads `localStorage.theme` and sets/removes the `dark` class on `<html>` before React renders (avoids flash).
- Remove the hardcoded `className="dark"` on `<html>` — the script manages it.
- Wrap the app in `<ThemeProvider>` inside `RootComponent`.

### 3. Light theme tokens (`src/styles.css`)
- Currently `:root, .dark` share the same dark values. Split into:
  - `:root { ... light values ... }` — white/near-white background, dark foreground, subtle gray borders, same pink primary (`--primary` stays vibrant pink), light sidebar.
  - `.dark { ... existing black + pink values ... }` unchanged.
- Add smooth transitions on `body` (`transition: background-color 200ms, color 200ms`).
- Keep `@custom-variant dark (&:is(.dark *))` — already class-based.

### 4. Settings dialog (`src/components/settings-dialog.tsx` — new)
- Mirrors `HelpDialog` structure/styling (shadcn `Dialog`, gear icon header, close via X + outside click already built-in).
- Section titled **Appearance**.
- Segmented control: two buttons (Sun / Light, Moon / Dark). Active button uses pink (`bg-primary text-primary-foreground`); inactive uses muted. Proper `role="radiogroup"`, `aria-checked`, keyboard accessible.
- Description text: "Choose how Workmate AI looks. Your preference is saved locally."

### 5. Sidebar entry (`src/components/app-sidebar.tsx`)
- Add a `SettingsDialog` trigger in `SidebarFooter` above/next to the Help item, using the `Settings` (gear) lucide icon. Same pink accent styling as the Help button (`text-primary`).

### 6. Verification
- Confirm existing black+pink dark mode looks identical (unchanged `.dark` tokens).
- Confirm light mode readable across sidebar, tool shell, modals, output panel, chat, email generator.
- No changes to storage, chat ephemerality, email clear button, help dialog, top bar, or IndexedDB logic.

### Files
- **New:** `src/lib/theme-context.tsx`, `src/components/settings-dialog.tsx`
- **Edited:** `src/routes/__root.tsx`, `src/styles.css`, `src/components/app-sidebar.tsx`
