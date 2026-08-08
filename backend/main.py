"""EchoMem FastAPI backend — entry point."""
from fastapi import FastAPI

app = FastAPI(title="EchoMem", version="0.1.0")


@app.get("/health")
async def health():
    return {"status": "ok", "version": app.version}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
