# Threat Model — EchoMem v1

## Assets we protect
- User's captured memory (screenshots, captions, embeddings) on disk
- Master password & derived encryption key
- User queries (voice + text)
- Metadata (app names, window titles, timestamps)

## Trust boundary
The entire system runs inside the user's laptop user account. We trust:
- The OS user account
- The OS keychain / secret storage (v2 enhancement — v1 uses only a derived key held in RAM)
- The Python packages we install (pinned in `requirements.txt`)

We do **not** trust:
- The local network / Wi-Fi router
- Other processes running as the same user (best-effort; full inter-process isolation is post-v1)
- Anyone who gains physical access after the system is locked
- Cloud services of any kind (we simply don't call any)

## Threats & mitigations (v1)

| # | Threat | Mitigation in v1 | Residual risk |
|---|---|---|---|
| T1 | Data exfiltration over network | Code makes zero outbound HTTP calls; all listeners bind to 127.0.0.1; CORS restricted to localhost:5173 | Users can add a Windows firewall rule for defence-in-depth (documented in README); misconfiguration by user is out of scope |
| T2 | Disk theft / stolen laptop | AES-256-GCM encryption of all memories and screenshots with PBKDF2-derived key (100k iterations) | Cold-boot / RAM scraping not mitigated in v1 (mlock/zeroing deferred to post-v1) |
| T3 | Accidental capture of passwords, banking, OTP, incognito | Moondream privacy verdict + regex blocklist; matching frames are dropped BEFORE disk write | Regex + VLM will not catch 100%; we report the true-positive rate in the paper |
| T4 | Unauthorised access while unlocked | Single master-password gate; `/auth/lock` from UI; auto-lock not in v1 but the Lock button is prominent | No idle timeout / proximity lock (post-v1) |
| T5 | Malicious app reads memory | Locked-state key is dropped from Python; no persistence of key to disk | Python GC doesn't guarantee instant zeroing (post-v1: mlock + explicit memzero) |
| T6 | Model supply-chain attack | Models pulled via Ollama/Piper at setup; after setup no model downloads; `requirements.txt` pins major versions | Pin exact hashes post-v1 |
| T7 | Voice replay (someone plays a recording of the wake word + query) | Wake word activates STT but does **not** bypass the master password gate — the user must unlock once per session in v1 | Full anti-replay voiceprint challenge deferred to post-v1 |
| T8 | Adversarial screenshots (e.g. a page that tricks captioning) | Moondream is a local VLM; out-of-scope for v1 beyond standard prompt discipline | Future work: caption ensemble + learned privacy gate |
| T9 | Crash leaves plaintext fragments | All writes go through encryption before hitting disk; temp files avoided | In-progress crash mid-capture is best-effort in v1 |
| T10 | Accidental deletion / corruption | SQLite WAL; nightly backup copy of DB file is a post-v1 nicety | No automated backups in v1; users can copy `data/db/` manually |

## What we do NOT claim in v1 (be honest in paper)
- We are NOT a replacement for disk encryption (BitLocker/FileVault) — users should still enable those.
- We do NOT defend against a dedicated attacker with physical access and a
  cold-boot-RAM attack kit.
- We do NOT provide biometric authentication. Voiceprint and face unlock are
  post-v1.
- We do NOT provide OS-level sandboxing of other apps; another process running
  as the same user can read memory while unlocked, same as any other app.

## Threat mitigations deferred to post-v1
See `FUTURE_WORK.md §F1`: envelope encryption with per-day wrapped keys, 4 KB
padded blocks + random-UUID filenames + block reshuffling on launch, mlock'd
RAM pages with explicit zeroing, OS keychain binding for master key, voiceprint
3-digit anti-replay challenge, optional face + eye-blink unlock, OS firewall
auto-provisioning.
