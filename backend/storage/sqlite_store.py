"""SQLite metadata store. Implemented in Week 1."""
from __future__ import annotations
from pathlib import Path
class SQLiteStore:
    def __init__(self, db_path: Path): self.db_path = Path(db_path)
    def insert_capture(self, **kw) -> int: return 0
    def recent(self, limit: int = 10): return []
