"""Speech-to-text — faster-whisper (base.en default). Implemented in Week 3.

Why faster-whisper base.en (Aug 2026 research):
  - 4x faster than openai-whisper on CPU (CTranslate2 backend, INT8)
  - base.en is 142 MB vs tiny.en's 40 MB but ~50% better WER on English; still
    transcribes in <2s for a 5-second voice query on a laptop CPU
  - Models like NVIDIA Parakeet/Canary-Qwen/Cohere-Transcribe beat Whisper
    on WER but either require NVIDIA GPUs, larger downloads (0.6-2.5GB), or
    more fragile installs. faster-whisper is the most reliable Windows+Mac+Linux
    pick with MIT license.
  - Multilingual / heavier Whisper sizes are post-v1.

faster-whisper auto-downloads its weights from HuggingFace on first call.
"""
from __future__ import annotations


class STT:
    def __init__(self, model: str = "base.en", device: str = "cpu", compute_type: str = "int8"):
        self.model_name = model
        self.device = device
        self.compute_type = compute_type
        self._model = None  # lazy-loaded on first transcribe()

    def _load(self):
        if self._model is None:
            from faster_whisper import WhisperModel
            self._model = WhisperModel(self.model_name, device=self.device,
                                       compute_type=self.compute_type)

    def transcribe_file(self, path: str) -> str:
        self._load()
        segments, _ = self._model.transcribe(path, language="en")
        return " ".join(s.text.strip() for s in segments).strip()

    # Week 3 will add streaming transcription from a sounddevice buffer using
    # VAD (webrtcvad) chunking for low-latency voice queries.
    def transcribe_chunk(self, audio_chunk) -> str:
        return "[stt stub]"
