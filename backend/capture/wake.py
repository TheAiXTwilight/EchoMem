"""Wake-word listener — livekit-wakeword (Conv-Attention ONNX model). Implemented Week 3.

Why livekit-wakeword over vanilla openWakeWord (Aug 2026 research):
  - Drop-in ONNX runtime, <5MB model
  - Conv-Attention classifier (1D convs + multi-head self-attention) preserves
    temporal structure across the 16-frame window
  - LiveKit reports 100x fewer false positives per hour and 60% lower detection
    error vs openWakeWord in their internal benchmark
  - Custom wake phrases trained in one CLI command using Piper/Kokoro synthetic
    audio + realistic augmentations; no manual recording needed
  - Ships with a pre-trained "hey livekit" model we can test with; our "Hey Echo"
    model is trained during setup.
  - Backward-compatible with openWakeWord ONNX models if we need a fallback.

Plan for Week 3:
  1. pip install livekit-wakeword[listener]
  2. Train a custom "Hey Echo" ONNX model (one command, ~5 min on CPU) and save
     it under models/wake/hey_echo.onnx
  3. WakeWordListener starts a background thread, feeds 16kHz mono PCM from
     sounddevice into WakeWordModel.predict, and fires a callback on detection.
If livekit-wakeword has install issues on any teammate's laptop, fall back to
openWakeWord's pre-trained "alexa/hey_mycroft-style" model (API is similar).
"""
from __future__ import annotations

from pathlib import Path


class WakeWordListener:
    def __init__(self, phrase: str = "Hey Echo", model_path: Path | None = None):
        self.phrase = phrase
        self.model_path = Path(model_path) if model_path else Path("models/wake/hey_echo.onnx")
        self._running = False

    def start(self, on_detect=None):
        """Start listening in a background thread. on_detect() called on wake."""
        self._running = True
        self._on_detect = on_detect or (lambda: None)
        # Week 3: open sounddevice InputStream at 16kHz mono, feed frames to
        # livekit.wakeword.WakeWordModel.predict, fire on_detect on threshold.

    def stop(self):
        self._running = False

    @staticmethod
    def train_custom(phrase: str = "Hey Echo", out_path: Path | None = None) -> Path:
        """Train a custom wake-word ONNX model via livekit-wakeword CLI.
        Week 3 setup step — one command, returns path to exported .onnx.
        """
        # Week 3: invoke `livekit-wakeword run configs/hey_echo.yaml` via
        # subprocess, then move the exported ONNX to models/wake/.
        raise NotImplementedError("Training script will be added in Week 3")
