from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel


class CreateUser(BaseModel):
    display_name: str


class UserOut(BaseModel):
    id: UUID
    display_name: str
    created_at: datetime


class Badge(BaseModel):
    id: str
    name: str
    description: str
    earned: bool


class UserStats(BaseModel):
    display_name: str
    total_points: int
    total_coins: int
    games_played: int
    current_streak: int
    longest_streak: int
    best_score: int
    level: int
    level_name: str
    badges: list[Badge]


class PuzzleWord(BaseModel):
    scrambled: str
    answer: str


class PuzzleOut(BaseModel):
    id: int
    is_daily: bool
    words: list[PuzzleWord]


class GuessResult(BaseModel):
    word_index: int
    guess: str
    attempts: int  # 1 or 2


class SubmitScore(BaseModel):
    user_id: UUID
    puzzle_id: int
    guesses: list[GuessResult]
    time_seconds: float


class ScoreOut(BaseModel):
    display_name: str
    points: int
    time_seconds: float
    words_solved: int


class LeaderboardOut(BaseModel):
    date: date
    scores: list[ScoreOut]
