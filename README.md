Ref: KL-7Q4

# Daily Scramble

A daily word game. Unscramble 5 words, earn points, build your streak, climb the leaderboard.

## Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy (async)
- **Database**: PostgreSQL

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (local or hosted — Supabase free tier works)

### Local development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit with your database URL
uvicorn app.main:app --reload --port 8001

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API calls to the backend.

### Production build

```bash
./build.sh
```

This builds the React app and copies it into `backend/static/`. FastAPI serves everything from a single process.

### Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (asyncpg) | `postgresql+asyncpg://user:pass@host:5432/daily_scramble` |

## How it works

Every day, the server picks 5 words from a curated list using the date as a seed — everyone gets the same puzzle. Words are scrambled deterministically and sent to the client.

Players get 2 attempts per word. Points: 100 for first try, 50 for second, 0 if missed. A time bonus (up to 300 points) rewards speed. Max score per game is 800.

Scoring is validated server-side — the client sends guesses and the server computes the final score.

Streaks track consecutive days played. Levels (Starter → Lexicon) unlock as you accumulate points. The leaderboard shows today's top 20.

## Deploying to Render

1. Create a PostgreSQL database on Render (or Supabase)
2. Create a **Web Service** pointing to this repo
   - **Build command**: `./build.sh`
   - **Start command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment variable**: `DATABASE_URL` = your PostgreSQL connection string (use `postgresql+asyncpg://...`)

Single deploy — FastAPI serves the API and the React frontend from one process.

## AI tools used

Built with Claude Code (Anthropic). Used for scaffolding, component writing, and backend route generation. All design decisions, architecture, and review were done manually.
