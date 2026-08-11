# EchoMem v1 — System Architecture

## High-level view

```
 ┌─────────────────────────────────────────────────────────────┐
 │  React UI (localhost:5173)                                  │
 │   chat UI · mic button · lock screen · settings             │
 └───────────────────────────▲─────────────────────────────────┘
                             │ HTTPS? no — plain HTTP/WebSocket
                             │ on 127.0.0.1 only
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
 │   ┌────────────┐          ┌────────────┐                    │
 │   │ Moondream2 │          │faster-     │                    │
 │   │ 1.8B Q4    │          │whisper     │                    │
 │   │ caption +  │          │ tiny.en    │                    │
 │   │ privacy    │          └─────┬──────┘                    │
 │   │ gate       │                │ STT text                  │
 │   └────┬───────┘                ▼                            │
 │        │ STORE           ┌────────────┐                     │
 │        ▼                 │ bge-small  │                     │
 │   ┌────────────┐         │ embed      │                     │
 │   │ AES-256-GCM│         └─────┬──────┘                     │
 │   │ encrypt    │               │ embed                      │
 │   └────┬───────┘               ▼                            │
 │        │ ciphertext     ┌────────────┐    ┌────────────┐    │
 │        ▼               │ LanceDB    │───▶│ Qwen2.5    │    │
 │   ┌────────────┐        │ (flat idx) │    │ 0.5B Q4    │    │
 │   │ data/db/   │        └────────────┘    └─────┬──────┘    │
 │   │ screenshots│         ┌────────────┐          │ answer   │
 │   │ + SQLite   │         │ Piper TTS  │◀─────────┘          │
 │   │ + LanceDB  │         └─────┬──────┘  TTS bytes          │
 │   └────────────┘               ▼                            │
 │                              ▶ speakers                     │
 └─────────────────────────────────────────────────────────────┘
```

All boxes run **on the same laptop**. Nothing crosses the network. Ollama
manages Moondream + Qwen locally on `http://127.0.0.1:11434`; our backend talks
to it but never to any other host.

## Module map (matches `backend/` directory)

| Module | Responsibility | Status v1 |
|---|---|---|
| `capture/screen.py` | mss loop, pHash dedup, raw screenshot saves | Built Week 1 |
| `capture/window.py` | Windows app + title detection | Built Week 1 |
| `capture/wake.py` | openWakeWord background listener | Built Week 3 |
| `models/captioner.py` | Moondream2 captions + privacy verdict | Built Week 2 |
| `models/embedder.py` | bge-small-en embeddings | Built Week 2 |
| `models/llm.py` | Qwen2.5-0.5B RAG synthesis | Built Week 2 |
| `models/stt.py` | faster-whisper transcription | Built Week 3 |
| `models/tts.py` | Piper TTS playback | Built Week 3 |
| `models/lora.py` | QLoRA personalisation | **Stub (post-v1)** |
| `privacy/gate.py` | regex/keyword blocklist + VLM decision fusion | Built Week 2 |
| `privacy/encryption.py` | AES-256-GCM + PBKDF2 | Built Week 3 |
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
4. Send image + title to Moondream → `(caption, store?)`.
5. Run regex `privacy.gate.should_store(caption, title, app)` — if either VLM
   or regex says DROP, discard frame (no disk write).
6. Embed caption with bge-small-en.
7. Encrypt WebP thumbnail + caption with master key.
8. Write ciphertext to `data/db/...`, insert metadata row into SQLite, insert
   embedding + (id) into LanceDB.

## Data flow (query path)

1. Wake word fires OR user types in UI.
2. If voice: record with sounddevice until VAD silence, transcribe via Whisper.
3. Embed transcribed/text question.
4. Top-k vector search in LanceDB → returns ids; fetch metadata from SQLite;
   decrypt captions in memory.
5. Build prompt with system instructions + top-k `(app, title, time, caption)`
   context; call Qwen.
6. Stream text response to UI; also send to Piper and play audio.

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
- No outbound HTTP calls in our code. (Ollama and Piper models are pulled once
  during setup; after that the system is intended to be airgapped.)
- Envelope encryption, per-day key rotation, mlock, block reshuffling — all
  deferred to post-v1.

## Concurrency

- FastAPI runs on uvicorn with async routes for the WS endpoint; CPU-heavy
  model calls go to a thread-pool executor to avoid blocking the event loop.
- Capture loop runs in a single daemon thread; queries run on-demand (no
  batching in v1).
- SQLite is opened in `check_same_thread=False` with a single write connection;
  LanceDB is accessed via its native writer.

## Performance budget (8 GB laptop, Windows)

| Stage | Budget |
|---|---|
| Screen capture + pHash | < 50 ms |
| Moondream caption | 2–4 s/frame (runs in background, not on query path) |
| Embedding | < 50 ms |
| Encryption + write | < 10 ms |
| STT (voice query) | < 2 s |
| Retrieval (embed + search) | < 200 ms |
| Qwen answer synthesis | 4–8 s |
| TTS synthesis + playback | 1–2 s |
| End-to-end (voice question → voice answer) | ≤ 12 s p95 |
