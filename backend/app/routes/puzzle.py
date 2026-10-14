from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Puzzle
from app.schemas import PuzzleOut, PuzzleWord
from app.services.puzzle import get_random_words, get_daily_words, scramble_word

router = APIRouter(prefix="/api/puzzle", tags=["puzzle"])


@router.get("/new", response_model=PuzzleOut)
async def get_new_puzzle(db: AsyncSession = Depends(get_db)):
    words = get_random_words()
    puzzle = Puzzle(words=words, is_daily=False)
    db.add(puzzle)
    await db.commit()
    await db.refresh(puzzle)

    puzzle_words = [
        PuzzleWord(scrambled=scramble_word(w), answer=w)
        for w in puzzle.words
    ]
    return PuzzleOut(id=puzzle.id, is_daily=False, words=puzzle_words)


@router.get("/daily", response_model=PuzzleOut)
async def get_daily_puzzle(db: AsyncSession = Depends(get_db)):
    today = date.today()

    result = await db.execute(select(Puzzle).where(Puzzle.date == today, Puzzle.is_daily == True))
    puzzle = result.scalar_one_or_none()

    if not puzzle:
        words = get_daily_words(today)
        puzzle = Puzzle(words=words, is_daily=True, date=today)
        db.add(puzzle)
        await db.commit()
        await db.refresh(puzzle)

    puzzle_words = [
        PuzzleWord(scrambled=scramble_word(w, f"{today}{w}"), answer=w)
        for w in puzzle.words
    ]
    return PuzzleOut(id=puzzle.id, is_daily=True, words=puzzle_words)
