"""LanceDB vector store (flat index in v1; IVF-PQ post-v1). Implemented in Week 2."""
from __future__ import annotations
from pathlib import Path
class VectorStore:
    def __init__(self, db_path: Path): self.db_path = Path(db_path)
    def insert(self, id: int, embedding, metadata: dict): pass
    def query(self, embedding, top_k: int = 5): return []
