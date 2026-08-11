"""Moondream2 captioner + privacy verdict. Implemented in Week 2."""
class Captioner:
    def __init__(self, model: str = "moondream:1.8b-instruct-q4_K_M"):
        self.model = model
    def caption(self, image_path) -> str: return f"[caption stub for {image_path}]"
    def privacy_verdict(self, caption: str, title: str | None) -> bool:
        """Return True = STORE, False = DROP."""
        return True
