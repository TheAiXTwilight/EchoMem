#!/usr/bin/env bash
set -e
echo "🔧 Setting up EchoMem development environment..."

# Python check
if ! command -v python3 >/dev/null 2>&1; then
    echo "❌ Python 3.11+ not found. Install Python 3.11 first."
    exit 1
fi

# Node check
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js 20+ not found. Install Node 20 first."
    exit 1
fi

# Ollama check
if ! command -v ollama >/dev/null 2>&1; then
    echo "⚠️  Ollama not found. Install from https://ollama.com before running."
fi

# Backend
echo "📦 Setting up backend..."
cd backend
python3 -m venv venv
# shellcheck disable=SC1091
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt -r requirements-dev.txt
cd ..

# Frontend
echo "📦 Setting up frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete."
echo ""
echo "Next steps:"
echo "  1. Start Ollama:  ollama serve"
echo "  2. Pull models:    bash scripts/pull_models.sh"
echo "  3. Run backend:    source backend/venv/bin/activate && cd backend && uvicorn api.main:app --reload"
echo "  4. Run frontend:   cd frontend && npm run dev"
