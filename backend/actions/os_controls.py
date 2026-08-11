"""OS actions (open apps, volume, messages, etc.) — DEFERRED to post-v1.

See docs/process/FUTURE_WORK.md §F3. Module is intentionally a stub so imports
don't break; all functions raise NotImplementedError until implemented.
"""
from __future__ import annotations
_NOT_DONE = "OS actions are deferred to post-v1 (see FUTURE_WORK.md §F3)."
def open_app(name: str): raise NotImplementedError(_NOT_DONE)
def open_url(url: str): raise NotImplementedError(_NOT_DONE)
def set_volume(level: int): raise NotImplementedError(_NOT_DONE)
def send_message(app: str, contact: str, text: str): raise NotImplementedError(_NOT_DONE)
def set_reminder(text: str, when: str): raise NotImplementedError(_NOT_DONE)
