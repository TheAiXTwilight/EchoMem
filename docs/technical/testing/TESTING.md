# Testing Plan (v1)

Given 6 weeks, we don't chase a 90% coverage number. We chase **the demo works
on demo day** and the paper has honest numbers.

## 1. Smoke tests (every PR)

A small pytest file `tests/test_smoke.py`:
- `GET /health` returns `200` and `"status":"ok"`
- `POST /auth/unlock` with a test password → `ok`; then `GET /status` shows `locked: false`
- `POST /capture/start` → `running: true`; wait 3s; `POST /capture/stop`; confirm
  at least 1 row appears in SQLite and at least 1 file in `data/captures/raw/`
- `POST /query` returns 200 with a non-empty `answer` string
- `POST /auth/lock`; a subsequent `POST /query` returns 403

A Vitest smoke file `frontend/src/__tests__/App.test.tsx`:
- Lock screen renders
- Entering a password shows chat screen
- Mic button toggles state
- Typing and sending a message adds a user bubble

These are quick (< 30s total) and run locally before merging. CI is a post-v1
nice-to-have.

## 2. Integration demo script (every Friday, and Day 6-20 rehearsal)

A printed 5-minute script we run through 3x in rehearsal:

1. Boot EchoMem → lock screen
2. Enter master password → unlock, start capture
3. Open Chrome, navigate to a known test page (e.g. a GitHub README), wait 10s
4. Switch to Notepad, type "Reminder: submit thesis on Oct 15", wait 10s
5. Say "Hey Echo, what did I write in Notepad?"
6. Wait for answer — should mention Notepad and thesis
7. Say "Hey Echo, what page did I have open in Chrome?"
8. Wait for answer — should mention the known page
9. Press Lock button → back to lock screen
10. Try to query while locked → blocked

Any failure → P0 bug.

## 3. Evaluation benchmark (Week 5, paper numbers)

- **Corpus:** each of us uses EchoMem for 2 real hours of work (laptop normal
  use: browsing, VS Code, Slack, Notion, etc.). Expected ~2400 captures per
  person.
- **Questions:** each of us writes 33 natural questions about *our own* session
  that we know the answer to, with a ground-truth (app, approximate time
  window, keywords). Total 100 questions in `tests/benchmark/questions.json`.
- **Metrics:**
  - **Recall@5 / Recall@10**: % of questions for which the correct memory is
    in the top 5/10 retrieved results.
  - **MRR**: Mean Reciprocal Rank of the first correct hit.
  - **Answer correctness**: manual 1–3 scale (1=wrong/irrelevant, 2=partially
    correct, 3=correct and useful) scored blind by a different team member.
- **Latency:** measured end-to-end (wake word → end of TTS) on 20 random
  questions; report p50/p95.
- **Privacy gate:** label 100 screenshots (50 sensitive: password fields,
  banking pages, OTP SMS, incognito; 50 normal), run through the gate, compute
  TP/FP/FN/TN, precision, recall.
- **Resource usage:** idle RAM (capture on, no query) and active RAM (during
  answer) via Task Manager; disk growth after 2 hours.
- **Wake word false accepts:** run wake listener for 8 hours of normal work
  across the 3 laptops (one per person) and count false triggers.

## 4. Bugs

Any bug seen during dogfooding → GitHub issue with:
- Steps to reproduce
- Expected vs actual
- Log snippet (tail `backend.log`)
- Screenshot if UI
- Severity label: P0 (blocks demo), P1 (hurts main flow), P2 (polish), P3 (later)

## 5. What we deliberately don't do in v1

- Full unit-test coverage of every module
- Property-based testing
- Performance regression harness
- Automated UI/E2E tests beyond the smoke test
- CI/CD (we'll run smoke tests locally before each merge)

All of the above move to post-v1 after submission.
