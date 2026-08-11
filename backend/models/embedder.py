"""bge-small-en embeddings via fastembed. Implemented in Week 2."""
class Embedder:
    def __init__(self, model: str = "BAAI/bge-small-en-v1.5"): self.model = model
    def embed(self, text: str): return [0.0] * 384
