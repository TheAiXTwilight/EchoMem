# ADR 0001: Quantized Local Models with On-Demand Loading

**Date:** 2026-07
**Status:** Accepted
**Deciders:** All team members

## Context
EchoMem must run multimodal AI (speech, vision, embeddings, LLM, wake word, voiceprint, face recognition) on consumer laptops (6–16 GB RAM, CPU-first, no required GPU), fully offline with zero cloud calls.

## Decision
Use the following open-source quantized models, loaded on demand via Ollama/llama.cpp (only one heavy model in RAM at a time):

| Task | Model | Size | Quantization |
|------|-------|------|--------------|
| Speech-to-text | faster-whisper / Whisper.cpp | 40 MB (tiny.en) / 142 MB (base.en) | Q4 |
| Vision + privacy gate + captions | Moondream2 1.8B | 1.1 GB | Q4 GGUF |
| Embeddings | bge-small-en-v1.5 (fastembed ONNX) | 140 MB | INT8 ONNX |
| Answer synthesis | Phi-3.5-mini-instruct | 2.3 GB | Q4_K_M; Eco mode uses Qwen2.5-0.5B Q4 (400 MB) |
| Voice output | Piper TTS (male + female) | ~80 MB total | — |
| Wake word | openWakeWord | < 1 MB | — |
| Voiceprint | SpeechBrain ECAPA-TDNN | 20 MB | — |
| Face unlock (optional) | FaceNet (MTCNN + InceptionResnet) | 90 MB | — |

## Consequences
✅ Fits 6–8 GB RAM budgets
✅ Fully offline, open-source, auditable
✅ On-demand unloading (Ollama auto-unload) keeps idle RAM ~600 MB
⚠️ Lower ceiling than cloud models (acceptable tradeoff for privacy/on-device)
⚠️ Requires careful scheduling so multiple heavy models don't load simultaneously

## Alternatives Rejected
- Cloud APIs (privacy violation, core premise broken)
- Llama-3.1-8B Q4 (4.7 GB — too large for 6GB Eco profile)
- Large VLMs (Qwen2-VL-7B) — too slow on CPU
- Piper large voices — bigger, no quality gain worth the size
