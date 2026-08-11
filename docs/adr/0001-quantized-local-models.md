# ADR 0001 — Quantized Local Models via Ollama for v1

- **Status:** Accepted (v1)
- **Date:** 2026-08-12

## Context
EchoMem must run on 8 GB CPU-only Windows laptops with no GPU and no internet.
We need STT, TTS, wake word, image captioning, embeddings, and a chat LLM —
all simultaneously — while leaving headroom for OS + UI.

## Decision
- All large models run locally via **Ollama**, using **Q4_K_M quantisation**.
- **v1 default LLM:** `qwen2.5:0.5b-instruct-q4_K_M` (~400 MB). It fits alongside
  Moondream + Whisper + embeddings + TTS inside 8 GB RAM.
- **VLM for captions + privacy:** `moondream:1.8b-instruct-q4_K_M` (~1.1 GB),
  loaded only during the background capture loop, not during queries.
- **Embeddings:** `bge-small-en-v1.5` via fastembed (ONNX, ~140 MB).
- **STT:** `faster-whisper` with `tiny.en` (~40 MB).
- **TTS:** Piper with `en_US-amy-medium` (~80 MB).
- **Wake word:** `openWakeWord` (<1 MB).

## Consequences
**Pros:**
- Total model weights on disk ≈ 1.8 GB.
- End-to-end answer latency on 8 GB CPU fits our ≤12s p95 target.
- Install story is one script (`scripts/pull_models.sh`).
- Ollama handles model loading, memory management, and GGUF runtime.

**Cons / trade-offs:**
- Qwen2.5-0.5B is not very smart. Answers will be mediocre. We accept this
  for v1; the research contribution is the *system*, not the LLM quality.
- We must unload Moondream from RAM before a big Qwen query if memory is tight
  (Ollama does this automatically via keep-alive).
- Model upgrades (Phi-3.5-mini, larger Whisper) move to post-v1.

## Alternatives considered
- **Phi-3.5-mini (2.3 GB default):** Better answers but pushes 8 GB machines
  into swap during concurrent Moondream + Whisper. Deferred to post-v1 for
  16 GB+ machines.
- **Cloud APIs (OpenAI, Gemini, etc.):** Violates the privacy promise. Rejected.
- **llama.cpp directly:** More control but more engineering overhead than Ollama
  for a 6-week deadline. Rejected.
- **Gemma-2-2B, Mistral-7B:** too large for our RAM budget.

## Post-v1
- Profile selector auto-upgrades to Phi-3.5-mini when RAM ≥ 10 GB free
- Offer `base.en` / `small.en` Whisper for higher transcription accuracy
- Explore Llama 3.2-Vision to unify caption + LLM into one model
