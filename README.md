# EchoMem
> Private On-Device Jarvis-Style AI Memory Assistant

*Private repository — do not distribute.*

---

## What is EchoMem?

EchoMem is a fully offline, Jarvis-style personal voice assistant that lives on your laptop. It pays attention to what you see and hear (intelligently, not blindly), remembers everything permanently in encrypted local storage, activates with your own custom wake word, answers questions about your activity in natural voice, performs safe OS actions on confirmed command, and can personalize itself to you — all without ever sending a byte of data online.

- 🔒 **100% local, zero cloud** — no API keys, no telemetry, hard network block
- 🧠 **Smart intelligent capture** — filters private content and idle screens before saving
- 🗣️ **Custom-named voice assistant** — wake word, assistant name, and voice are user-defined (pick anything; default examples: Raven, Lyra, or your own name)
- 🔐 **Three-factor unlock** — system biometric + voiceprint + optional face/eye (auto-detected if webcam) + secondary master password
- 💾 **Permanent memory** — years of memories in ~650MB on disk, flat ~600MB idle RAM
- ⚙️ **Safe OS control** — open apps, set reminders, send approved messages (all confirmed, nothing destructive)
- 🧪 **Opt-in personalization** — private on-device QLoRA fine-tuning (default off)
- 🖥️ **Siri-style minimal UI** — sliding overlay, tray menu, no bloated dashboard
- 💻 **Runs on 6GB+ laptops** — no GPU required, Eco/Balanced/Performance profiles
- 🧑‍🤝‍🧑 **Built by a 3-person team, no fixed roles** — shared ownership of every component

---

## Current Status

**Phase: Foundations & Proposal (Week 1)**

| Milestone | Status | Target |
|-----------|--------|--------|
| Project proposal | 🟡 Draft | Week 1 |
| MVP (capture → embed → search) | ⚪ | Week 5 |
| AI pipeline (Whisper + Moondream + Phi) | ⚪ | Week 8 |
| Smart capture & privacy gate | ⚪ | Week 10 |
| Encrypted permanent memory | ⚪ | Week 11 |
| Jarvis voice UX + 3-factor unlock | ⚪ | Week 12 |
| Personalization + UI polish | ⚪ | Week 14 |
| Final v1.0 + research paper | ⚪ | Month 12 |

---

## Repository Structure

```
echomem-final/
├── backend/            # FastAPI backend (Python 3.11)
│   ├── capture/        # Screen + audio capture
│   ├── models/         # AI model wrappers (Whisper, Moondream2, Phi, Piper, wake word, voiceprint, face recognition)
│   ├── storage/        # Encrypted LanceDB + SQLite + sharded file store
│   ├── retrieval/      # Hybrid search + tiered memory router + summarization
│   ├── privacy/        # Encryption, PII redaction, network block, key management
│   ├── actions/        # Safe OS actions (open apps, reminders, approved messages)
│   ├── unlock/         # System auth, voiceprint, face+eye biometric, master password
│   └── api/            # FastAPI routes
├── frontend/           # React + Vite + Tailwind (Siri-style overlay + tray popover)
│   └── src/
├── models/             # Quantized model files (gitignored; downloaded via setup script)
├── data/               # Local encrypted user data (gitignored)
├── docs/
│   ├── product/        # PRD, user stories, privacy model
│   ├── process/        # Roadmap, team guidelines, contributing, setup
│   └── adr/            # Architecture Decision Records
├── paper/              # LaTeX source for the research paper
├── scripts/            # Setup, benchmark, dev scripts
└── tests/              # Unit + integration tests
```

---

## Quick Start (Development)

Prerequisites: Python 3.11, Node 20+, Git, Ollama

```bash
git clone <private-repo-url>
cd echomem-final
bash scripts/setup.sh
```

See [`docs/process/SETUP.md`](docs/process/SETUP.md) for full instructions.

---

## Documentation

| Purpose | Link |
|---------|------|
| Product requirements | [`docs/product/PRD.md`](docs/product/PRD.md) |
| Roadmap & milestones | [`docs/process/ROADMAP.md`](docs/process/ROADMAP.md) |
| Team process & guidelines | [`docs/process/TEAM.md`](docs/process/TEAM.md) |
| Contributing workflow | [`docs/process/CONTRIBUTING.md`](docs/process/CONTRIBUTING.md) |
| Code of conduct | [`docs/process/CODE_OF_CONDUCT.md`](docs/process/CODE_OF_CONDUCT.md) |
| Setup guide | [`docs/process/SETUP.md`](docs/process/SETUP.md) |
| Architecture decisions | [`docs/adr/`](docs/adr/) |
