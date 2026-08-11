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

- Wake-word activation (`Hey Echo`, customisable) — openWakeWord
- Speech-to-text — faster-whisper tiny.en
- Screen capture with content-change detection (pHash) + Windows app/title context
- On-device visual captioning + privacy gate (drop passwords/OTP/banking) — Moondream2 1.8B Q4
- Semantic search over memory — bge-small-en-v1.5 + LanceDB
- Answer synthesis — **Qwen2.5-0.5B-instruct Q4** (fits in 8GB CPU)
- Voice responses — Piper TTS
- AES-256-GCM at-rest encryption, single master password on launch
- React + Tailwind dark chat UI served on localhost
- FastAPI backend, hard localhost-only networking
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

# 2. Pull local models via Ollama (~1.5GB total for v1)
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

## Team process

- Trunk-based branching; short-lived feature branches; pair/mob programming only
- No individual module ownership — rotate sprint drivers weekly
- **Friday demo every week**, even if half-broken
- Feature freeze after Week 4; Week 5 = evaluation; Week 6 = paper + rehearsal
- Read [`docs/process/TEAM.md`](docs/process/TEAM.md) and
  [`docs/process/CONTRIBUTING.md`](docs/process/CONTRIBUTING.md)

## Research paper

Target: department submission (Oct 2026), then a demo/late-breaking track (ACM
COMPASS, ACM India student symposiums, or arXiv preprint). Angle:
> *A privacy-first personal memory assistant can run fully offline on an 8 GB
> CPU-only laptop using quantized open-source models, with sub-10-second query
> latency and encrypted at-rest storage. We quantify trade-offs via a 100-question
> memory benchmark on real user data.*

See [`paper/`](paper/) for the LaTeX skeleton (added Week 2).

## License

**Private during FYP development** (see `LICENSE-private.md`). Open-source
licensing decision (MIT) will be made *after* October submission, in
consultation with our guide.
