# ADR 0001 — Quantized Local Models via Ollama for v1 (Final v2, Aug 18 2026)

- **Status:** Accepted (v1 final, locked)
- **Date:** 2026-08-12 (original), 2026-08-18 (v2 — full re-research, unified multimodal architecture)

## Context
EchoMem must run on 8 GB CPU-only laptops (Windows + M2/M3 MacBook Airs, no GPU, no internet).
We need: screen understanding + privacy gating, speech-to-text, text-to-speech, wake-word detection,
text embeddings, and chat synthesis — all fitting alongside Windows+Chrome+VSCode.

## Architecture change (v2): UNIFIED MULTIMODAL MODEL
v1 used two separate Ollama models: a text-only chat LLM + a separate VLM for captions/OCR.
**v2 uses ONE multimodal model at every tier that handles BOTH chat and vision.**
This eliminates model-swap latency, removes the "VLM evicted before queries" timing
hazard, and saves RAM because we never hold two Ollama models resident. Qwen3.5 ships
text + image + tool calls + optional "thinking" at every size, with 256K context.

## Sources used for the Aug 18 2026 re-research
- morphllm.com "Best Ollama Models Aug 2026" (Aug 8, 2026)
- promptquorum.com "Best local LLMs July 2026" (Jul 14)
- promptquorum.com "Whisper.cpp vs faster-whisper 2026" (Jun 15)
- promptquorum.com "Best embedding models local RAG 2026" (May 14)
- localaimaster.com "Best Ollama embedding models benchmarked" (Aug 5)
- localaimaster.com "Best local TTS 2026" (Jul 20)
- insiderllm.com "Best vision models locally" (Jul 15)
- insiderllm.com "Qwen models guide mid-2026" (Aug 16)
- computingforgeeks.com "Ollama cheat sheet 2026" (Aug 4)
- computingforgeeks.com "Open-source LLM comparison 2026" (Aug 6)
- offlinetts.com "TTS & STT landscape H1 2026" (Aug 1)
- codesota.com "Best open-source TTS 2026" (May 13)
- livekit.com/blog/livekit-wakeword (Apr 6, 2026)
- Live Ollama tag verification: ollama.com/library/qwen3.5/tags, ollama.com/library/phi4-mini/tags,
  ollama.com/library/qwen3-vl/tags, ollama.com/library/moondream/tags, ollama.com/library/nomic-embed-text
  (all checked Aug 18, 2026).

## Final decision — v2 stack (LOCKED)

| Role | Model | Exact Ollama tag | Size on disk | Why it wins Aug 2026 |
|---|---|---|---|---|
| **Unified multimodal — floor** (≤2 GB free / 6 GB laptops) | Qwen3.5 0.8B | `qwen3.5:0.8b` | 1.0 GB | Smallest natively-multimodal model on Ollama. Text+image, 256K context. OCRBench 74.5 beats Moondream 2 (~70) at smaller effective RAM. 360+ tok/s on RTX 4090, ~15-20 tok/s CPU. |
| **Unified multimodal — DEFAULT** (2-5 GB free / 8 GB Windows) | Qwen3.5 2B | `qwen3.5:2b-q4_K_M` | 1.9 GB | Beats old qwen3:1.7b on every text benchmark while adding native vision. Single model replaces old qwen3:1.7b + qwen3-vl:2b pair — saves ~1.4 GB peak RAM and eliminates model swap. 256K context. MMLU class ~55-60. |
| **Unified multimodal — premium** (≥5 GB free / M-series Mac) | Qwen3.5 4B | `qwen3.5:4b-q4_K_M` | 3.4 GB | MMLU-Pro 79.1 (vs phi-4-mini's ~68), AND natively supports vision so it does captioning/privacy-OCR too. 256K context. Apple Metal MLX-optimized builds also available. Replaces phi-4-mini + qwen3-vl:2b pair (saves ~1.0 GB). |
| Embeddings | Nomic Embed Text v1.5 | `nomic-embed-text:v1.5` | 274 MB | 82M+ pulls on Ollama — the undisputed default. 768 dims, 8K context, Apache 2.0. CPU-friendly (37-120 chunks/s). Hit@1 95.8% in localaimaster benchmark. No v2 on official Ollama (community v2-moe is 958MB with only 512 ctx — not worth it). |
| STT | faster-whisper base.en | (HuggingFace auto-dl, INT8) | 142 MB | CTranslate2 INT8 quant. Identical accuracy to openai-whisper, ~2× faster on x86 CPU, ~20× realtime. English-only (EchoMem launches EN), 5.0% WER. For M-series Macs, pywhispercpp (whisper.cpp with Metal) is 3× faster than faster-whisper (CPU-only on Mac) — code auto-selects at runtime (Week 2). Parakeet/SenseVoice need NeMo/CUDA (install risk across 3 OSes). |
| TTS | Kokoro-82M (pykokoro ONNX) | (auto-dl ~80 MB voices) | ~200 MB runtime | Apache 2.0, 82M params, ~5× realtime on CPU, MOS ~4.0, 54 built-in voices, no GPU needed. Dominated r/LocalLLaMA TTS threads all 2026. Piper (GPL-3.0) is smaller but worse prosody and a license we don't want for an MIT-released academic project. Chatterbox/XTTSv2/Qwen3-TTS are 350M-1.7B (too big on 8 GB with other models stacked). |
| Wake word | livekit-wakeword 0.2.x | (pip + ONNX auto-dl) | <50 MB | Conv-Attention ONNX, 100× fewer false positives/hour and 60× lower detection error than openWakeWord (LiveKit published numbers: 0.08 FPPH vs 8.5, 86% vs 69% recall). One-command custom "Hey Echo" training. Drop-in compatible with openWakeWord models. Porcupine is commercial-only (no free tier as of late 2024). |

## Environment overrides
- `ECHOMEM_MODEL=<tag>` forces the unified multimodal model (replaces old `ECHOMEM_LLM` and `ECHOMEM_VLM`).

## Auto-selection logic (`backend/models/llm.py`)
```
if is_apple_silicon and free_ram >= 3 GB:  qwen3.5:4b-q4_K_M
elif free_ram >= 5 GB:                       qwen3.5:4b-q4_K_M
elif free_ram >= 2 GB:                       qwen3.5:2b-q4_K_M   # DEFAULT 8 GB
else:                                        qwen3.5:0.8b
```
Why Apple Silicon drops the threshold to 3 GB: unified memory compresses
cold/inactive pages aggressively; the 4B Q4 (3.4 GB) sits comfortably alongside
OS+UI on an 8 GB M2/M3 Air.

## Memory budget (worst case — active voice query, 8 GB Windows, default tier)

| Component | RAM |
|---|---|
| Windows + Chrome + VS Code (background) | 3.0 GB |
| Unified multimodal model (qwen3.5:2b-q4_K_M) | 1.9 GB |
| faster-whisper base.en INT8 | 0.3 GB |
| nomic-embed-text:v1.5 | 0.3 GB |
| Kokoro ONNX + voice | 0.2 GB |
| livekit-wakeword ONNX | 0.1 GB |
| Python + FastAPI + React UI (Vite) | 0.6 GB |
| Audio buffers + screenshot frames | 0.3 GB |
| **Total** | **~6.7 GB — ~1.3 GB headroom, no swap** |

Because the same Ollama model handles BOTH background vision capture and
query-time chat, there is NO VLM eviction/loading window. A single Ollama
process holds one model for the entire session.

**Premium tier (M2/M3 MacBook Air, 8 GB unified):** qwen3.5:4b-q4_K_M (3.4 GB)
replaces 1.9 GB chat + 1.9 GB VLM from v1 → total stack ~7.3 GB, fits via
unified-memory compression (macOS compresses inactive pages to ~50%).

## What changed from v1 stack and why

| v1 pick | v2 pick | Reason |
|---|---|---|
| qwen3:0.6b (523 MB, text-only) + moondream:1.8b (1.8 GB, vision-only) | **qwen3.5:0.8b (1.0 GB, multimodal)** | Single model, smaller peak RAM (1.0 < 2.3 GB combined), better OCR than Moondream, 128× longer context. Moondream on Ollama is 2 years stale (last update 2024, only 2K context). |
| qwen3:1.7b (1.4 GB, text-only) + qwen3-vl:2b (1.9 GB, vision) | **qwen3.5:2b-q4_K_M (1.9 GB, multimodal)** | One 1.9 GB model replaces two models totaling 3.3 GB — saves ~1.4 GB RAM, eliminates model swap, newer Qwen generation. |
| phi4-mini (2.5 GB, text-only) + qwen3-vl:2b (1.9 GB) | **qwen3.5:4b-q4_K_M (3.4 GB, multimodal)** | One 3.4 GB model replaces 4.4 GB combined; Qwen3.5 4B has higher MMLU-Pro (79 vs ~68) AND adds vision; 256K vs 128K context; phi-4-mini is 14 months old (Jul 2025) and text-only. |
| Separate LLM + Captioner classes loading different tags | **Both classes point to same model** | Simpler code, fewer env vars, no confusion. |

## Alternatives considered and rejected (Aug 2026)

- **Qwen3.5 9B (6.6 GB):** too large for 8 GB with other models stacked. Great 12-16 GB tier.
- **Gemma 4 E4B (~4.5-6 GB):** Google's new flagship, Apache 2.0, excellent quality — but 4.5 GB RAM minimum + overhead pushes past the 8 GB budget with all other models. E2B (2.9 GB) is viable but Qwen3.5 2B (1.9 GB) is smaller and better for our tier.
- **Gemma 4 E2B (2.9 GB):** possible alt for default tier; Qwen3.5 2B has better multilingual + larger context + more community benchmark data at time of lock. Both are fine; Qwen3.5 family gives us one family across all three tiers (simplifies prompt templates).
- **Phi-4-mini (kept as optional pull but not auto-selected):** text-only; kept in pull_models.sh as a user-option for people who prefer it, but the auto-picker now uses Qwen3.5 4B because it does vision too.
- **PaddleOCR-VL 0.9B (936 MB):** best pure OCR per byte, but requires the full PaddlePaddle stack (WSL on Windows, CUDA preferred, fragile install across 3 OSes) — violates our "pip-installable, cross-platform" rule. Qwen3.5 0.8B handles OCR via Ollama in one API call.
- **Moondream 2:** 2 years stale on Ollama (2024), only 2K context window, worse OCR than Qwen3.5 0.8B. Removed from default stack.
- **Qwen3-VL 2b/4b/8b standalone:** superseded by Qwen3.5 unified multimodal family at every size.
- **Granite Docling 258M:** specialist doc-structured model but not general captioning, and IBM's ecosystem is less plug-and-play.
- **whisper.cpp via pywhispercpp for all platforms:** Metal wins on Mac (3× faster), but on Windows/Linux faster-whisper's native Python API + built-in Silero VAD is simpler and slightly faster on x86 CPU. Code will branch at runtime in Week 2.
- **Distil-whisper large-v3:** 6× faster than large-v3 at ~0.1% WER cost, but is 756 MB / 1.5 GB INT8 vs base.en's 142 MB; base.en is already fast enough for 2-3 second voice queries.
- **Nomic Embed Text v2-moe:** community upload on Ollama (958 MB), only 512 ctx window — not an upgrade over v1.5 at 274 MB / 8K ctx.
- **BGE-M3 / mxbai-embed-large:** mxbai is 670 MB and limited to 512-token chunks; BGE-M3 is 1.2 GB. Nomic v1.5 is 274 MB with 8K context and won the localaimaster retrieval hit@1 benchmark.
- **Qwen3-Embedding-0.6B (639 MB):** slightly better MTEB (64.3 vs 62.3) but 2.3× the size. English-only EchoMem doesn't need multilingual; nomic is the right size/speed/accuracy trade-off.
- **Qwen3-TTS (0.6B/1.7B):** Apache 2.0, voice cloning from 3s, but NVIDIA-only (no Mac/CPU support as of mid-2026). Team has no NVIDIA GPUs.
- **Chatterbox-Turbo (350M, MIT):** beat ElevenLabs in blind tests, needs ~6 GB RAM during inference — too large alongside the rest of our stack on 8 GB.
- **OuteTTS / Supertonic 3 (99M):** promising alternatives (Supertonic does 31 languages), but less mature than Kokoro and Kokoro's pykokoro pip package + ONNX runtime is the simplest CPU path.
- **Piper TTS:** fast, GPL-3.0 (license incompatibility with MIT release plan), worse prosody than Kokoro. Kept as documented future fallback.
- **Porcupine (Picovoice):** commercial, no longer offers a free tier (7-day eval only as of late 2024). Unacceptable for a student FYP to be locked out.
- **openWakeWord vanilla:** replaced by livekit-wakeword (100× fewer FPs, drop-in ONNX compat, single-command training).
- **LanceDB:** retained for vector storage (embedded, Apache 2.0, Arrow columnar, disk-based). Chroma is easier for prototyping but slower; FAISS is fastest but has no persistence story; LanceDB is the right middle ground for a shipped local app.

## Post-v1
- Performance profiles (Eco/Balanced/Perf) with explicit model locking
- whisper.cpp Metal path for M-series Mac STT (3× speedup)
- Distil-whisper or Whisper large-v3-turbo for higher-accuracy STT
- Multilingual support (Qwen3-Embedding for non-English; Kokoro multilingual voices)
- Chatterbox-Turbo or Qwen3-TTS when team gets GPU access
- Gemma 4 or Qwen3.5 9B as premium+ tier for 16 GB machines
