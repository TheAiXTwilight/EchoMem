"""EchoMem v1 FastAPI entrypoint.

Endpoints follow docs/technical/api/API.md. All AI/storage modules are stubbed
for Week 1; they will be filled in week-by-week per docs/process/ROADMAP.md.

Deferred post-v1 modules (unlock.voiceprint, unlock.face_unlock, actions.os_controls,
models.lora) are imported but never called in v1 — they raise NotImplementedError
only if someone invokes them directly.
"""
from __future__ import annotations

import os
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---- v1 module stubs (filled in during weeks 1-4) ----
from capture.screen import ScreenCapture
from capture.wake import WakeWordListener
from storage.sqlite_store import SQLiteStore
from storage.vector_store import VectorStore
from models.llm import LLM, Captioner           # Captioner (VLM) lives here
from models.embedder import Embedder
from models.stt import STT
from models.tts import TTS
from privacy.gate import should_store
from privacy.encryption import encrypt, decrypt, derive_key  # noqa: F401

# ---- Post-v1 modules (imported so they exist, but not used in v1 routes) ----
import unlock.voiceprint        # noqa: F401
import unlock.face_unlock       # noqa: F401
import actions.os_controls      # noqa: F401
import models.lora              # noqa: F401


# ---- Paths ----
ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data" / "db"
DATA_DIR.mkdir(parents=True, exist_ok=True)
CAPTURES_DIR = ROOT / "data" / "captures" / "raw"
CAPTURES_DIR.mkdir(parents=True, exist_ok=True)


# ---- App state (singletons wired up in lifespan) ----
class AppState:
    def __init__(self):
        self.locked: bool = True
        self.master_key: Optional[bytes] = None
        self.screen = ScreenCapture()
        self.wake = WakeWordListener()
        self.db = SQLiteStore(DATA_DIR / "echomem.db")
        self.vec = VectorStore(DATA_DIR / "vec")
        self.captioner = Captioner()
        self.embedder = Embedder()
        self.llm = LLM()
        self.stt = STT()
        self.tts = TTS()


state = AppState()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    state.screen.stop()
    state.wake.stop()


app = FastAPI(
    title="EchoMem v1",
    version="0.1.0",
    description="Privacy-first local memory assistant (MVP, October 2026 submission).",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Schemas ----
class UnlockReq(BaseModel):
    password: str

class QueryReq(BaseModel):
    text: str
    top_k: int = 5

class QueryResp(BaseModel):
    answer: str
    citations: list[dict]

class SettingsReq(BaseModel):
    wake_phrase: Optional[str] = None
    voice_gender: Optional[str] = None   # "male" | "female"
    capture_interval_s: Optional[float] = None


# ---- Routes ----
@app.get("/health")
def health():
    return {
        "status": "ok",
        "version": app.version,
        "locked": state.locked,
        "capture_running": state.screen.running,
        "models": {
            "stt": "faster-whisper base.en INT8 (CTranslate2)",
            "tts": "Kokoro-82M via pykokoro ONNX (voice af_heart)",
            "multimodal": state.llm.model,
            "captioner": state.captioner.model,
            "embedder": "nomic-embed-text:v1.5",
            "wake": "livekit-wakeword (Conv-Attention ONNX)",
        },
    }


@app.post("/auth/unlock")
def unlock(req: UnlockReq):
    """v1 unlock: single master password.
    Graduated multi-factor unlock is post-v1; see FUTURE_WORK.md §F1.
    """
    if not req.password:
        raise HTTPException(400, "password required")
    # Week 3: replace with real key derivation + attempt to decrypt a known blob
    state.master_key = req.password.encode("utf-8")
    state.locked = False
    return {"ok": True}


@app.post("/auth/lock")
def lock():
    state.master_key = None
    state.screen.stop()
    state.locked = True
    return {"ok": True}


@app.get("/status")
def status():
    if state.locked:
        return {"locked": True, "capture_running": False}
    return {
        "locked": False,
        "capture_running": state.screen.running,
        "capture_interval_s": state.screen.interval_s,
        "wake_phrase": state.wake.phrase,
        "llm": state.llm.model,
    }


@app.post("/capture/start")
def capture_start():
    if state.locked:
        raise HTTPException(403, "locked")
    state.screen.start()
    # Week 1: spin up mss loop in a background thread
    return {"ok": True, "running": True}


@app.post("/capture/stop")
def capture_stop():
    state.screen.stop()
    return {"ok": True, "running": False}


@app.post("/query", response_model=QueryResp)
def query(req: QueryReq):
    """Text-in → text-out RAG (for the UI textbox)."""
    if state.locked:
        raise HTTPException(403, "locked")
    # Week 2: real embed → vector search → Qwen answer with citations
    results = [
        {"app": "chrome", "title": "Login page — example.com",
         "timestamp": time.time() - 600,
         "snippet": "[stub] User was looking at login form."},
    ]
    answer = state.llm.answer(req.text, results)
    return QueryResp(answer=answer, citations=results)


@app.websocket("/listen")
async def listen(ws: WebSocket):
    """Streaming voice endpoint: wake → STT → query → TTS.
    Implemented end-to-end in Week 3-4.
    """
    await ws.accept()
    try:
        while True:
            msg = await ws.receive_text()
            if msg == "ping":
                await ws.send_json({"state": "idle"})
            else:
                await ws.send_json({"state": "stub", "echo": msg})
    except WebSocketDisconnect:
        pass


@app.post("/settings")
def update_settings(req: SettingsReq):
    if req.wake_phrase:
        state.wake.phrase = req.wake_phrase
    if req.capture_interval_s and req.capture_interval_s > 0:
        state.screen.interval_s = req.capture_interval_s
    return {"ok": True,
            "wake_phrase": state.wake.phrase,
            "capture_interval_s": state.screen.interval_s}


# ---- Dev run ----
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
