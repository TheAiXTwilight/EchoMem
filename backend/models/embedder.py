"""Text embeddings — nomic-embed-text:v1.5 via Ollama. Implemented Week 2.

Why nomic-embed-text v1.5 over bge-small-en (Aug 2026 research):
  - 137M params, 768 dims, 8192-token native context
  - Most-popular embedding model on Ollama (~82M pulls), well-tested
  - Consistently beats bge-small on English RAG benchmarks (MTEB 62.28)
  - Same Ollama interface we already use for LLM + VLM -> one less runtime
    to ship (removes fastembed dependency)
  - ~274 MB download, still 100% CPU
  For multilingual workloads we'd switch to bge-m3 or qwen3-embedding;
  English-only v1 doesn't need it.
"""
from __future__ import annotations


class Embedder:
    def __init__(self, model: str = "nomic-embed-text:v1.5"):
        self.model = model

    def embed(self, text: str) -> list[float]:
        """Return a 768-dim embedding vector for the given text."""
        # Week 2 TODO:
        #   import ollama
        #   resp = ollama.embed(model=self.model, input=text)
        #   return resp["embeddings"][0]
        return [0.0] * 768

    def embed_many(self, texts: list[str]) -> list[list[float]]:
        return [self.embed(t) for t in texts]
