Ref: KL-7Q4

# Daily Scramble

A daily word game. Unscramble 5 words, earn coins, build your streak, climb the leaderboard.

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

Builds the React app and copies it into `backend/static/`. FastAPI serves everything from a single process.

### Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://user:pass@host:5432/daily_scramble` |

## How it works

The app has two modes:

**Daily Challenge** — The server picks 5 words using the date as a seed. Everyone gets the same puzzle. One attempt per day. Scores go on the leaderboard.

**Practice** — Random words each time. Play as many times as you want. Earn coins, no leaderboard.

Players get 2 attempts per word. Points: 100 for first try, 50 for second, 0 if missed. A time bonus (up to 300 points) rewards speed. Max base score is 800.

Streak multipliers reward consistency: 3 days = 1.5x, 7 days = 2x, 14 days = 2.5x, 30 days = 3x.

Scoring is validated server-side — the client sends guesses and the server computes the final score.

## Deploying to Render

1. Create a PostgreSQL database on Render
2. Create a **Web Service** pointing to this repo
   - **Build command**: `./build.sh`
   - **Start command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment variable**: `DATABASE_URL` = your connection string (use `postgresql+asyncpg://...`)

Single deploy — FastAPI serves the API and the React frontend from one process.

## AI tools used

Built with Claude Code (Anthropic). Used for scaffolding, component writing, and backend route generation. All design decisions, architecture, and review were done manually.
