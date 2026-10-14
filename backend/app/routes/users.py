from uuid import UUID
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Score, Puzzle
from app.schemas import CreateUser, UserOut, UserStats

router = APIRouter(prefix="/api/users", tags=["users"])

LEVELS = [
    (0, "Starter"),
    (2000, "Speller"),
    (5000, "Wordsmith"),
    (10000, "Linguist"),
    (20000, "Lexicon"),
]


def get_level(total_points: int) -> tuple[int, str]:
    level = 1
    name = "Starter"
    for i, (threshold, label) in enumerate(LEVELS):
        if total_points >= threshold:
            level = i + 1
            name = label
    return level, name


@router.post("", response_model=UserOut)
async def create_user(body: CreateUser, db: AsyncSession = Depends(get_db)):
    user = User(display_name=body.display_name.strip()[:20])
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/{user_id}/stats", response_model=UserStats)
async def get_user_stats(user_id: UUID, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # aggregate stats
    result = await db.execute(
        select(
            func.coalesce(func.sum(Score.points), 0),
            func.count(Score.id),
            func.coalesce(func.max(Score.points), 0),
        ).where(Score.user_id == user_id)
    )
    total_points, games_played, best_score = result.one()

    # streak calc: get all dates this user played, ordered desc
    result = await db.execute(
        select(Puzzle.date)
        .join(Score, Score.puzzle_id == Puzzle.id)
        .where(Score.user_id == user_id)
        .order_by(Puzzle.date.desc())
    )
    played_dates = [row[0] for row in result.all()]

    current_streak = 0
    longest_streak = 0
    if played_dates:
        # current streak: count consecutive days back from today
        streak = 0
        expected = date.today()
        for d in played_dates:
            if d == expected:
                streak += 1
                expected -= timedelta(days=1)
            elif d == expected + timedelta(days=1):
                # today not played yet, start from yesterday
                if streak == 0:
                    expected = d
                    streak = 1
                    expected -= timedelta(days=1)
                else:
                    break
            else:
                break
        current_streak = streak

        # longest streak
        longest = 1
        run = 1
        for i in range(1, len(played_dates)):
            if played_dates[i] == played_dates[i - 1] - timedelta(days=1):
                run += 1
                longest = max(longest, run)
            else:
                run = 1
        longest_streak = max(longest, current_streak)

    level, level_name = get_level(total_points)

    return UserStats(
        display_name=user.display_name,
        total_points=total_points,
        games_played=games_played,
        current_streak=current_streak,
        longest_streak=longest_streak,
        best_score=best_score,
        level=level,
        level_name=level_name,
    )
