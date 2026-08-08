# ADR 0004: Three-Factor Unlock with Graduated Access

**Date:** 2026-07
**Status:** Accepted

## Context
The assistant is always listening, but private memory access must be gated so that a thief, roommate, or recording cannot gain access. The unlock flow must be fast enough for daily use (not a 1-minute ritual) while being strong enough to defeat casual and moderate attacks.

## Decision
Tiered unlock:

| Level | Factor(s) Required | What it unlocks | Auto-lock |
|-------|--------------------|-----------------|-----------|
| Idle | Wake word only | Chime only, no memory | immediate |
| Level 1 | Wake word + system auth (Windows Hello/Touch ID/OS password) | Quick queries, non-sensitive actions (open apps, reminders, volume) | 2 min idle |
| Level 2 | + Voiceprint challenge (random 3-digit phrase, ECAPA-TDNN, Whisper-verified to defeat recordings) | Full memory queries, citations, browsing timeline | 5 min idle |
| Level 3 | + Secondary master EchoMem password | Settings changes, personalization training, message sending, data export/wipe | 1 min idle |

Optional add-on (if webcam detected): Face + eye-blink detection (FaceNet) as an additional convenience factor replacing voiceprint in well-lit environments (never replaces master password for Level 3).

## Consequences
✅ Usable for quick queries without heavy friction
✅ Strong protection against stolen laptops and replay attacks
✅ Random-number challenge blocks pre-recorded voice attacks
✅ Face unlock optional and auto-hidden on cam-free laptops
⚠️ Random challenge slightly less seamless than "Hey Echo, tell me..." — acceptable tradeoff for security
