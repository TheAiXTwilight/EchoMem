# ADR 0002: Encrypted Tiered Permanent Memory

**Date:** 2026-07
**Status:** Accepted

## Context
EchoMem must store years of user data (screenshots, audio, transcripts, embeddings, notes) on consumer laptops with 6GB+ RAM while ensuring no data is readable outside the running EchoMem process. Data must be searchable quickly, even across years, without loading everything into RAM.

## Decision
- **Encryption:** AES-256-GCM envelope encryption; per-day rotating data keys wrapped by a master key derived from user password + OS keychain secret via PBKDF2-HMAC-SHA256
- **Sharding:** All data split into fixed 4KB blocks, padded, written with random UUID filenames in random shuffled order; a single encrypted per-day map file tracks block order
- **Routine reshuffling:** 2-5% of blocks silently re-written with new positions on each launch
- **Tiered memory:**
  - Short-term (48h): full JPEG q=80 captures + Opus audio
  - Long-term (90 days): WebP q=55 @1280px + summaries + thumbnails, raw audio deleted after transcription
  - Archive (permanent): semantic triples + monthly summaries, PQ-compressed embeddings
- **Storage engines:** LanceDB (vector, PQ-compressed IVF index) + SQLite FTS5 (metadata/keyword) + local filesystem for encrypted blocks
- **Process hardening:** `mlock` for key pages, core dumps disabled, zeroization on lock/wipe, sealed keys only released to unmodified binary
- **Outbound traffic:** hard block in backend (no sockets allowed except localhost)

## Consequences
✅ Years of memory fit in ~650 MB of disk
✅ Files on disk are indistinguishable from random noise without the master key
✅ Idle RAM flat at ~600 MB regardless of data volume
✅ Instant cryptographic wipe
✅ Search across years <100 ms via PQ vector index
⚠️ Requires careful key lifetime and rotation logic
⚠️ Sealed-key binding is OS-specific (Windows Credential Manager / macOS Keychain / Linux Secret Service) — small platform-specific adapters needed
