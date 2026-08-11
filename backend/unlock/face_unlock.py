"""Face + eye-blink unlock via FaceNet + OpenCV — DEFERRED (optional).
See docs/process/FUTURE_WORK.md §F1.
"""
from __future__ import annotations
def is_webcam_available() -> bool: return False
def face_unlock() -> bool:
    raise NotImplementedError("Face unlock deferred and optional (FUTURE_WORK §F1).")
