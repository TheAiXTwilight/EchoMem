# EchoMem v1 — System Architecture

## High-level view

```
 ┌─────────────────────────────────────────────────────────────┐
 │  React UI (localhost:5173)                                  │
 │   chat UI · mic button · lock screen · settings             │
 └───────────────────────────▲─────────────────────────────────┘
                             │ plain HTTP/WebSocket on 127.0.0.1 only
 ┌───────────────────────────┴─────────────────────────────────┐
 │  FastAPI backend (127.0.0.1:8000)                           │
 │                                                            │
 │   ┌──────────┐   ┌──────────┐   ┌──────────┐               │
 │   │ /capture │   │ /query   │   │  /auth   │               │
 │   │ /listen  │   │ /status  │   │          │               │
 │   └────┬─────┘   └────┬─────┘   └────┬─────┘               │
 │        │              │              │                      │
 │   ┌────┴──────────────┴──────────────┴──────┐              │
 │   │         capture / pipeline layer        │              │
 │   │  mss screenshots · pHash dedup          │              │
 │   │  window title · wake-word trigger       │              │
 │   └────┬───────────────────────┬────────────┘              │
 │        │ frame                 │ voice query                │
 │        ▼                       ▼                            │
 │   ┌────────────────────────────────────┐                    │
 │   │       Qwen3.5 (UNIFIED)           │                    │
 │   │  floor:0.8B | default:2B | prem:4B │                    │
 │   │  - captions + privacy gate          │                    │
 │   │  - RAG answer synthesis             │                    │
 │   │  (single Ollama model, no swap)    │                    │
 │   └────┬───────────────┬───────────────┘                    │
 │        │ STORE         │ STT text                            │
 │        ▼               ▼                                     │
 │   ┌────────────┐  ┌─────────────┐                           │
 │   │ AES-256-GCM│  │ faster-     │                           │
 │   │ encrypt    │  │ whisper     │                           │
 │   └────┬───────┘  │ base.en     │                           │
 │        │          └─────┬───────┘                           │
 │        ▼ embed          │ embed                              │
 │   ┌────────────┐        ▼                                    │
 │   │ nomic-     │  ┌─────────────┐   ┌─────────────┐         │
 │   │ embed-text │  │ LanceDB     │──▶│ Qwen3.5     │         │
 │   │ :v1.5      │  │ (flat idx)  │   │ (same model)│         │
 │   └────┬───────┘  └─────────────┘   └─────┬───────┘         │
 │        │                                   │ answer          │
 │        ▼               ┌─────────────┐     ▼                 │
 │   ┌────────────┐       │ Kokoro-82M  │◀───┘ speech bytes     │
 │   │ data/db/   │       │ via pykokoro│                       │
 │   │ screenshots│       │ (ONNX, CPU) │                       │
 │   │ + SQLite   │       └─────┬───────┘                       │
 │   │ + LanceDB  │             ▼                               │
 │   └────────────┘          ▶ speakers                         │
 └─────────────────────────────────────────────────────────────┘
```

All boxes run **on the same laptop**. Nothing crosses the network. Ollama
manages the unified Qwen3.5 model + nomic-embed-text locally on
`http://127.0.0.1:11434`; our backend talks to it but never to any other host.

## Module map (matches `backend/` directory)

| Module | Responsibility | Status v1 |
|---|---|---|
| `capture/screen.py` | mss loop, pHash dedup, raw screenshot saves | Built Week 1 |
| `capture/window.py` | Windows app + title detection | Built Week 1 |
| `capture/wake.py` | livekit-wakeword background listener (100× fewer FPs than openWakeWord) | Built Week 3 |
| `models/llm.py` | Unified Qwen3.5 multimodal: captions + privacy + RAG answer | Built Week 2 |
| `models/embedder.py` | nomic-embed-text:v1.5 embeddings (768-dim, via Ollama) | Built Week 2 |
| `models/stt.py` | faster-whisper base.en INT8 (CTranslate2, CPU) | Built Week 3 |
| `models/tts.py` | Kokoro-82M via pykokoro ONNX (Apache 2.0, af_heart default voice) | Built Week 3 |
| `models/lora.py` | QLoRA personalisation | **Stub (post-v1)** |
| `privacy/gate.py` | regex/keyword blocklist + VLM decision fusion | Built Week 2 |
| `privacy/encryption.py` | AES-256-GCM + PBKDF2 (100k iters) | Built Week 3 |
| `storage/sqlite_store.py` | metadata (id, ts, app, title, caption, file paths) | Built Week 1 |
| `storage/vector_store.py` | LanceDB embeddings (flat index v1) | Built Week 2 |
| `retrieval/retriever.py` | embed question → vector search → context pack | Built Week 2 |
| `unlock/voiceprint.py` | ECAPA-TDNN voiceprint + 3-digit challenge | **Stub (post-v1)** |
| `unlock/face_unlock.py` | FaceNet + eye-blink | **Stub (post-v1)** |
| `actions/os_controls.py` | Open/volume/message actions | **Stub (post-v1)** |
| `main.py` | FastAPI app, lifecycle, REST+WS routes | Week 1+ |

## Data flow (capture path)

1. `ScreenCapture` captures frame → PIL Image → pHash.
2. If pHash distance vs previous frame < threshold → skip.
3. Otherwise, fetch foreground app/title (Windows only v1).
4. Send image + title to Qwen3.5 → `(caption, store?)`.
5. Run regex `privacy.gate.should_store(caption, title, app)` — if either VLM
   or regex says DROP, discard frame (no disk write).
6. Embed caption with nomic-embed-text:v1.5.
7. Encrypt WebP thumbnail + caption with master key (AES-256-GCM).
8. Write ciphertext to `data/db/...`, insert metadata row into SQLite, insert
   embedding + (id) into LanceDB.

## Data flow (query path)

1. Wake word fires OR user types in UI.
2. If voice: record with sounddevice until VAD silence (webrtcvad), transcribe via faster-whisper.
3. Embed transcribed/text question with nomic-embed-text.
4. Top-k vector search in LanceDB → returns ids; fetch metadata from SQLite;
   decrypt captions in memory.
5. Build prompt with system instructions + top-k `(app, title, time, caption)`
   context; call Qwen3.5 (same model already in memory — no load).
6. Stream text response to UI; also send to Kokoro and play audio.

## Key architectural change (Aug 18 v2): UNIFIED MULTIMODAL MODEL

v1 originally planned two separate Ollama models: a text-only chat LLM + a
separate vision-language model (VLM) for captions, requiring model swap/eviction
between capture and query. v2 uses **one Qwen3.5 model at every tier that does
both chat and vision natively**. Benefits:

- **~1.4 GB RAM saved** on default tier (1.9 GB Qwen3.5-2B vs 3.3 GB qwen3:1.7b + qwen3-vl:2b).
- **No model-swap latency** (Ollama doesn't need to unload VLM / load chat LLM).
- **Simpler code** (single `ECHOMEM_MODEL` env var, single model class).
- **Better quality** at every tier (Qwen3.5 4B beats phi-4-mini + has vision;
  Qwen3.5 0.8B beats Moondream at OCR).
- **256K context** across all tiers (vs 32K-128K on older models).

## Memory model in v1 (simplified vs full design)

| Tier | Retention | Content |
|---|---|---|
| Hot | 48 hours | Encrypted WebP thumbnails (q=55, max 1280px) + captions |
| Permanent | Forever | Caption + embedding + timestamp + app/title |
| Raw | 0 (v1) | No raw screenshots kept post-capture (deleted after captioning) |

The richer 3-tier/90-day/semantic-triple/nightly-consolidation design from the
original PRD is deferred to post-v1 (see `FUTURE_WORK.md`).

## Security model in v1

- Single master password → PBKDF2 (100k iters) → AES-256-GCM key → encrypt all
  persisted data.
- Key lives only in process memory; `/auth/lock` drops the reference.
- All listeners bind to `127.0.0.1`; CORS restricted to `localhost:5173`.
- Privacy gate drops sensitive frames BEFORE any disk write.
- No outbound HTTP calls in our code. (Models are pulled once during setup;
  after that the system is intended to be airgapped.)
- Envelope encryption, per-day key rotation, mlock, block reshuffling — all
  deferred to post-v1.

## Concurrency

- FastAPI runs on uvicorn with async routes for the WS endpoint; CPU-heavy
  model calls go to a thread-pool executor to avoid blocking the event loop.
- Capture loop runs in a single daemon thread; queries run on-demand (no
  batching in v1).
- SQLite is opened in `check_same_thread=False` with a single write connection;
  LanceDB is accessed via its native writer.

## Memory budget (worst case — active voice query, 8 GB Windows, default tier)

| Component | RAM |
|---|---|
| Windows + Chrome + VS Code (background) | 3.0 GB |
| Unified multimodal model (qwen3.5:2b-q4_K_M) | 1.9 GB |
| faster-whisper base.en INT8 | 0.3 GB |
| nomic-embed-text:v1.5 | 0.3 GB |
| Kokoro ONNX + voice (af_heart) | 0.2 GB |
| livekit-wakeword ONNX | 0.1 GB |
| Python + FastAPI + React UI | 0.6 GB |
| Audio buffers + screenshot frames | 0.3 GB |
| **Total** | **~6.7 GB — ~1.3 GB headroom, no swap** |

Premium tier (M2/M3 Air 8 GB unified): qwen3.5:4b-q4_K_M (3.4 GB) → total ~7.3 GB; macOS compresses inactive pages.

## Performance budget (8 GB laptop, Windows)

| Stage | Budget |
|---|---|
| Screen capture + pHash | < 50 ms |
| Qwen3.5 caption (2B tier, background) | 2–4 s/frame |
| Embedding (nomic-embed-text) | < 50 ms |
| Encryption + write | < 10 ms |
| STT (voice query, faster-whisper base.en CPU) | < 2 s |
| Retrieval (embed + LanceDB search) | < 200 ms |
| Qwen3.5 answer synthesis | 4–8 s |
| TTS synthesis + playback (Kokoro) | 1–2 s |
| End-to-end (voice question → voice answer) | ≤ 12 s p95 |
