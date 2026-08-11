# EchoMem v1 Scope Contract

**Status:** Approved, frozen 2026-08-12
**Submission deadline:** October 2026
**Development window:** ~6 weeks (Aug 12 → Sep 22), with Sep 23 → Oct 15 as bug-fix /
guide-feedback / formatting buffer.

This document is the *law* for v1. If a feature is not listed below in "In v1",
it does not get built in v1. Everything else lives in `FUTURE_WORK.md` and in
the module stubs already created under `backend/`.

---

## 1. In v1 (must ship for October demo)

### 1.1 Capture
- [x] **Screen capture via `mss`** on a configurable interval (default 3s idle,
      1s during detected activity).
- [x] **pHash perceptual dedup** — skip frames whose pHash distance to the
      previous frame is below a threshold (user is staring, not scrolling).
- [x] **Window title + foreground app detection on Windows** via `pygetwindow` /
      `win32gui`. Mac/Linux detection documented as `NotImplementedError` for v1.
- [x] **No ambient audio capture in v1.** Voice input happens *only* during an
      active wake-word → STT session.

### 1.2 AI pipeline
- [x] **Moondream2 1.8B-instruct Q4_K_M via Ollama** — called once per captured
      frame:
      1. Produces a 1–2 line plain-English **caption** of the screen.
      2. Produces a binary **privacy verdict** (STORE / DROP) given the caption +
         window title + a regex/keyword blocklist (password, banking, OTP,
         incognito, credit card, adult).
- [x] **bge-small-en-v1.5 via fastembed (ONNX)** — embeds captions into
      384-dim vectors.
- [x] **Qwen2.5-0.5B-instruct Q4_K_M via Ollama** — RAG answer synthesis given a
      user question + top-k retrieved captions.
- [x] **faster-whisper `tiny.en`** — STT for active voice queries.
- [x] **Piper TTS** — one English voice (choice of male/female in settings) for
      speaking answers back.
- [x] **openWakeWord** — one custom wake phrase (default `Hey Echo`, user can
      change in settings).
- [x] *Moondream runs ONLY during capture (background), not during queries.
      Qwen is the ONLY model loaded at query time. This is how we fit in 8 GB.*

### 1.3 Storage & privacy
- [x] **SQLite** for metadata (id, timestamp, app, title, caption,
      phash, encrypted_image_path).
- [x] **LanceDB** for vector search over caption embeddings (flat index, no
      IVF-PQ in v1 — fast enough for <50k items).
- [x] **AES-256-GCM at-rest encryption** with one master key derived from a
      user-supplied password via PBKDF2-HMAC-SHA256 (100k iterations).
      Encrypted screenshots + DB shards written to `data/db/`.
- [x] **Hard localhost-only guarantee** — no outbound HTTP in code; README
      documents optional Windows firewall rule for belt-and-suspenders.
- [x] **Auto-cleanup**: raw WebP thumbnails older than 48h are discarded;
      captions + embeddings kept permanently.

### 1.4 Interfaces
- [x] **FastAPI backend** (`127.0.0.1:8000`) with endpoints:
      `GET  /health`
      `POST /auth/unlock`        (send master password, derive key)
      `POST /auth/lock`
      `GET  /status`             (capture on/off, model loaded, RAM usage)
      `POST /capture/start`
      `POST /capture/stop`
      `WS   /listen`             (stream mic → wake-word → STT → pipeline → TTS)
      `POST /query`              (text-in → text-out RAG, for UI textbox)
- [x] **React + Vite + TS + Tailwind UI** on `http://localhost:5173`:
      - Password screen on first load
      - Dark chat-style UI (big mic button, user/assistant bubbles, citation chips
        with app name + timestamp, simple waveform while listening)
      - Settings gear (wake phrase, voice gender, capture interval)
      - Lock icon button (manually lock memory)
- [x] **No tray icon, no native app, no PyInstaller in v1.** Runs via uvicorn +
      `npm run dev`. Demo off dev servers.

### 1.5 Non-functional
- [x] Idle RAM ≤ 600 MB (capture loop only, no query in flight)
- [x] End-to-end answer latency ≤ 12s p95 on 8 GB CPU
- [x] Wake-word false accept < 5/day for v1 (we'll measure)
- [x] Cold start < 10s
- [x] Recall@5 ≥ 65% on internal 100-question benchmark

### 1.6 Evaluation & paper (must ship)
- [x] 100-question internal memory benchmark (each team member contributes
      ~33 questions with ground-truth timestamps against their own captured data).
- [x] Metrics reported: Recall@5, Recall@10, MRR, latency p50/p95, idle+active
      RAM, disk per day of use, privacy-gate TP/FP on 50 sensitive + 50 normal
      screenshots.
- [x] 6–8 page paper in LaTeX (Intro, Related Work, System Design,
      Implementation, Evaluation, Discussion/Limitations/Future Work, Conclusion).
- [x] 5-minute live demo, rehearsed ≥ 3x, with a backup pre-recorded video.

---

## 2. Explicitly DEFERRED to post-October (do NOT build in v1)

These features are documented in `FUTURE_WORK.md`, and stub module files exist
under `backend/` (e.g., `backend/unlock/voiceprint.py`, `backend/models/lora.py`,
`backend/actions/os_controls.py`) so they can be picked up after submission.
Building any of these before October is scope creep and jeopardizes graduation.

- 3-factor graduated unlock (voiceprint ECAPA-TDNN + 3-digit anti-replay + master
  password levels)
- Optional face + eye-blink unlock via FaceNet + OpenCV
- QLoRA LoRA personalisation adapter (10–30 MB) trained idle-time on user data
- DP-SGD privacy for personalisation (Opacus)
- OS actions: open apps/files/URLs, volume/brightness/media/Wi-Fi/Bluetooth,
  approved Slack/WhatsApp/Telegram/Teams messages, reminders/notifications,
  foreground window control
- Continuous ambient audio capture + speaker diarisation
- Cross-platform tray icon (pystray), guest mode, native desktop notifications
  (plyer), native PyInstaller installers for Win/Mac/Linux
- Performance profiles (Eco/Balanced/Performance)
- Envelope encryption with per-day rotating wrapped keys, 4 KB block padding,
  random-UUID filenames, block reshuffling on each launch, mlock-locked RAM
- IVF-PQ vector index (use flat index in v1)
- Semantic triple store (subject-relation-object) for long-term memory
  consolidation
- Nightly Phi consolidation / summarisation job (APScheduler kept for later)
- Cinematic Jarvis-style sliding overlay UI (simple browser UI in v1)
- Cinematic/demo video (record a 3-minute OBS clip for v1)
- Outbound integrations (Slack/WhatsApp/Teams)
- Mac / Linux window-capture parity
- CI/CD (pre-commit, GitHub Actions) — if time permits in buffer week only
- Test suites beyond a handful of smoke tests — if time permits in buffer week

---

## 3. Rule of thumb when deciding

If a new idea arrives during a sprint:

1. If it is required for the demo to work end-to-end → do it.
2. If it improves demo polish *with < 1 day of work* → schedule in Week 4.
3. Otherwise → write it in `docs/meetings/YYYY-MM-DD.md` and add to
   `FUTURE_WORK.md` AFTER submission.

When in doubt, cut. A working smaller thing beats a broken bigger thing.

---

## 4. Sign-off

To be signed at Week 1 Friday demo:

- [ ] Member 1: ____________________ Date: ____________
- [ ] Member 2: ____________________ Date: ____________
- [ ] Member 3: ____________________ Date: ____________
- [ ] Guide:    ____________________ Date: ____________
