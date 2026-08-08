# ADR 0003: Tech Stack Selection

**Date:** 2026-07
**Status:** Accepted

## Decision
- **Backend:** Python 3.11, FastAPI, Uvicorn
- **Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui (served from FastAPI at localhost in v1, no Electron yet)
- **AI runtime:** Ollama for LLMs/VLMs; faster-whisper / Whisper.cpp for speech; fastembed (ONNX) for embeddings; SpeechBrain for voiceprint; openWakeWord for hotword; Piper for TTS; FaceNet via facenet-pytorch for optional face unlock
- **Storage:** LanceDB (vector), SQLite FTS5 (metadata/keywords), local encrypted filesystem shards
- **Audio:** sounddevice + soundfile + webrtcvad + ffmpeg-python; Opus codec for archived audio
- **Images:** Pillow + OpenCV; WebP for archive, JPEG for short-term
- **Capture:** mss (screen) + cross-platform window title detection
- **Scheduling:** APScheduler (nightly consolidation, training)
- **Encryption:** `cryptography` library for AES-GCM / PBKDF2; `keyring` for OS keychain access
- **OS integration:** `webbrowser`, `plyer` (notifications), `pystray` (tray), OS-specific native messaging for approved apps (Slack/WhatsApp/Telegram links)
- **Packaging:** PyInstaller for backend; Vite build for frontend bundled into installers
- **Tests:** pytest (backend), Vitest (frontend)
- **Paper:** LaTeX

## Rationale
- Mature, well-documented libraries with strong tutorials
- All run cross-platform on CPU
- Ollama handles model loading/unloading automatically
- FastAPI cleanly exposes an async API to the React overlay
- Electron deferred to post-v1; a localhost web UI accessed from tray is lighter for low-RAM laptops

## Rejected Alternatives
- Django/Flask — too heavy for a single-purpose AI assistant
- Pinecone/Weaviate/Chroma server — require server processes; LanceDB embedded fits local-first better
- Electron for v1 — adds ~500 MB RAM overhead; defer to post-launch
- PyTorch-only stack — too heavy; ONNX/llama.cpp used where possible for CPU speed
