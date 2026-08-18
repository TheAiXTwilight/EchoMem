# AI model clients are implemented in their own files:
#   llm.py        — Unified Qwen3.5 multimodal (0.8B floor / 2B default / 4B premium);
#                   provides both LLM (chat/RAG) and Captioner (VLM/captions/privacy)
#   embedder.py   — nomic-embed-text:v1.5 via Ollama (768-dim, 274 MB)
#   stt.py        — faster-whisper base.en INT8 (CTranslate2, CPU)
#   tts.py        — Kokoro-82M via pykokoro ONNX (Apache 2.0, af_heart default voice)
# lora.py is a stub for post-v1 QLoRA personalisation.
