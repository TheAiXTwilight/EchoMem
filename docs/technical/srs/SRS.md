# Software Requirements Specification (SRS) — EchoMem v1

## 1. Purpose
EchoMem is a **privacy-first local memory assistant** that runs on a user's
laptop, passively captures screen context, stores semantic memories in
encrypted local storage, and answers natural-language questions about the user's
past activity by voice. v1 is the October 2026 FYP submission.

## 2. Scope
See `docs/process/SCOPE_V1.md` for the binding scope contract. In short:
screen-only capture, single master password, Qwen 0.5B LLM, Windows demo
target, React chat UI on localhost.

## 3. Definitions
- **Memory**: one caption + embedding + metadata (timestamp, app, title) for a
  captured screen moment.
- **Locked**: ciphertext on disk, no in-memory key, no capture, no queries.
- **Wake phrase**: custom voice phrase that triggers STT (default `Hey Echo`).
- **Privacy gate**: decision (STORE/DROP) per captured frame based on Moondream
  VLM verdict + regex blocklist.

## 4. Functional requirements

### FR-1 Screen capture
The system shall capture the primary screen at a configurable interval
(default 3s), compute a perceptual hash (pHash), and skip frames whose pHash
distance to the previous frame is < a threshold (visual-dedup).

### FR-2 Context
The system shall record the foreground application name and window title at
capture time on Windows. On unsupported OS it shall record `null`.

### FR-3 Captioning
Each stored frame shall be passed through a local VLM (Moondream2 1.8B Q4) to
produce a 1–2 line English caption.

### FR-4 Privacy gate
Each frame shall be classified STORE or DROP. Frames classified DROP (passwords,
OTP, banking, incognito, credit card, adult content per caption + title) shall
be discarded immediately without being written to disk.

### FR-5 Encryption
All persisted memories and screenshots shall be encrypted with AES-256-GCM
using a key derived from the user's master password via PBKDF2-HMAC-SHA256
(100,000 iterations). There is no backdoor.

### FR-6 Voice activation
The system shall listen in the background for a configurable wake phrase via
openWakeWord. Detection shall trigger STT.

### FR-7 Speech-to-text
Voice queries shall be transcribed via faster-whisper `tiny.en` running locally.

### FR-8 Semantic retrieval
Given a user query, the system shall embed it with bge-small-en-v1.5, retrieve
the top-5 most semantically similar captions from LanceDB, and pass them to
the LLM.

### FR-9 Answer synthesis
A local LLM (Qwen2.5-0.5B-instruct Q4) shall synthesise a natural-language
answer citing which memories were used.

### FR-10 Text-to-speech
Answers shall be spoken back via Piper TTS using a user-selectable voice.

### FR-11 UI
A React dark-mode chat UI served on localhost shall expose: password unlock
screen, message history, mic button, text input, capture start/stop, lock
button, and settings.

### FR-12 Network
The system shall make no outbound network requests. All models run locally,
all endpoints bind to `127.0.0.1` only.

### FR-13 Lifecycle
The user can lock (FR-13a) and unlock (FR-13b) memory at any time. Locking
shall zero in-memory key material and stop capture.

## 5. Non-functional requirements

| ID | Attribute | Requirement (v1) |
|---|---|---|
| NFR-1 | Privacy | 100% local; encrypted at rest; no outbound network; drops sensitive frames before storage |
| NFR-2 | Performance | Idle RAM ≤ 600 MB; answer latency ≤ 12s p95 on 8 GB CPU; cold start < 10s |
| NFR-3 | Accuracy | Recall@5 ≥ 65% on internal 100-question benchmark; privacy-gate TP ≥ 90% on labelled set |
| NFR-4 | Robustness | App fails closed (locked) on encryption or model errors |
| NFR-5 | Usability | Non-technical user can unlock + start capture + ask a question within 60s |
| NFR-6 | Portability | Demo target Windows 10/11; best-effort macOS/Ubuntu; no GPU required |
| NFR-7 | Storage | ≤ 500 MB per year of typical use (captions + embeddings + thumbnails) |
| NFR-8 | Security | AES-256-GCM + PBKDF2; CORS restricted to localhost dev server |

## 6. Out of scope (v1)
See `docs/process/FUTURE_WORK.md` for the full deferred list including 3-factor
unlock, voiceprint/face biometrics, QLoRA personalisation, OS actions,
tray/guest modes, cross-platform installers, and the Phi-3.5 LLM upgrade.

## 7. Constraints
- 3 CS undergrads, 6 weeks, ~540 person-hours total.
- Target hardware: 8 GB RAM, no GPU, built-in mic.
- All AI models must run CPU-only on quantized weights.
- No cloud APIs; no paid services.
- Repo stays private until after October submission.
