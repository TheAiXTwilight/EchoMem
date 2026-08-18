"""Text-to-speech — Kokoro-82M via pykokoro (ONNX, CPU-first). Implemented Week 3.

Why Kokoro over Piper (Aug 2026 research):
  - 82M params, Apache 2.0 license (vs Piper's GPL-3.0 — cleaner for our
    public post-submission MIT release)
  - 54 built-in voices across EN-US, EN-GB, and several other languages
  - Consistently rated more natural than Piper in 2026 local-TTS comparisons
    while running at similar or better realtime factors on CPU
  - ONNX runtime; no PyTorch needed at inference time for the CPU path
  - Active maintainer (holgern/pykokoro); last commit Aug 15, 2026.
  - Install with `pip install "pykokoro[cpu]"` (extra installs onnxruntime);
    `pip install "pykokoro[coreml]"` on macOS for Apple CoreML acceleration.
  - Model (~80 MB) and voices auto-download from HuggingFace on first run.

API reference (verified Aug 18, 2026 against pykokoro README):
    from pykokoro import KokoroPipeline, PipelineConfig
    pipe = KokoroPipeline(PipelineConfig(voice="af_heart"))
    result = pipe.run("Hello world")
    sd.play(result.audio, result.sample_rate, blocking=True)

We keep Piper documented as a fallback in FUTURE_WORK.md only.
"""
from __future__ import annotations


class TTS:
    def __init__(self, voice: str = "af_heart"):
        """
        voice: Kokoro voice id. Default 'af_heart' = female US, highest quality.
               Voice codes: a=US en, b=UK en; f=female, m=male; e.g. 'bm_george'.
               See pykokoro docs for full list (54 voices across 9 languages).
        """
        self.voice = voice
        self._pipeline = None  # lazy-loaded on first speak()

    def _load(self):
        if self._pipeline is None:
            try:
                from pykokoro import KokoroPipeline, PipelineConfig
                # provider="auto" picks the best available backend
                # (CoreML on Mac, CUDA if installed, CPU by default).
                self._pipeline = KokoroPipeline(
                    PipelineConfig(voice=self.voice, provider="auto")
                )
            except ImportError:
                raise RuntimeError(
                    'pykokoro not installed. Run: pip install "pykokoro[cpu]" '
                    'sounddevice soundfile  (use [coreml] on Mac, [directml] on Windows)'
                )

    def speak(self, text: str) -> None:
        """Generate audio and play through the default speaker (blocking)."""
        self._load()
        result = self._pipeline.run(text)
        import sounddevice as sd
        sd.play(result.audio, result.sample_rate, blocking=True)
