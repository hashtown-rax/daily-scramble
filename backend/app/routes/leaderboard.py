from datetime import date, datetime
from fastapi import APIRouter, Depends
from sqlalchemy import select, func, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Score, User
from app.schemas import ScoreOut, LeaderboardOut

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("", response_model=LeaderboardOut)
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    today = date.today()

    # best score per user today
    subq = (
        select(
            Score.user_id,
            func.max(Score.points).label("best_points"),
        )
        .where(cast(Score.completed_at, Date) == today)
        .group_by(Score.user_id)
        .subquery()
    )

    result = await db.execute(
        select(Score, User.display_name)
        .join(User, Score.user_id == User.id)
        .join(subq, (Score.user_id == subq.c.user_id) & (Score.points == subq.c.best_points))
        .where(cast(Score.completed_at, Date) == today)
        .order_by(Score.points.desc(), Score.time_seconds.asc())
        .limit(20)
    )

    seen = set()
    scores = []
    for score, name in result.all():
        if score.user_id in seen:
            continue
        seen.add(score.user_id)
        scores.append(ScoreOut(
            display_name=name,
            points=score.points,
            time_seconds=score.time_seconds,
            words_solved=score.words_solved,
        ))

    return LeaderboardOut(date=today, scores=scores)
