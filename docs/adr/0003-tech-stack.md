# ADR 0003 — Tech Stack

- **Status:** Accepted (v1)
- **Date:** 2026-08-12

## Decision summary
- **Backend:** Python 3.11 + FastAPI + Uvicorn.
- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS. No shadcn/ui
  dependency for v1 (we hand-style the few components we need to save setup time);
  shadcn can be added post-v1.
- **No Electron in v1.** UI runs in a browser tab at http://localhost:5173. We
  will tell users to bookmark it. A Tauri/Electron wrapper is post-v1 only if
  we have extra time.
- **AI runtime:** Ollama for LLM + VLM; faster-whisper for STT; fastembed for
  embeddings; Piper for TTS; openWakeWord for wake.
- **Storage:** SQLite + LanceDB (embedded, no server).
- **OS target for v1:** Windows 10/11. macOS and Linux are best-effort for dev.
- **Tests:** pytest + Vitest smoke tests only.
- **Lint/format:** Black, Ruff, Prettier run locally; no CI/CD in v1.

## Rationale
- **Python** is the natural substrate for all the on-device AI libraries
  (faster-whisper, Ollama Python client, fastembed, openWakeWord, Piper, mss,
  sounddevice, cryptography). FastAPI is the simplest way to expose them as
  REST+WS with minimal code.
- **React + Vite + TS + Tailwind** is the fastest path to a polished,
  low-bugs dark UI in < 1 week for a team that already knows React basics.
- **Skipping Electron** saves ~1 week of build-signing-installer pain and ~150 MB
  of installer. A browser tab is good enough for the October demo. If the UI
  needs to feel more native in the last buffer week we can add a tray icon
  with pystray that opens the browser tab.
- **Windows-only demo** keeps window-capture code to a single tested code path.
  Mac/Linux can follow post-submission.

## Rejected alternatives
- **Django / Flask:** too heavy / too manual for what FastAPI gives out of the
  box (async, WS, Pydantic, docs).
- **Electron in v1:** weeks of build/OS-notarization work for marginal UX gain.
- **Svelte / Vue / Solid:** team already knows React; switching would cost time.
- **Vanilla JS UI:** false economy; Tailwind + React is faster for a polished UI.
- **Next.js:** overkill for a localhost app that has no SSR or server-side
  routing needs.

## Post-v1
- Tray icon via pystray + desktop notifications via plyer.
- Optional Tauri shell for a native-feeling app (smaller binary than Electron).
- shadcn/ui components and proper dark-mode design tokens.
- CI/CD (GitHub Actions lint + test), pre-commit hooks.
- Automated E2E tests via Playwright.
