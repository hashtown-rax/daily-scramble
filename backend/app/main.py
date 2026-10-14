import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from app.database import engine, Base
from app.routes import puzzle, scores, leaderboard, users

load_dotenv()

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Daily Scramble", lifespan=lifespan)

app.include_router(users.router)
app.include_router(puzzle.router)
app.include_router(scores.router)
app.include_router(leaderboard.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


# Serve React build if it exists (production)
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{path:path}")
    async def serve_spa(path: str):
        file = STATIC_DIR / path
        if file.is_file():
            return FileResponse(file)
        return FileResponse(STATIC_DIR / "index.html")
