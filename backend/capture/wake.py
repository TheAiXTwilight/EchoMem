"""openWakeWord listener. Implemented in Week 3."""
from __future__ import annotations
class WakeWordListener:
    def __init__(self, phrase: str = "Hey Echo"):
        self.phrase = phrase
        self._running = False
    def start(self): self._running = True
    def stop(self): self._running = False
