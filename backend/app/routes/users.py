from uuid import UUID
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Score
from app.schemas import CreateUser, UserOut, UserStats, Badge

router = APIRouter(prefix="/api/users", tags=["users"])

LEVELS = [
    (0, "Starter"),
    (2000, "Speller"),
    (5000, "Wordsmith"),
    (10000, "Linguist"),
    (20000, "Lexicon"),
]

BADGE_DEFS = [
    ("first_game", "First Steps", "Complete your first puzzle"),
    ("perfect", "Perfect Score", "Solve all 5 words on your first attempt"),
    ("streak_3", "On Fire", "Reach a 3-day streak"),
    ("streak_7", "Week Warrior", "Reach a 7-day streak"),
    ("streak_30", "Monthly Master", "Reach a 30-day streak"),
    ("speed_demon", "Speed Demon", "Finish a puzzle in under 30 seconds"),
    ("points_1k", "Rising Star", "Earn 1,000 total coins"),
    ("points_10k", "Coin Collector", "Earn 10,000 total coins"),
    ("games_10", "Regular", "Play 10 games"),
    ("games_50", "Dedicated", "Play 50 games"),
]


def get_level(total_points: int) -> tuple[int, str]:
    level = 1
    name = "Starter"
    for i, (threshold, label) in enumerate(LEVELS):
        if total_points >= threshold:
            level = i + 1
            name = label
    return level, name


def compute_badges(games_played, total_points, best_score, current_streak, longest_streak, fastest_time):
    earned = set()

    if games_played >= 1:
        earned.add("first_game")
    if best_score >= 800:
        earned.add("perfect")
    if longest_streak >= 3:
        earned.add("streak_3")
    if longest_streak >= 7:
        earned.add("streak_7")
    if longest_streak >= 30:
        earned.add("streak_30")
    if fastest_time and fastest_time < 30:
        earned.add("speed_demon")
    if total_points >= 1000:
        earned.add("points_1k")
    if total_points >= 10000:
        earned.add("points_10k")
    if games_played >= 10:
        earned.add("games_10")
    if games_played >= 50:
        earned.add("games_50")

    return [
        Badge(id=bid, name=name, description=desc, earned=(bid in earned))
        for bid, name, desc in BADGE_DEFS
    ]


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

    result = await db.execute(
        select(
            func.coalesce(func.sum(Score.points), 0),
            func.count(Score.id),
            func.coalesce(func.max(Score.points), 0),
            func.min(Score.time_seconds),
        ).where(Score.user_id == user_id)
    )
    total_points, games_played, best_score, fastest_time = result.one()

    # streak calc — distinct dates played
    result = await db.execute(
        select(func.distinct(cast(Score.completed_at, Date)))
        .where(Score.user_id == user_id)
        .order_by(cast(Score.completed_at, Date).desc())
    )
    played_dates = [row[0] for row in result.all()]

    current_streak = 0
    longest_streak = 0
    if played_dates:
        streak = 0
        expected = date.today()
        for d in played_dates:
            if d == expected:
                streak += 1
                expected -= timedelta(days=1)
            elif d == expected + timedelta(days=1):
                if streak == 0:
                    expected = d
                    streak = 1
                    expected -= timedelta(days=1)
                else:
                    break
            else:
                break
        current_streak = streak

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
    badges = compute_badges(games_played, total_points, best_score, current_streak, longest_streak, fastest_time)

    return UserStats(
        display_name=user.display_name,
        total_points=total_points,
        total_coins=total_points,
        games_played=games_played,
        current_streak=current_streak,
        longest_streak=longest_streak,
        best_score=best_score,
        level=level,
        level_name=level_name,
        badges=badges,
    )
