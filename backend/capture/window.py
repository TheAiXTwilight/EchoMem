"""Foreground window + app detection. Windows in v1; Mac/Linux deferred."""
from __future__ import annotations
import sys
def get_foreground() -> tuple[str | None, str | None]:
    """Returns (app_name, window_title) or (None, None) on unsupported OS."""
    if sys.platform != "win32":
        return (None, None)
    try:
        import pygetwindow as gw
        w = gw.getActiveWindow()
        if w is None: return (None, None)
        return (w._getWindowInfo().appName if hasattr(w, '_getWindowInfo') else None, w.title)
    except Exception:
        return (None, None)
