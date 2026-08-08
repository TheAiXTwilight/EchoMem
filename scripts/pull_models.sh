#!/usr/bin/env bash
set -e
echo "📥 Pulling EchoMem models via Ollama (~4.5GB total)..."
ollama pull moondream:1.8b-instruct-q4_K_M
ollama pull phi3.5:3.8b-mini-instruct-q4_K_M
ollama pull qwen2.5:0.5b-instruct-q4_K_M   # Eco profile

echo ""
echo "✅ Models pulled. Whisper/Piper/wakeword/voiceprint models are downloaded automatically on first run."
