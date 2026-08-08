# Product Requirements Document — EchoMem

| Field | Value |
|-------|-------|
| Version | 0.1 (Draft) |
| Status | Approved for development |
| Last updated | 2026-07 |
| Repository | Private |

---

## 1. Problem Statement
Digital work and learning scatter information across lectures, code, papers, chats, and browsers. Existing AI memory assistants (Rewind AI, Apple Intelligence, Windows Recall) require cloud processing, premium hardware, or closed platforms — and none offer private, user-named, offline, three-factor-authenticated Jarvis-style voice control with permanent encrypted memory.

## 2. Product Vision
A fully offline, private, Jarvis-style voice assistant that watches, listens, remembers, and answers on ordinary consumer laptops, customizable by the user (name, voice, wake word), with industry-strength privacy.

## 3. Users
- **Primary:** University students (lecture recall, study notes, deadline memory)
- **Secondary:** Developers, researchers, remote workers, privacy-conscious power users
- **Hardware target:** 6 GB / 8 GB / 16 GB consumer laptops with built-in mic; webcam optional.

## 4. Core Principles
- **Privacy-first:** zero cloud, default-on encryption, user-approved everything
- **Offline after download:** runs without internet
- **Customizable persona:** user picks assistant name, wake word, voice
- **Tiered unlock:** progressive access, never gives sensitive data without strongest auth
- **Reversible actions only:** no destructive OS control
- **Works on low-end hardware:** Eco profile for 6GB laptops
- **Minimal UI:** voice-first, Siri-style sliding overlay, no bloat

## 5. Core User Stories

### Identity & Setup
- On first launch, I can name my assistant, pick a wake word (or custom phrase), pick male/female/default voice, and set a master password
- I can re-name / re-voice my assistant anytime in settings

### Capture & Privacy
- Assistant runs quietly in the tray, capturing only meaningful moments
- It automatically blocks password fields, banking, incognito, OTPs before anything is saved
- I can pause/resume capture anytime
- I can blacklist specific apps/websites
- I can view a privacy dashboard of what was captured/blocked

### Memory & Recall
- I ask a question by voice or typing, assistant answers in voice with cited references (screenshot thumbnail, audio clip, timestamp)
- I can ask about any day, person, topic, file, or lecture — even years back
- "Remember this" permanently pins the current moment
- I can wipe any memory instantly
- Daily/weekly summaries on demand

### Unlock
- Assistant wakes on wake word
- Level 1 (quick queries): system biometric/password
- Level 2 (full memory): voiceprint challenge (random numbers, anti-replay)
- Level 3 (sensitive: settings, wipe, personalization, messages): secondary master password
- Face+eye unlock is offered automatically if a webcam exists, as an optional additional step
- Auto-locks after configurable idle time
- Guest mode: one-click lock for laptop sharing

### OS Control (Safe Only)
- "Open the RAG paper I was reading Tuesday" → opens file
- "Set reminder for 5PM Friday" → native notification
- "Send Priya on Slack: running 10 minutes late" → shows full message + recipient, speaks it back, sends only after I confirm
- "Volume up / Play / Lock my laptop / Minimize windows"
- "Turn on Wi-Fi / Bluetooth"
- Always speaks the action aloud and waits for my confirmation before execution.

### Personalization (Optional, Off by Default)
- Toggle to "learn my style/habits"
- Weekly review screen shows proposed facts (✅/❌ per item), nothing trained until approved
- Training runs only on idle/plugged-in
- One-click "Erase personalization"
- Disabled by default on Eco profile.

### Performance Profiles
- **Eco (6 GB):** smallest models (Whisper-tiny, Qwen-0.5B, 15s capture interval, no face unlock on by default)
- **Balanced (8 GB):** Whisper-tiny, Moondream2, Phi-3.5, 5s interval
- **Performance (16 GB+):** Whisper-base, Moondream2 Q6, Phi-3.5 Q6, 3s interval, face unlock enabled

## 6. Non-Goals (v1.0)
- Cloud sync or multi-device
- Webcam recording (unlock only, 2 sec per check)
- Destructive OS actions (deletes, installs, admin commands, payments, email sending)
- Proactive interruption (only optional gentle "you left this open" tray notifications, off by default)
- Mobile app
- Voice cloning by default (optional post-v1.0)
- Custom model training beyond QLoRA personalization

## 7. Success Metrics

### Product
- Recall@10 > 75% on our internal 100-question eval
- Idle RAM ≤ 600 MB (Balanced), ≤ 500 MB (Eco)
- End-to-end answer latency ≤ 12 seconds on 8GB CPU
- Cold start < 5 seconds
- Privacy gate accuracy > 95% in blocking private content

### Security
- All data encrypted at rest, no plaintext on disk
- No outbound network calls possible (verified by test)
- 3-factor unlock cannot be bypassed with a recording or static photo
- Instant cryptographic wipe works in < 1 second

### Usability
- First-run setup < 5 minutes
- Wake word false accept < 1/day typical use
- 100% of OS actions require explicit user confirmation

## 8. Hardware Support (Minimum)
- 6 GB RAM, quad-core CPU (2018+), built-in mic, ~10 GB free disk
- Webcam is optional; face unlock is offered only if detected
- GPU optional, accelerates inference if present
- Windows 10/11, macOS 12+, Ubuntu 20.04+

## 9. Roadmap
See [`ROADMAP.md`](../process/ROADMAP.md) for full phase-by-phase plan.

## 10. Licensing & Access
- **Private repository** — not open to public during development. Decision on public release to be made post-submission. All code remains internal/proprietary to the team for the duration of the FYP.
