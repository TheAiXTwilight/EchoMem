# UI/UX Specification — EchoMem v1

v1 UI is a **browser-based chat app** served from Vite at `http://localhost:5173`.
There is no native desktop shell, no tray icon, no sliding overlay — those are
all post-v1. The goal: clean, dark, responsive, immediately understandable to
a non-technical user.

## Screens

### 1. Lock screen
- Centered card on near-black (`#09090b`) background
- Lock icon, "EchoMem locked" title
- Password field + "Unlock" button
- Footer text: "All data is AES-256-GCM encrypted on disk. Nothing leaves localhost."
- Enter key submits

### 2. Chat (main) screen
- Header bar with:
  - Pulsing green dot = capture running (red if error)
  - App name "EchoMem"
  - Version tag `local · encrypted · v0.1`
  - Right side: Start capture / Stop buttons, Settings gear, Lock button
- Scrollable message column (max-width 3xl, centered), bubbles:
  - User: violet bubble, right-aligned
  - Assistant: dark-zinc bubble, left-aligned; includes citation chips
    (app name · HH:MM) under the answer
- Status text italic when in `listening… / thinking… / speaking…` states
- Composer bar:
  - Round mic button (violet → rose when listening)
  - Pill text input with placeholder that changes with state
  - Round Send button
- Keyboard: Enter sends, Shift+Enter newline

### 3. Settings popover (small, opened from gear)
- Wake phrase text field (default "Hey Echo")
- Capture interval slider (1–10s, default 3)
- Voice gender radio (male / female) — stub in v1 if only one voice ships
- Version + build info
- "Save" button

## States

| State | Trigger | UI |
|---|---|---|
| locked | app launch / `/auth/lock` / failed unlock | Lock screen |
| idle | unlocked, no query | Mic button violet, composer placeholder "Ask EchoMem anything…" |
| listening | mic button pressed OR wake word detected | Mic button rose, waveform animation, placeholder "Listening…" |
| thinking | query sent, waiting for LLM | Italic "thinking…" status line |
| speaking | TTS streaming | Italic "speaking…" + TTS progress |
| error | model/network crash | Red toast + "retry" option |

Waveform animation in v1 is a CSS-animated 5-bar placeholder (see
`src/index.css`). We wire it to real mic amplitude post-v1 if time allows.

## Design system

Tailwind + shadcn-style but no shadcn dependency in v1 (to avoid setup time).
- Font: system-ui stack (already default)
- Background: `bg-zinc-950` (#09090b)
- Card/bubble: `bg-zinc-900` + `border-zinc-800`
- Accent: violet-600/500 (user bubble, primary buttons)
- Danger: rose-600 (mic active)
- Success: emerald-400 (capture-running dot)
- Muted text: `text-zinc-400` / `text-zinc-500`
- Rounded corners: 2xl on bubbles, full on buttons
- No drop-shadow overkill; flat and readable

## Interaction rules

- Never block the UI thread waiting for a model call; show "thinking…"
- Mic button toggles: press once → start listening (for push-to-talk); wake word
  auto-triggers listening without a press.
- While speaking, clicking anywhere cancels TTS mid-sentence.
- Lock button always visible top-right; click → modal "Lock EchoMem now? Yes/No"
  only if capture is running; otherwise locks immediately.
- Capture Start/Stop affect the background loop only — you can still query while
  capture is stopped (it queries existing memory).

## Deferred to post-v1
- Cinematic Siri-style sliding overlay with blur
- System tray icon with color states
- Guest-mode one-click switch
- Hidden timeline view (day-by-day history browser)
- Notifications (plyer)
- Responsive design for < 640px phone widths (v1 is desktop only — we demo on a laptop)
- Accessibility audit (screen-reader labels, keyboard nav)
