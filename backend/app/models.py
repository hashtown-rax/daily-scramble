import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    display_name: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Puzzle(Base):
    __tablename__ = "puzzles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    words: Mapped[list] = mapped_column(JSONB)
    is_daily: Mapped[bool] = mapped_column(Boolean, default=False)
    date: Mapped[datetime] = mapped_column(Date, nullable=True, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Score(Base):
    __tablename__ = "scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    puzzle_id: Mapped[int] = mapped_column(Integer, ForeignKey("puzzles.id"))
    points: Mapped[int] = mapped_column(Integer)
    time_seconds: Mapped[float] = mapped_column(Float)
    words_solved: Mapped[int] = mapped_column(Integer)
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
