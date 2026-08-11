# EchoMem Roadmap — 6 Weeks to October 2026

Pair/mob program everything. Rotate who "drives" each 2-day sub-sprint. **Friday
demos to the guide every week, no exceptions** — demos are to a working
localhost build, not slides.

See `SCOPE_V1.md` for exactly what's in/out of v1 and `FUTURE_WORK.md` for
post-October work.

---

## Week 1 — Foundation (Aug 12–18)

Goal: every laptop can run the skeleton; screen capture + DB work.

| Day | Task | Driver |
|---|---|---|
| Mon | Team meeting; freeze `SCOPE_V1.md`; sign §4 of SCOPE_V1. All 3 laptops run `scripts/setup.sh`. Verify FastAPI `/health` returns 200, React loads on `:5173`, Ollama runs Qwen + Moondream, Whisper transcribes a test WAV, Piper speaks. | All (mob) |
| Tue | `backend/capture/screen.py`: mss screen-capture loop, screenshot to Pillow, pHash comparison, save to `data/captures/raw/`. | A |
| Wed | `backend/capture/window.py`: Windows foreground app + window title via `pygetwindow`/`win32gui`; raise `NotImplementedError` on Mac/Linux. Wire into capture loop. | B |
| Thu | `backend/storage/sqlite_store.py`: SQLite schema + insert/query; `GET /status`, `POST /capture/start`, `POST /capture/stop` endpoints on FastAPI. | C |
| Fri | **Demo #1 to guide**: "We press Start, it records screen changes with app context into a local DB, for 2 minutes. We press Stop." Ugly is fine. Update ROADMAP with any guide feedback. Start literature survey doc. | All |

Paper parallel: collect 15–20 refs (Windows Recall, Rewind AI, Mem, openWakeWord,
faster-whisper, Ollama, on-device LLM systems, private personal assistants).
Draft paper section 1 (Intro) in `paper/`.

## Week 2 — AI Pipeline (Aug 19–25)

Goal: screenshots → captions → embeddings → retrievable answers.

| Day | Task | Driver |
|---|---|---|
| Mon | `backend/models/captioner.py`: Moondream2 1.8B via Ollama — 1–2 line caption per frame. Include retry/timeout. | B |
| Tue | `backend/privacy/gate.py`: caption + title → STORE/DROP. Moondream short verdict prompt + regex/keyword blocklist (password, banking, incognito, OTP, credit card, adult). Hand-test 50 sensitive vs 50 normal screenshots. | C |
| Wed | `backend/models/embedder.py` (bge-small-en via fastembed) + `backend/storage/vector_store.py` (LanceDB, flat index, insert + query). `backend/retrieval/retriever.py`(question, top_k) → captions. | A |
| Thu | `backend/models/llm.py`: Qwen2.5-0.5B RAG — system prompt + top-k context → answer. | B |
| Fri | **Demo #2 in terminal**: pre-load 100 captured frames, type a question, get a reasonable answer with app + timestamp. | All |

Paper parallel: finish section 2 (Related Work), draft section 3 (System
Design) with architecture diagram.

## Week 3 — Voice + Encryption (Aug 26 – Sep 1)

Goal: "Hey Echo, …" → answer spoken back; data encrypted at rest.

| Day | Task | Driver |
|---|---|---|
| Mon | `backend/models/stt.py`: sounddevice + webrtcvad streaming to faster-whisper tiny.en. Return transcribed string. | C |
| Tue | `backend/capture/wake.py`: openWakeWord listener in a background thread; triggers STT on wake; custom phrase configurable. | A |
| Wed | `backend/models/tts.py`: Piper TTS enqueue + play via sounddevice; male/female voice switch. | B |
| Thu | `backend/privacy/encryption.py`: password → PBKDF2 key → AES-256-GCM encrypt/decrypt screenshots + caption records. `POST /auth/unlock`, `POST /auth/lock` endpoints. App fails closed if locked. | C |
| Fri | **Demo #3**: say "Hey Echo, when did I last open Chrome?" → wakes → transcribes → retrieves → answers out loud. Confirm DB file is unreadable without the password. | All |

Paper parallel: finish section 4 (Implementation) — libraries, model sizes,
encryption, why these choices.

## Week 4 — UI + End-to-End Polish (Sep 2–8)

Goal: non-engineer can sit down and use it. **Feature freeze EOD Friday.**

| Day | Task | Driver |
|---|---|---|
| Mon | React UI: password screen, dark chat layout, mic button, waveform canvas, user/assistant bubbles, citation chips (app + timestamp), lock icon, small settings popover (wake phrase, voice gender, interval). | A |
| Tue | Wire UI ↔ backend via fetch + WebSocket `/listen` (SSE fallback). Show "listening…/thinking…/speaking…" states. | B |
| Wed | Bug day: latency spikes, memory leaks (close Ollama contexts!), RAM capping at ≤600 MB idle. Add 48-hour raw-screenshot cleanup. Error toasts. | C |
| Thu | Dogfood: each team member runs EchoMem for 2 real hours of work, logs bugs in GitHub. Fix top 5. | All |
| Fri | **Demo #4 (final feature demo)** to guide on real use. After this: no new features. Only fixes, paper, and rehearsal. | All |

Paper parallel: draft section 5 (Evaluation setup) — benchmark plan, metrics.

## Week 5 — Evaluation + Paper Push (Sep 9–15)

Goal: numbers in the paper are real, not made up.

| Day | Task | Driver |
|---|---|---|
| Mon | Build 100-question benchmark: each member writes ~35 natural questions tied to their captured data, with ground-truth timestamps, into `tests/benchmark/questions.json`. | All |
| Tue | `tests/benchmark/run.py`: run all questions, score Recall@5/10, MRR. Record p50/p95 latency breakdown per stage. | A |
| Wed | Measure idle/active RAM, disk per day of capture, privacy-gate TP/FP on 100 labelled screenshots. Re-run until numbers are stable. | B |
| Thu | Write paper section 5 (Evaluation results) with tables + screenshots. | C |
| Fri | Write section 6 (Discussion / Limitations / Future Work) and section 7 (Conclusion). Full paper draft assembled. Team review pass. | All |

## Week 6 — Freeze, Rehearse, Submit (Sep 16–22)

| Day | Task |
|---|---|
| Sep 16 | Paper edits, citations, diagram polish (draw.io → PNG), UI screenshots. |
| Sep 17 | Second paper review; guide review pass. |
| Sep 18 | Address guide feedback; finalise bibliography. |
| Sep 19–20 | 5-minute demo script (onboarding → capture → voice Q&A → lock). Rehearse ≥ 3x. Record backup video in OBS. |
| Sep 21 | Freeze code (tag `v1.0`); export paper to PDF; bundle submission zip (code + paper + demo video + README). |
| Sep 22 | Submit. Take the rest of the day off. |

## Buffer: Sep 23 → Oct 15

Use *only* for:
- Guide-mandated changes
- Viva/oral exam prep
- Last-minute showstopper bugs
- Printing / binding / formatting the hard copy
- Department-specific upload steps

If buffer time remains and the team is rested, add **one** (1) nicety from
`FUTURE_WORK.md` — tray icon is the highest ROI. Do not start a second.

---

## Definition of Done for v1

A build is "done" when:
- [ ] Install + run on a fresh Windows 10/11 laptop per `SETUP.md` succeeds first try
- [ ] `GET /health` returns 200
- [ ] Saying "Hey Echo, what was I doing 5 minutes ago?" returns a spoken answer with ≥ 1 correct citation
- [ ] All data files under `data/db/` are unreadable without the master password
- [ ] 100-question benchmark numbers are recorded in the paper
- [ ] 6–8 page PDF compiles without errors
- [ ] 5-minute live demo runs end-to-end on demo laptop twice in a row without crashes
