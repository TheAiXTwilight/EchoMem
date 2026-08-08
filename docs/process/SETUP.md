# Setup Guide (Development)

## Prerequisites
- Python 3.11 (3.12 works too, but 3.11 is tested)
- Node.js 20+
- Git
- [Ollama](https://ollama.com/) installed and running
- 6 GB+ free RAM, 10 GB+ free disk
- OS: Windows 10/11, macOS 12+, or Ubuntu 20.04+

## One-Command Setup
```bash
git clone <private-repo-url>
cd echomem-final
bash scripts/setup.sh
```

The script:
1. Creates a Python virtual environment in `backend/venv`
2. Installs backend Python dependencies
3. Installs frontend npm dependencies
4. Prints next steps

## Pull Models
After setup, download the required models:
```bash
bash scripts/pull_models.sh
```
This downloads (all quantized, ~4.5 GB total):
- Whisper-tiny (speech)
- Moondream2-1.8B Q4 (vision/privacy gate)
- Phi-3.5-mini Q4 (answer synthesis)
- bge-small-en ONNX (embeddings, bundled with fastembed)
- Piper voices (male + female, ~80 MB)
- openWakeWord "Hey Echo" default (custom wake words trained in-app)
- ECAPA-TDNN voiceprint model (~20 MB)
- FaceNet (optional, for face unlock, ~90 MB)

On 8GB+ machines, you can swap Phi-3.5 for a larger model in settings.

## Running in Development

### Backend
```bash
cd backend
source venv/bin/activate    # Windows: venv\Scripts\activate
uvicorn api.main:app --reload --port 8000
```
Backend runs on http://localhost:8000 with API docs at http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm run dev
```
Open http://localhost:5173 in your browser.

## Testing
```bash
cd backend
source venv/bin/activate
pytest
```

## Packaging (for release)
Packaging scripts are added in Phase 6.

## Troubleshooting
- **Ollama not running:** start the Ollama app (or `ollama serve`) before starting EchoMem
- **Out of memory on 6GB:** switch to Eco profile in settings (uses Qwen2-0.5B instead of Phi)
- **No mic capture:** grant microphone permission to your terminal/IDE
- **Webcam not detected:** face unlock is automatically hidden
