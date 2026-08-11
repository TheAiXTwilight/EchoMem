"""Semantic retrieval over captions. Implemented in Week 2."""
class Retriever:
    def __init__(self, vector_store, embedder):
        self.vs = vector_store; self.emb = embedder
    def query(self, question: str, top_k: int = 5) -> list[dict]:
        return self.vs.query(self.emb.embed(question), top_k=top_k)
