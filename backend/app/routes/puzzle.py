from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Puzzle
from app.schemas import PuzzleOut, PuzzleWord
from app.services.puzzle import get_random_words, scramble_word

router = APIRouter(prefix="/api/puzzle", tags=["puzzle"])


@router.get("/new", response_model=PuzzleOut)
async def get_new_puzzle(db: AsyncSession = Depends(get_db)):
    words = get_random_words()
    puzzle = Puzzle(words=words)
    db.add(puzzle)
    await db.commit()
    await db.refresh(puzzle)

    puzzle_words = [
        PuzzleWord(scrambled=scramble_word(w), answer=w)
        for w in puzzle.words
    ]
    return PuzzleOut(id=puzzle.id, words=puzzle_words)
