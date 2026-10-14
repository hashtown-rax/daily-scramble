from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Score, User, Puzzle
from app.schemas import SubmitScore

router = APIRouter(prefix="/api/scores", tags=["scores"])


def compute_score(guesses, puzzle_words, time_seconds):
    word_points = 0
    words_solved = 0

    for g in guesses:
        if g.word_index < 0 or g.word_index >= len(puzzle_words):
            continue
        answer = puzzle_words[g.word_index].lower()
        if g.guess.lower() == answer:
            words_solved += 1
            word_points += 100 if g.attempts == 1 else 50

    time_bonus = max(0, int(300 - time_seconds))
    return word_points + time_bonus, words_solved


@router.post("")
async def submit_score(body: SubmitScore, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, body.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    puzzle = await db.get(Puzzle, body.puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")

    existing = await db.execute(
        select(Score).where(
            Score.user_id == body.user_id,
            Score.puzzle_id == body.puzzle_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already submitted for today")

    points, words_solved = compute_score(body.guesses, puzzle.words, body.time_seconds)

    score = Score(
        user_id=body.user_id,
        puzzle_id=body.puzzle_id,
        points=points,
        time_seconds=body.time_seconds,
        words_solved=words_solved,
    )
    db.add(score)
    await db.commit()
    return {"status": "ok", "points": points, "words_solved": words_solved}
