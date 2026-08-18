# EchoMem v1 — REST + WebSocket API

Backend: FastAPI on `http://127.0.0.1:8000`. CORS allows `http://localhost:5173`
and `http://127.0.0.1:5173` (Vite dev server). No network calls leave localhost.

Conventions: JSON request/response, `200` on success, `403` if locked, `400` on
bad input, `500` with sanitised message on model failure.

---

## GET `/health`

Liveness probe + version + model manifest. Never requires unlock.

Response:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "locked": false,
  "capture_running": false,
  "models": {
    "stt": "faster-whisper base.en INT8 (CTranslate2)",
    "tts": "Kokoro-82M via pykokoro ONNX (voice af_heart)",
    "multimodal": "qwen3.5:2b-q4_K_M",
    "captioner": "qwen3.5:2b-q4_K_M",
    "embedder": "nomic-embed-text:v1.5",
    "wake": "livekit-wakeword (Conv-Attention ONNX)"
  }
}
```

## POST `/auth/unlock`

v1: single master password. Multi-factor unlock (voiceprint / face / challenge)
is post-v1 per `FUTURE_WORK.md §F1`.

Request: `{ "password": "string" }`
Response: `{ "ok": true }` | `401 { "detail": "wrong password" }`

## POST `/auth/lock`

Erase in-memory key, stop capture loop, go back to locked state.

Response: `{ "ok": true }`

## GET `/status`

Snapshot of runtime state.

Response (locked):
```json
{ "locked": true, "capture_running": false }
```

Response (unlocked):
```json
{
  "locked": false,
  "capture_running": true,
  "capture_interval_s": 3.0,
  "wake_phrase": "Hey Echo",
  "llm": "qwen3.5:2b-q4_K_M"
}
```

## POST `/capture/start`

Start screen capture loop (mss + pHash + caption + privacy gate + embed).
Requires unlock.

Response: `{ "ok": true, "running": true }`

## POST `/capture/stop`

Stop capture loop.

Response: `{ "ok": true, "running": false }`

## POST `/query`

Text-in, text-out RAG (the UI textbox path). Requires unlock.

Request:
```json
{ "text": "When did I last open Chrome?", "top_k": 5 }
```

Response:
```json
{
  "answer": "You were looking at Chrome about 10 minutes ago, on the Login page at example.com.",
  "citations": [
    { "app": "chrome", "title": "Login page — example.com", "timestamp": 1728650000, "snippet": "..." }
  ]
}
```

## POST `/settings`

Update runtime settings (wake phrase, capture interval). Requires unlock.

Request (all optional):
```json
{ "wake_phrase": "Hey Raven", "capture_interval_s": 2.0 }
```

Response: echoes current settings.

## WS `/listen`

Streaming voice endpoint (wake → STT → query → TTS). Implemented in Weeks 3–4.

Client messages (text):
- `ping` → `{ "state": "idle" }`
- `start_mic` → server starts listening for wake word / accepting audio
- `stop_mic` → server stops

Server messages (JSON):
- `{ "state": "idle" | "listening" | "transcribing" | "thinking" | "speaking" }`
- `{ "type": "partial", "text": "..."}` during STT
- `{ "type": "final", "answer": "...", "citations": [...] }`
- `{ "type": "error", "message": "..." }`

Stub currently echoes input; Week 3 wires sounddevice + wake + STT + TTS.

---

## Endpoints deferred to post-v1 (documented for later, NOT in v1 server)

- `POST /unlock/voiceprint` — voiceprint second factor
- `POST /unlock/face` — face + eye-blink optional factor
- `POST /actions/open`, `/actions/volume`, `/actions/message`, etc. — OS actions
- `POST /personalisation/train`, `DELETE /personalisation/adapter` — QLoRA
- `GET /timeline`, `/timeline?day=YYYY-MM-DD` — timeline browser UI
- `POST /guest/enter`, `POST /guest/exit` — ephemeral guest mode
