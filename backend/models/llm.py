"""Unified multimodal LLM client with hardware-aware auto-selection.

v2 model picks (FINAL, Aug 18 2026 deep re-research — see docs/adr/0001-quantized-local-models.md):

EchoMem uses ONE multimodal model that handles BOTH chat answers AND screenshot
captioning / privacy-gate vision. No model swap, no cold start, no wasted RAM.
Every Qwen3.5 size accepts text + image on the same Ollama endpoint.

    < 2 GB free   -> qwen3.5:0.8b         (floor, 6 GB laptops, 1.0 GB)
    2-5 GB free   -> qwen3.5:2b-q4_K_M    (DEFAULT, 8 GB Windows, 1.9 GB)
    > 5 GB free OR Apple M-series -> qwen3.5:4b-q4_K_M  (premium, M2/M3 Mac, 3.4 GB)

Users can force a model via environment variable:
    ECHOMEM_MODEL=qwen3.5:2b-q4_K_M uvicorn main:app

Why Qwen3.5 (Aug 2026 deep re-research, verified against Ollama live tags):
  - Natively multimodal at every size (text + image + tool calls + thinking).
    One model serves chat queries AND screenshot captions AND privacy OCR.
  - 256K context window on every size — big win for RAG over old 32K models.
  - Qwen3.5 4B (3.4 GB) MMLU-Pro 79.1 > phi-4-mini ~68, AND phi-4-mini is
    text-only (would still need a separate VLM taking another ~1.9 GB).
  - Qwen3.5 2B beats Qwen3 1.7B on every benchmark while keeping 1.9 GB Q4.
  - Qwen3.5 0.8B beats Moondream 2 at OCR (OCRBench 74.5 vs ~70) with 256K
    context vs Moondream's 2K, in only 1.0 GB — Moondream on Ollama is 2
    years stale (last update 2024, 2K context).
  - Gemma 4 E4B is ~4.5-6 GB (doesn't fit 8 GB with STT/embed/TTS/wake).
  - Qwen3.5 9B is 6.6 GB (premium+ tier, >12 GB RAM — too big for our 8 GB).
  - All Qwen3.5 tags verified live on ollama.com/library/qwen3.5/tags (Aug 18).
"""
from __future__ import annotations

import os
import platform
from typing import Any


# ---- hardware auto-detect ----------------------------------------------------

def _free_ram_gb() -> float:
    try:
        import psutil
        return psutil.virtual_memory().available / (1024 ** 3)
    except Exception:
        return 4.0  # safe default tier if we can't probe


def _default_model() -> str:
    override = os.environ.get("ECHOMEM_MODEL")
    if override:
        return override

    system = platform.system()
    machine = platform.machine().lower()
    is_m_series_mac = system == "Darwin" and machine in {"arm64", "aarch64"}
    free_gb = _free_ram_gb()

    # M-series Macs share RAM between CPU/GPU/ANE and compress memory;
    # the 4B Q4 fits comfortably even on 8 GB unified (3.4 GB weights +
    # ~2 GB app stack + OS = ~6-7 GB; macOS compresses the rest).
    if is_m_series_mac and free_gb >= 3.0:
        return "qwen3.5:4b-q4_K_M"
    if free_gb >= 5.0:
        return "qwen3.5:4b-q4_K_M"
    if free_gb >= 2.0:
        return "qwen3.5:2b-q4_K_M"
    return "qwen3.5:0.8b"


# Backwards-compatible aliases (old code imported _default_llm / _default_vlm).
# Both now return the same unified model.
def _default_llm() -> str:
    return _default_model()


def _default_vlm() -> str:
    return _default_model()


# ---- Unified model wrapper ---------------------------------------------------

class LLM:
    """Chat/retrieval LLM. Uses the same multimodal model as Captioner."""

    def __init__(self, model: str | None = None):
        self.model = model or _default_model()

    def answer(self, question: str, context: list[dict[str, Any]]) -> str:
        """Answer a question given retrieved context items.

        Week 2 TODO: replace the stub with a real Ollama /api/chat call.
        Keep the system prompt short — small models have limited context:
            "You are EchoMem, a local privacy-first memory assistant.
             Answer using ONLY the provided memories. If a memory shows
             an app and time, cite them inline (e.g. 'in Chrome at 3:14 PM').
             If the answer isn't in the context, say you don't remember."
        """
        return (
            f"[llm stub using {self.model}] Asked: {question} "
            f"| Context items: {len(context)}"
        )


class Captioner:
    """Vision-language wrapper for screenshot captions + privacy gating.

    Uses the same Qwen3.5 multimodal model as the chat LLM — no extra model,
    no RAM overhead. A single ollama.generate() call with images=[...] does
    both captioning and sensitive-content detection.
    """

    def __init__(self, model: str | None = None):
        self.model = model or _default_model()

    def caption(self, image_path: str) -> str:
        """Return a 1-2 line English caption for the screenshot.
        Week 2 TODO: call ollama.generate(model=self.model, images=[...],
            prompt="Describe this laptop screenshot in 1-2 plain English
            sentences. Mention the app/website and what the user is doing.
            If you see a password field, banking site, OTP/SMS code, or
            incognito/private window, say 'SENSITIVE_SCREEN' instead of
            describing content.")
        """
        return f"[caption stub for {image_path} using {self.model}]"

    def privacy_verdict(self, caption: str, title: str | None) -> bool:
        """Return True = STORE, False = DROP.
        Week 2 TODO: combine VLM output (caption contains 'SENSITIVE_SCREEN'?)
        with regex layer in privacy/gate.py; either says DROP -> DROP.
        """
        return True
