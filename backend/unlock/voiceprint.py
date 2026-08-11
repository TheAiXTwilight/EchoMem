"""Voiceprint (ECAPA-TDNN) verification + anti-replay challenge — DEFERRED.
See docs/process/FUTURE_WORK.md §F1.
"""
from __future__ import annotations
def verify_voiceprint(audio_bytes: bytes) -> bool:
    raise NotImplementedError("Voiceprint unlock deferred to post-v1 (FUTURE_WORK §F1).")
def generate_challenge() -> str:
    """3-digit anti-replay challenge."""
    raise NotImplementedError("Voiceprint unlock deferred to post-v1.")
