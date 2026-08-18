# Dev Environment Setup (v1)

EchoMem v1 targets **Windows 10/11 on 8 GB RAM, no GPU**. macOS/Linux support
is documented as best-effort for local dev but the October demo will run on
Windows.

## Prerequisites

Install these in order:

1. **Python 3.11** (https://www.python.org/downloads/ — tick "Add to PATH")
2. **Node.js 20 LTS** (https://nodejs.org/)
3. **Ollama for Windows** (https://ollama.com/download/windows)
4. **Git** (https://git-scm.com/download/win)
5. **ffmpeg** (required by faster-whisper for audio):
   `winget install Gyan.FFmpeg` (reopen terminal after)
6. On Windows, install Visual C++ Build Tools if sounddevice fails:
   https://visualstudio.microsoft.com/visual-cpp-build-tools/ (Desktop
   development with C++)
7. On Linux: `sudo apt install portaudio19-dev libasound2-dev ffmpeg`
8. On macOS: `brew install portaudio ffmpeg`

## Clone + install

```powershell
# PowerShell / Git Bash
git clone <your-private-repo-url> echomem
cd echomem
bash scripts/setup.sh          # Git Bash or WSL on Windows
bash scripts/pull_models.sh    # pulls ~3.4–6.6 GB of models via Ollama (3 Qwen3.5 tiers + embeddings; phi4-mini optional)
```

What `setup.sh` does:
- Creates `.venv/` in the repo root
- `pip install -r backend/requirements.txt`
- `pip install -r backend/requirements-dev.txt`
- `cd frontend && npm install`
- Creates `data/db/`, `data/captures/raw/`, `models/` dirs

## Run

Two terminals (or use two tabs in VS Code):

**Terminal 1 — backend**
```bash
cd backend
# Windows PowerShell:
..venv\Scripts\Activate.ps1
# macOS/Linux/Git Bash:
source ../.venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — frontend**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 → you should see the lock screen. Enter any password
(the stub accepts everything until Week 3 encryption is wired up). `GET
http://127.0.0.1:8000/health` should return JSON.

## Verify install

```bash
# Backend
curl http://127.0.0.1:8000/health
# Should print {"status":"ok", ...}

# Frontend
# Browser at http://localhost:5173 shows the lock screen.

# Models
ollama list
# Should include qwen3.5 tags pulled (0.8b, 2b-q4_K_M, 4b-q4_K_M) and nomic-embed-text:v1.5.
# Backend auto-picks one Qwen3.5 tier based on free RAM (see docs/adr/0001-quantized-local-models.md).
```

## Editor config

Recommended: VS Code with these extensions: Python, Pylance, ESLint, Prettier,
Tailwind CSS IntelliSense. Lint/format runs via Black + Ruff + Prettier; pre-commit
hooks will be added only if time allows in the buffer week (post-v1 nice-to-have).

## Troubleshooting

- **Ollama out of memory**: close Chrome/VSCode; set ECHOMEM_MODEL=qwen3.5:0.8b to force the smallest tier.
- **sounddevice no device**: check mic permissions (Windows Settings → Privacy & Security → Microphone); on Mac: `brew install portaudio`.
- **mss black screen on Wayland (Linux)**: fall back to X11 for now; Wayland capture is post-v1.
- **Port already in use**: ensure no other uvicorn/Vite process is running;
  change ports in `main.py` / `vite.config.ts` consistently.
- **pykokoro model download fails**: it auto-downloads ~80 MB voices from HuggingFace on first use; ensure `pip install "pykokoro[cpu]"` succeeded.
- **livekit-wakeword ONNX training**: train `Hey Echo` via `livekit-wakeword run configs/hey_echo.yaml` (Week 3); the pre-trained `hey_livekit.onnx` works for smoke tests.
