from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Score, User, Puzzle
from app.schemas import ScoreOut, LeaderboardOut

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("", response_model=LeaderboardOut)
async def get_leaderboard(
    target_date: date = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    if target_date is None:
        target_date = date.today()

    result = await db.execute(
        select(Score, User.display_name)
        .join(User, Score.user_id == User.id)
        .join(Puzzle, Score.puzzle_id == Puzzle.id)
        .where(Puzzle.date == target_date)
        .order_by(Score.points.desc(), Score.time_seconds.asc())
        .limit(20)
    )

    scores = [
        ScoreOut(
            display_name=name,
            points=score.points,
            time_seconds=score.time_seconds,
            words_solved=score.words_solved,
        )
        for score, name in result.all()
    ]

    return LeaderboardOut(date=target_date, scores=scores)
