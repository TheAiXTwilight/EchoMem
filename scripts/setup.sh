#!/usr/bin/env bash
# One-time dev setup for EchoMem v1.
# Works on macOS/Linux/Git Bash (Windows). PowerShell users: run from Git Bash.
set -e
echo "Setting up EchoMem development environment..."

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ---------- prerequisite checks ----------
if ! command -v python3 >/dev/null 2>&1; then
    echo "ERROR: Python 3.11+ not found. Install Python 3.11 first."
    exit 1
fi

PYVER=$(python3 -c "import sys; print('%d.%d' % sys.version_info[:2])")
echo "Detected Python $PYVER"
if [ "$PYVER" != "3.11" ] && [ "$PYVER" != "3.12" ]; then
    echo "WARNING: Python 3.11 is recommended; you are on $PYVER."
fi

if ! command -v node >/dev/null 2>&1; then
    echo "ERROR: Node.js 20+ not found. Install Node 20 LTS first."
    exit 1
fi
echo "Detected Node $(node --version)"

if ! command -v ollama >/dev/null 2>&1; then
    echo "WARNING: Ollama not found. Install from https://ollama.com/download before pulling models."
else
    echo "Detected Ollama $(ollama --version 2>&1 | head -n1)"
fi

# ---------- dirs ----------
mkdir -p data/db data/captures/raw models

# ---------- backend ----------
echo ""
echo "Setting up backend (Python venv + pip)..."
cd "$ROOT/backend"
python3 -m venv "$ROOT/.venv"
# shellcheck disable=SC1091
source "$ROOT/.venv/bin/activate"
pip install --upgrade pip
pip install -r requirements.txt -r requirements-dev.txt
deactivate
cd "$ROOT"

# ---------- frontend ----------
echo ""
echo "Setting up frontend (npm install)..."
cd "$ROOT/frontend"
npm install
cd "$ROOT"

echo ""
echo "Setup complete."
echo ""
echo "Next steps:"
echo "  1. Start Ollama (it usually runs in the background after install)."
echo "  2. Pull models:     bash scripts/pull_models.sh"
echo "  3. Run backend:     source .venv/bin/activate  (Windows: .venv\Scripts\activate)"
echo "                     cd backend && uvicorn main:app --reload --host 127.0.0.1 --port 8000"
echo "  4. Run frontend:    cd frontend && npm run dev     -> http://localhost:5173"
echo "  5. Verify:          curl http://127.0.0.1:8000/health"
