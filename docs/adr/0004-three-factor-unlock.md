# ADR 0004 — Authentication Strategy

- **Status:** Superseded in scope for v1; design preserved for post-v1
- **Date:** 2026-08-12
- **Revised:** 2026-08-12 (v1 scope cut)

## Original design (preserved for post-v1)
Three-factor graduated unlock:
- **Level 1 (wake word + OS biometric/password):** quick queries/open/reminders, auto-lock 2 min
- **Level 2 (+voiceprint with 3-digit anti-replay challenge, ECAPA-TDNN):** full memory/timeline, auto-lock 5 min
- **Level 3 (+secondary master password):** settings/personalisation/messages/wipe, auto-lock 1 min
- Optional: FaceNet + eye-blink detection when a webcam is present, never replacing the master password.

## Revised decision (v1)
For the October submission, authentication is a **single master password on
app launch** that derives the AES-256-GCM key. The lock button in the UI drops
the key from memory. That's it.

Rationale for the cut:
- Voiceprint (SpeechBrain ECAPA-TDNN enrolment + verification + anti-replay
  challenge UX) is itself 1–2 weeks of work and needs a solid enrolment flow.
- Face detection + eye-blink liveness requires OpenCV + webcam permission
  handling and multiple testing environments.
- Neither is necessary to tell the privacy-first memory-assistant story in the
  paper. The paper will honestly describe graduated unlock as "future work".

Module stubs (`unlock/voiceprint.py`, `unlock/face_unlock.py`) are kept in the
repo with `NotImplementedError` so the architecture is clear and the code can
be resumed post-submission without re-scaffolding.

## Consequences
- Replay attacks (e.g. someone yelling "Hey Echo" at your unlocked laptop while
  you're in the room) are not defended beyond you being present to respond or
  lock. Acceptable for v1.
- No idle auto-lock timeout in v1 — users must click Lock manually. We will
  document this.
- No biometric enrolment screens in v1.

## Post-v1
Implement the graduated unlock exactly as originally designed:
1. Persist voiceprint embedding during an enrolment step in settings
2. Generate random 3-digit challenges on Level-2 attempts (voiceprint must
   speak the digits, defeats recordings)
3. Separate master-password gate for destructive actions
4. Optional face + eye-blink as a convenience factor
