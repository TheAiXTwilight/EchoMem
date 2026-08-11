#!/usr/bin/env bash
# Pull local models required for EchoMem v1 (October 2026).
# Run after `setup.sh` and `ollama serve` is running.
#
# v1 defaults target 8 GB CPU-only laptops. Heavier Phi model is optional
# (commented out) — see docs/process/FUTURE_WORK.md.
set -euo pipefail

if ! command -v ollama >/dev/null 2>&1; then
    echo "ERROR: Ollama not installed. Install from https://ollama.com/download first."
    exit 1
fi

echo "[1/4] Pulling Moondream2 1.8B Q4 (captions + privacy gate)..."
ollama pull moondream:1.8b-instruct-q4_K_M

echo "[2/4] Pulling Qwen2.5-0.5B-instruct Q4 (v1 default answer LLM)..."
ollama pull qwen2.5:0.5b-instruct-q4_K_M

# Optional: Phi-3.5-mini is higher quality but needs 10 GB+ free RAM.
# Uncomment after v1 / on 16 GB machines only.
# echo "[opt] Pulling Phi-3.5-mini-instruct Q4 (higher-quality LLM, optional)..."
# ollama pull phi3.5:3.8b-mini-instruct-q4_K_M

echo "[3/4] Downloading Piper TTS English voice (~80 MB)..."
PIPER_DIR="models/piper"
VOICE="en_US-amy-medium"
mkdir -p "$PIPER_DIR"
if [ ! -f "$PIPER_DIR/${VOICE}.onnx" ]; then
    curl -L -o "$PIPER_DIR/${VOICE}.onnx" \
        "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/${VOICE}.onnx"
fi
if [ ! -f "$PIPER_DIR/${VOICE}.onnx.json" ]; then
    curl -L -o "$PIPER_DIR/${VOICE}.onnx.json" \
        "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/${VOICE}.onnx.json"
fi

echo "[4/4] Downloading openWakeWord base model..."
OWW_DIR="models/openwakeword"
mkdir -p "$OWW_DIR"
# openWakeWord auto-downloads on first use; this just confirms the directory exists
# and prints a note.
echo "openWakeWord will auto-download its weights on first run."

echo ""
echo "Done. Models cached under ~/.ollama and ./models/."
echo "Verify with: ollama list"
echo ""
echo "faster-whisper tiny.en is auto-downloaded by faster-whisper on first STT call."
echo "bge-small-en-v1.5 is auto-downloaded by fastembed on first embed call."
