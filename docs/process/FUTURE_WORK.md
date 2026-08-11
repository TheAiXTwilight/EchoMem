# EchoMem Future Work (Post-October 2026)

Every feature originally designed for EchoMem lives here. None of them are
cancelled — they are queued for after we ship the October MVP and paper. The
module stubs under `backend/` are already named so picking this up is a matter
of filling in code, not re-architecting.

Priority order is roughly top-to-bottom within each category.

---

## F1. Security & Unlock

- **Three-factor graduated unlock**
  - Level 1 (wake word → OS biometric/password): quick queries/open/reminders,
    auto-lock 2 min
  - Level 2 (+voiceprint ECAPA-TDNN with random 3-digit anti-replay challenge):
    full memory/timeline, auto-lock 5 min
  - Level 3 (+secondary master password): settings/training/messages/wipe,
    auto-lock 1 min
- **Optional face + eye-blink unlock** via FaceNet (facenet-pytorch, ~90 MB) with
  OpenCV eye-blink detection to defeat photo spoofs. Only offered when a webcam
  is detected; never replaces master password.
- **Envelope encryption** upgrade: per-day rotating wrapped data keys sealed to
  OS keychain (Windows Credential Manager / macOS Keychain / Linux Secret
  Service) + binary hash binding.
- **Fixed 4 KB blocks** padded to uniform size with random-UUID filenames in
  random directory order; encrypted per-day map tracks block order; 2–5% of
  blocks reshuffled on each launch.
- **mlock-locked RAM pages** zeroed on lock; master-key destruction = instant
  cryptographic wipe.
- OS-level outbound firewall rule auto-provisioned during setup (in addition to
  code-level localhost-only policy).

## F2. Intelligence

- **Swap default LLM** from Qwen2.5-0.5B to Phi-3.5-mini-instruct Q4 (2.3 GB)
  on machines with ≥ 10 GB free RAM; add model-size negotiation at startup.
- **QLoRA personalisation LoRA adapter** (~10–30 MB) trained idle-time on
  PII-scrubbed facts extracted from the user's memory. Two-stage pipeline:
  1. Phi-extract facts from encrypted data during idle;
  2. Weekly user ✅/❌ review screen;
  3. DP-SGD training via Opacus only when idle + plugged in + battery > 50%;
  4. Instant adapter-erase button.
  Disabled on Eco profile; requires ≥ 10 GB RAM.
- **Three performance profiles** (Eco/Balanced/Performance) auto-detected at
  first run, user-switchable:
  - Eco (6 GB): Qwen2.5-0.5B, 5s capture interval, no personalisation, Moondream
    only every other frame
  - Balanced (8 GB): Qwen2.5-0.5B, 3s interval, personalisation off by default
  - Performance (16 GB+): Phi-3.5-mini, 1s interval, personalisation on
- **Semantic triple store** (subject–relation–object) for long-term memory;
  nightly Phi consolidation compresses 90-day rolling window into permanent
  triples (APScheduler).
- **Learned privacy blocklist** — on top of regex + Moondream, learn a small
  classifier from user STORE/DROP flags so the gate adapts to individual notions
  of sensitive content.
- **IVF-PQ vector index** in LanceDB to keep search <200 ms at >1 M memories.
- **Audio memory** — continuous ambient audio capture with webrtcvad, speech
  vs music/silence classification, Opus codec archival, raw audio deleted after
  transcription.
- **Speaker diarisation** so memories can be tagged "Priya said…" vs "I said…".

## F3. OS Actions (all voice-confirmed, reversible, non-destructive)

- App/file/URL opener (platform-specific launch)
- Reminders / notifications (plyer)
- Pre-approved message send (Slack / WhatsApp / Telegram / Teams) with preview +
  voice confirmation ("send this? say yes or no")
- Media controls (volume, brightness, play/pause/next, Wi-Fi, Bluetooth)
- Window control (minimize / close foreground)
- Explicitly **never** (hard ban): file deletion, installs, admin commands,
  payments, password entry, email sending.

## F4. UX

- **pystray tray icon** with colour states (idle/listening/thinking/locked/error)
  and right-click menu (open UI, lock, pause capture, guest mode, quit).
- **Guest mode** one-click memory lock when handing laptop to someone; new
  captures go to an ephemeral DB that gets destroyed on exit.
- **Cinematic sliding overlay** (Siri-style frosted-glass bar at top of screen)
  to replace the browser-tab UI.
- **Timeline view** (hidden behind tray menu) — scrollable calendar of past
  activities with thumbnails + captions.
- Custom assistant name + wake phrase (already in v1 settings but with one
  default voice; expand to multi-voice Piper selection).
- Native desktop notifications via plyer.
- Onboarding wizard (password, devices, profile selection).

## F5. Platform & Distribution

- Full **cross-platform parity**: macOS 12+ and Ubuntu 20.04+ window capture,
  keychain integration, audio routing.
- **PyInstaller native installers** for Win/Mac/Linux, signed where possible,
  model weights bundled or auto-downloaded on first run.
- **Optional Electron or Tauri shell** if the browser-tab UX proves limiting
  (evaluate post v1; web UI will always be available as a fallback).
- **CI/CD**: pre-commit hooks (Black, Ruff, mypy, Prettier, ESLint), GitHub
  Actions for lint + pytest + Vitest, branch protection on main.
- **Automated test suites**: unit tests per module, integration tests for full
  pipeline, e2e Playwright tests for UI, benchmark regression tests.
- **Stable public release** under MIT license, post-university approval and
  post-paper publication (or dual-licensed).
- Cinematic Jarvis-style demo video for launch + paper companion video.

## F6. Research Extensions (next paper)

- On-device personalisation with formal differential privacy guarantees
- Formal verification of the encryption/wipe path
- Long-term (year+) user study of memory-assistant usefulness
- Multi-device sync with end-to-end encryption
- Federated learning across users for better base models without data sharing
- Multilingual support (Hindi + English code-switching priority for Indian users)

---

## How to use this document

While working on v1, if you find yourself wanting one of these features:

1. Write it down in that day's meeting note (`docs/meetings/YYYY-MM-DD.md`).
2. If you're *sure* it belongs in the roadmap after submission, add it here via
   PR.
3. Do **not** start building it. The v1 scope contract (`SCOPE_V1.md`) wins.
