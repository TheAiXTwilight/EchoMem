# Product Requirements Document — EchoMem v1

## Problem
Knowledge workers (students, developers, researchers) constantly switch
between browser tabs, apps, docs, and conversations. Within hours they can't
answer simple questions: *"When did I read that paper?"*, *"What did Priya say
about the deadline?"*, *"Which tab was that API in?"*. Existing "memory" tools
(Rewind AI, Windows Recall, Mem.ai) either require cloud upload, demand heavy
hardware, or aren't open about how they handle passwords/banking screens.

## Solution (v1)
A **100% offline** voice assistant that:
1. Passively captures your screen with smart dedup and app context
2. Drops sensitive content (passwords, banking, OTP, incognito) BEFORE saving anything
3. Encrypts everything at rest with a master password you hold
4. Lets you ask by voice or by typing: *"When did I …?"* / *"What did … say?"*
5. Answers with citations (app + time) and speaks back by voice
6. Runs on a regular 8 GB laptop with no GPU and no internet

This v1 is the October 2026 FYP submission. It is intentionally narrow:
memory + Q&A. No OS actions, no personalisation, no multi-factor unlock, no
native app — all those move to post-submission (see `FUTURE_WORK.md`).

## Target users for v1
- **Primary:** the 3 of us (we are the dogfood users).
- **Demo users:** our guide, classmates at the final viva, and any student
  who wants a privacy-first alternative to cloud memory tools.

## User stories (must work in demo)
- As a user, I boot the app, enter my password, and start capture in < 60 seconds.
- As a user, I browse/type normally for 10+ minutes while EchoMem runs in the background.
- As a user, I say "Hey Echo, what was I reading about CNNs earlier?" and I get an answer citing where and when.
- As a user, I open a password field or banking page and nothing from that screen appears in my memory.
- As a user, I click Lock and the data becomes unreadable until I re-enter the password.
- As a user, if I copy the `data/db/` folder to a USB stick, I cannot read anything without my password.
- As a user, I can close the browser tab (or `Ctrl+C` both terminals) and the app stops; nothing runs in the background I didn't start.

## Out of scope (v1) — these are explicitly NOT promised
- Opening apps / controlling OS / sending messages / setting reminders
- Continuous ambient audio capture / speaker diarisation
- Learning my style / adapting to me over time (QLoRA personalisation)
- Voiceprint or face unlock
- Mobile / tablet clients
- Sync across devices
- Cross-platform installers (run from source for v1)
- Tray icon, guest mode, desktop notifications
- Wayland support (Linux X11 works; Wayland best-effort)

See `docs/process/FUTURE_WORK.md` for the full post-submission roadmap.

## Success metrics for v1
- **Demo:** a live 5-minute walkthrough (see `TESTING.md` §2) completes twice
  in a row without failure.
- **Quantitative (paper):**
  - Recall@5 ≥ 65% on our 100-question benchmark
  - End-to-end answer latency ≤ 12s p95 on 8 GB CPU
  - Idle RAM ≤ 600 MB
  - Privacy-gate true-positive rate ≥ 90% on 100 labelled screenshots
  - Disk growth ≤ 250 MB per 8-hour day (captions + embeddings + thumbnails)
  - Zero outbound connections during normal operation (verified via Resource Monitor / netstat)
- **Process:** all 3 team members can run and demo the app on their own laptop
  by Week 4 day 3.

## Non-goals for v1
- We will NOT aim for state-of-the-art reasoning quality — Qwen 0.5B is small,
  answers will sometimes be wrong, and that's acceptable. The systems/privacy
  story is the contribution, not LLM accuracy.
- We will NOT ship as a consumer product. v1 is a research prototype + FYP
  submission; public release is post-submission.
- We will NOT support every browser / app / edge case on Windows. If the top
  5 apps (Chrome, VS Code, Notepad, Word, Slack) work, that's enough.

## Release plan (v1)
- Week 1–4: build (see `ROADMAP.md`)
- Week 5: evaluation + numbers
- Week 6: paper + rehearsal + submission
- Buffer to Oct 15: guide-mandated changes / viva prep

## Post-v1 (post-submission)
See `FUTURE_WORK.md` for the priority-ordered list (3-factor unlock, Phi LLM,
QLoRA personalisation, OS actions, tray + guest mode, cross-platform installers,
public MIT release).
