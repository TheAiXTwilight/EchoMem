# EchoMem — Privacy-First Local Memory Assistant

> *It remembers, so you don't have to. Fully offline. Fully yours.*

EchoMem is a voice-controlled personal memory assistant that runs **100% locally**
on your laptop — no cloud, no GPU, no data ever leaves the machine. It passively
captures your screen, extracts semantic summaries into encrypted storage, and
lets you ask questions like *"When did I last work on the login page?"* or
*"What did that Slack message from Priya say?"* by voice.

This is our **final-year B.E. project** at Ajeenkya DY Patil University, Dept. of
Computer Science and Engineering, Pune. Team of 3. Target submission: **October
2026** (6-week MVP, paper + live demo).

---

## What's in v1 (the October submission)

- Wake-word activation (`Hey Echo`, customisable) — **livekit-wakeword** (100× fewer false positives than openWakeWord)
- Speech-to-text — **faster-whisper base.en INT8** (CTranslate2, 142 MB, CPU)
- Screen capture with content-change detection (pHash) + Windows app/title context
- **Unified multimodal model handles BOTH chat answers AND screenshot captioning/privacy OCR** — one Qwen3.5 model replaces separate chat LLM + VLM (saves RAM, no model swap)
  - Floor (6 GB): Qwen3.5 0.8B (1.0 GB)
  - Default (8 GB): **Qwen3.5 2B Q4_K_M (1.9 GB)**
  - Premium (M2/M3 Mac): Qwen3.5 4B Q4_K_M (3.4 GB)
- Privacy gate (drop passwords/OTP/banking/incognito) — VLM output + regex fusion
- Semantic search over memory — **nomic-embed-text:v1.5** (274 MB) + LanceDB
- Voice responses — **Kokoro-82M via pykokoro ONNX** (Apache 2.0, 54 voices, CPU)
- AES-256-GCM at-rest encryption, single master password on launch (PBKDF2 100k iters)
- React + Tailwind dark chat UI served on localhost
- FastAPI backend, hard localhost-only networking (CORS locked to 127.0.0.1:5173)
- 6–8 page research paper + live demo

## What's in the repo but NOT in v1 (Future Work, see `docs/process/FUTURE_WORK.md`)

Every originally planned feature is still in the architecture and module
skeleton. The following are documented, partially stubbed, and scheduled for
*after* October submission:

- 3-factor graduated unlock (voiceprint + anti-replay challenge + master password)
- Face + eye-blink optional webcam unlock
- QLoRA personalisation adapter with DP-SGD
- OS actions (open apps, control volume/brightness, approved messages)
- Continuous ambient audio capture (screen-only in v1)
- Cross-platform support (Windows is the demo target for v1)
- 3 performance profiles (Eco/Balanced/Performance)
- Envelope encryption + per-day key rotation + block reshuffling + mlock
- IVF-PQ vector index (flat brute-force in v1)
- pystray tray icon, guest mode, native installers
- Cinematic demo video

See [`docs/process/SCOPE_V1.md`](docs/process/SCOPE_V1.md) for the exact scope
contract and [`docs/process/FUTURE_WORK.md`](docs/process/FUTURE_WORK.md) for
the post-submission roadmap.

---

## Quick start (dev)

```bash
# 1. One-time setup (creates venv, installs backend + frontend deps)
bash scripts/setup.sh

# 2. Pull local models via Ollama (~3.4 GB minimum, ~6.3 GB for all tiers)
bash scripts/pull_models.sh

# 3. Run backend
cd backend && source ../.venv/bin/activate     # Windows: .venv\Scripts\activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# 4. Run frontend (new terminal)
cd frontend && npm run dev                     # opens http://localhost:5173
```

Open http://localhost:5173, set your master password, and say **"Hey Echo"**.

## Hardware targets (v1)

| Spec | Minimum | Recommended |
|---|---|---|
| RAM | 6 GB | 8 GB |
| CPU | Any modern x86/ARM (2018+) | 4+ cores |
| GPU | **Not required** | Optional, unused in v1 |
| Disk | ~3 GB for models + code | + ~500 MB/year data |
| OS | Windows 10/11 (demo target) | macOS 12+ / Ubuntu 20.04+ (post-v1) |
| Mic | Built-in laptop mic | Any |

## Repository layout

```
backend/        FastAPI app + modules (capture/, models/, storage/, retrieval/,
                privacy/, actions/, unlock/, api/)
frontend/       React + Vite + TypeScript + Tailwind chat UI
scripts/        setup.sh, pull_models.sh
models/         (gitignored) local Ollama/Piper/Whisper weights
data/db/        (gitignored) LanceDB + SQLite live data
paper/          LaTeX source for the research paper
docs/
  product/      PRD
  process/      TEAM, ROADMAP, SCOPE_V1, FUTURE_WORK, SETUP, CONTRIBUTING, COC
  technical/    SRS, ARCHITECTURE, API, THREAT_MODEL, UI_UX, TESTING
  adr/          Architecture Decision Records
  meetings/     Weekly meeting notes
.github/        PR + issue templates
```
