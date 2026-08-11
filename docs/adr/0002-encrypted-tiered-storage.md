# ADR 0002 — Storage: SQLite + LanceDB, AES-256-GCM at Rest

- **Status:** Accepted (v1, simplified)
- **Date:** 2026-08-12

## Context
We need durable storage for: metadata (timestamps, app, title, file paths),
vector embeddings (for semantic search), and encrypted binary blobs
(screenshots/thumbnails). All of this must be unreadable without the user's
password, fast to query on an 8 GB CPU laptop, and simple enough to implement
in a few days.

## Decision (v1)
- **Metadata:** a single SQLite database (`echomem.db`) with a `memories` table:
  `(id INTEGER PK, ts REAL, app TEXT, title TEXT, caption TEXT, img_path TEXT)`.
- **Vectors:** LanceDB in embedded mode, flat index (no IVF-PQ compression),
  storing `(id, vector 384d)`. At the scale of v1 (a few thousand to tens of
  thousands of memories) brute-force search is <200 ms.
- **Files:** encrypted WebP thumbnails (q=55, max 1280px) under `data/db/blobs/`
  with random UUID filenames. Captions and image bytes encrypted with
  AES-256-GCM using a PBKDF2-derived key (100k iterations).
- **Key lifecycle for v1:** one master key, derived from password at unlock,
  held in process memory, dropped on lock or exit.

## Consequences
- A stolen `data/db/` folder is useless without the password.
- No keychain integration, no per-day key rotation, no envelope encryption, no
  block reshuffling, no mlock in v1 — all deferred to post-v1.
- Flat vector index is simple and correct; we will not hit scale issues on
  day-one volumes. When users pass ~50k memories we will need IVF-PQ; that is a
  post-v1 migration.

## Alternatives considered
- **ChromaDB / FAISS / Qdrant:** Chroma was too heavy, FAISS lacks a good
  persistent serverless story, Qdrant requires a server process. LanceDB is
  embedded, pip-installable, and works offline.
- **Postgres + pgvector:** requires running a server; unnecessary for a
  single-user app.
- **Full encrypted at rest via OS (BitLocker/FileVault):** good and
  recommended, but doesn't protect against an already-logged-in attacker, and
  doesn't satisfy our "lock EchoMem independently" requirement. We still
  recommend users enable BitLocker/FileVault.

## Post-v1
- Envelope encryption with per-day wrapped keys sealed to OS keychain
- 4 KB fixed-size blocks with random UUID filenames and daily reshuffling
- mlock-locked RAM pages, explicit memzero on lock
- IVF-PQ vector index for scale
- Long-term semantic triple store with nightly consolidation
