"""Screen capture loop (mss + pHash). Implemented in Week 1."""
from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
from typing import Optional
@dataclass
class CapturedFrame:
    timestamp: float
    image_path: Path
    phash: str
    app: Optional[str] = None
    title: Optional[str] = None
class ScreenCapture:
    def __init__(self, interval_s: float = 3.0, phash_threshold: int = 4):
        self.interval_s = interval_s
        self.phash_threshold = phash_threshold
        self._running = False
    def start(self): self._running = True
    def stop(self): self._running = False
    @property
    def running(self) -> bool: return self._running
