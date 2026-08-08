# EchoMem Roadmap (12 Months)

---

## Phase 0 — Foundations (Month 1)
- [ ] Final proposal signed off by guide
- [x] Private repo initialized, scaffolding, README, docs
- [ ] Lit survey (10 papers summarized across team)
- [ ] All three dev environments working (Python 3.11, Node 20+, Ollama installed)
- [ ] Hello-world scripts verified: Whisper transcription, Moondream caption, Ollama chat, mss screenshot, sounddevice audio capture, FastAPI /health endpoint
- [ ] First Friday demo: talking to local Phi via a tiny CLI
- **Deliverable:** Approved proposal; green dev environments

## Phase 1 — MVP Capture & Retrieval (Months 2–3)
- [ ] Screenshot capture (mss) with basic interval timer
- [ ] Mic capture (sounddevice) with webrtcvad silence detection
- [ ] pHash screenshot deduplication
- [ ] Basic PII regex redaction
- [ ] Local storage folder structure (plaintext first — encryption in Phase 4)
- [ ] LanceDB embeddings (bge-small) for screenshots + transcripts
- [ ] SQLite FTS5 for keyword search
- [ ] Hybrid vector + keyword search
- [ ] Ugly CLI / curl-based Q&A over captures
- **Deliverable:** End-to-end "capture → store → ask → get answer" (MVP v0, no UI, no encryption, no smart filtering)

## Phase 2 — AI Pipeline (Months 4–6)
- [ ] faster-whisper batch transcription
- [ ] Moondream2 captioning + OCR pipeline
- [ ] Tier 1 short-term (48h raw) store
- [ ] Phi-3.5 via Ollama for answer synthesis with citation to screenshot/audio
- [ ] Basic answer frontend (simple React chat, no overlay yet)
- [ ] Male/female Piper TTS voice output
- **Deliverable:** Typed Q&A with cited screenshots, working AI answers (v0.5)

## Phase 3 — Smart Capture & Importance Filtering (Months 7–8)
- [ ] Real-time privacy gate (Moondream2 before-save check for passwords/banking/OTP/incognito)
- [ ] App/window title detection (cross-platform)
- [ ] Importance scoring 1–5 per capture
- [ ] Dynamic capture rate based on importance
- [ ] Semantic note generation instead of raw saves for low/mid importance
- [ ] Audio classification (speech vs music vs silence)
- [ ] Smart blocklist (learns from user-flagged content)
- [ ] 100-question evaluation dataset built across team
- **Deliverable:** Smart, privacy-aware capture; eval framework ready

## Phase 4 — Encrypted Permanent Memory (Months 8–9)
- [ ] AES-256-GCM envelope encryption
- [ ] PBKDF2 key derivation from master password + OS keychain
- [ ] Per-day rotating wrapped data keys
- [ ] Sealed key binding (keys only released to unmodified binary)
- [ ] 4KB random-sharded encrypted storage with per-day encrypted map
- [ ] Background re-shuffling on launch
- [ ] Tiered memory (daily/weekly/monthly summaries via Phi nightly)
- [ ] Archived WebP/Opus compression
- [ ] Tiered retrieval router
- [ ] Hard outbound network block
- [ ] Memory locking (mlock) and zeroization
- [ ] Process integrity self-check
- [ ] Optional QLoRA personalization pipeline (default off, user-approved facts, DP noise, idle/plugged-in training only)
- [ ] Eco/Balanced/Performance profiles
- **Deliverable:** Production-grade encrypted permanent memory, private personalization

## Phase 5 — Jarvis UX & 3-Factor Unlock (Months 9–10)
- [ ] Custom wake word via openWakeWord (user chooses phrase)
- [ ] System authentication (Windows Hello / Touch ID / OS password via `keyring`)
- [ ] Voiceprint enrollment + random-number anti-replay challenge (ECAPA-TDNN)
- [ ] Optional face+eye blink detection (FaceNet + OpenCV), auto-offered if webcam detected
- [ ] Master password gate for Level 3 actions
- [ ] Siri-style sliding overlay UI (waveform, answer bubbles, citation thumbnails)
- [ ] System tray integration (pystray)
- [ ] Global hotkey
- [ ] Safe OS actions with voice confirmation (open apps, reminders, approved messaging, volume/brightness/lock)
- [ ] Guest mode
- [ ] Auto-lock on idle, RAM zeroization
- [ ] Instant wipe functionality
- [ ] Privacy audit dashboard
- [ ] Settings popover (voice, unlock, memory, personalization, performance)
- [ ] Assistant name + voice customizer in onboarding
- **Deliverable:** Full Jarvis-style voice UX, 3-factor unlock, sliding overlay

## Phase 6 — Polish, Testing & Cross-Platform (Months 10–11)
- [ ] Full benchmarks across 6/8/16GB hardware
- [ ] Quantization ablation study (Q4/Q6/Q8)
- [ ] Recall/latency/RAM numbers final
- [ ] Unit + integration tests across modules
- [ ] Cross-platform testing on Windows 11, macOS 13+, Ubuntu 22.04
- [ ] PyInstaller packaging for installers
- [ ] Onboarding flow (name your assistant, voice, password, optional face enrollment)
- [ ] Idle-time auto-unload of models
- **Deliverable:** v1.0-rc installers, benchmark numbers locked

## Phase 7 — Wrap-Up (Months 11–12)
- [ ] Finalize research paper (LaTeX)
- [ ] Record cinematic demo video (wake word, ask question, OS action, privacy dashboard)
- [ ] Final presentation slides
- [ ] Defense / viva
- [ ] Decision on future public release (post-submission)
- **Deliverable:** Submitted paper, tagged v1.0, final presentation
