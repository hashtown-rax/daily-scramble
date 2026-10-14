Ref: KL-7Q4

# Daily Scramble

A word game where you unscramble 5 words, earn coins, and compete on a daily leaderboard.

## Stack

Frontend is React with Vite and Tailwind CSS. Backend is FastAPI with SQLAlchemy (async). Database is PostgreSQL.

## Setup

You need Python 3.11+, Node.js 18+, and a PostgreSQL database. A free Supabase or Render Postgres instance works fine.

### Backend

```
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit the .env file with your database connection string, then start the server:

```
uvicorn app.main:app --reload --port 8001
```

### Frontend

In a separate terminal:

```
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:5173 and proxies API calls to the backend.

### Production build

```
./build.sh
```

This builds the React app and copies it into backend/static/. FastAPI serves everything from a single process.

### Environment variables

DATABASE_URL -- PostgreSQL connection string using asyncpg, like postgresql+asyncpg://user:pass@host:5432/daily_scramble

## How it works

There are two modes.

Daily Challenge gives everyone the same 5 words. You get one attempt per day. Your score goes on the leaderboard.

Practice gives you random words each time. You can play as many rounds as you want and keep earning coins.

You get 2 attempts per word. First try is worth 100 points, second try is 50, and a miss is 0. There is a time bonus of up to 300 points for finishing quickly. Max base score per game is 800.

Streak multipliers kick in when you play on consecutive days. 3 days gets you 1.5x, 7 days is 2x, 14 days is 2.5x, and 30 days is 3x.

The server validates all scoring. The client sends your guesses and the server computes the final score, so scores cannot be faked from the browser.

## Deploying to Render

Create a PostgreSQL database on Render. Then create a Web Service pointing to this repo.

Build command: ./build.sh
Start command: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
Environment variable: DATABASE_URL set to your connection string, with postgresql+asyncpg:// as the prefix.

One deploy, one process. FastAPI serves both the API and the frontend.

## AI tools

Built with Claude Code by Anthropic. I used it for scaffolding, writing components, and generating backend routes. Design decisions, architecture, the reward system, and code review were all done by me.
