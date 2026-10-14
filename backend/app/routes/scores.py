from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Score, User, Puzzle
from app.schemas import SubmitScore

router = APIRouter(prefix="/api/scores", tags=["scores"])

STREAK_MULTIPLIERS = {3: 1.5, 7: 2.0, 14: 2.5, 30: 3.0}


def get_streak_multiplier(streak: int) -> float:
    mult = 1.0
    for threshold, value in STREAK_MULTIPLIERS.items():
        if streak >= threshold:
            mult = value
    return mult


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


async def get_current_streak(user_id, db):
    result = await db.execute(
        select(Puzzle.date)
        .join(Score, Score.puzzle_id == Puzzle.id)
        .where(Score.user_id == user_id)
        .order_by(Puzzle.date.desc())
    )
    played_dates = [row[0] for row in result.all()]

    if not played_dates:
        return 0

    streak = 0
    # today's score hasn't been committed yet, so check from yesterday
    expected = date.today() - timedelta(days=1)
    for d in played_dates:
        if d == date.today():
            continue
        if d == expected:
            streak += 1
            expected -= timedelta(days=1)
        else:
            break
    return streak


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

    base_points, words_solved = compute_score(body.guesses, puzzle.words, body.time_seconds)

    # streak multiplier (based on streak before today)
    streak = await get_current_streak(body.user_id, db)
    streak_with_today = streak + 1
    multiplier = get_streak_multiplier(streak_with_today)
    points = int(base_points * multiplier)
    coins = points  # 1 point = 1 coin

    score = Score(
        user_id=body.user_id,
        puzzle_id=body.puzzle_id,
        points=points,
        time_seconds=body.time_seconds,
        words_solved=words_solved,
    )
    db.add(score)
    await db.commit()

    return {
        "status": "ok",
        "base_points": base_points,
        "multiplier": multiplier,
        "points": points,
        "coins": coins,
        "words_solved": words_solved,
        "streak": streak_with_today,
    }
