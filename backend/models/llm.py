"""Qwen2.5-0.5B RAG LLM (v1). Phi-3.5-mini available post-v1 per FUTURE_WORK."""
class LLM:
    def __init__(self, model: str = "qwen2.5:0.5b-instruct-q4_K_M"):
        self.model = model
    def answer(self, question: str, context: list[dict]) -> str:
        return f"[llm stub] Asked: {question} | Context items: {len(context)}"
