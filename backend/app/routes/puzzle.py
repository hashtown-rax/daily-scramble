from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Puzzle
from app.schemas import PuzzleOut, PuzzleWord
from app.services.puzzle import get_daily_words, scramble_word

router = APIRouter(prefix="/api/puzzle", tags=["puzzle"])


@router.get("/today", response_model=PuzzleOut)
async def get_today(db: AsyncSession = Depends(get_db)):
    today = date.today()

    result = await db.execute(select(Puzzle).where(Puzzle.date == today))
    puzzle = result.scalar_one_or_none()

    if not puzzle:
        words = get_daily_words(today)
        puzzle = Puzzle(date=today, words=words)
        db.add(puzzle)
        await db.commit()
        await db.refresh(puzzle)

    puzzle_words = [
        PuzzleWord(scrambled=scramble_word(w, today), answer=w)
        for w in puzzle.words
    ]
    return PuzzleOut(id=puzzle.id, date=puzzle.date, words=puzzle_words)
