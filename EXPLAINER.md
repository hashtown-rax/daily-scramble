# What I built

Daily Scramble is a word game. You unscramble 5 words, earn coins, and try to beat other players on the daily leaderboard.

There are two modes. The **Daily Challenge** gives everyone the same 5 words — you get one attempt, and your score goes on the leaderboard. **Practice** mode gives you random words and lets you play as many times as you want.

## Why a word scramble

I wanted something that takes under two minutes, works on any phone, and doesn't need images or heavy assets. A word scramble hits all three. The words are common English (4-6 letters), picked to be accessible for people reading English as a second language.

## Choices I made

**Two modes instead of one.** I started with only a daily puzzle, but that means users open the app once, play, and leave. Adding practice mode gives people a reason to stay longer and keep earning.

**Server-side scoring.** The client sends guesses, not scores. The server validates each guess against the actual answer and computes points. This prevents anyone from faking a score through the browser console.

**Streak multipliers.** Streaks on their own feel like a vanity metric. Tying them to a coin multiplier (1.5x at 3 days, 2x at 7, up to 3x at 30) makes them worth something. If the platform pays real money, this is the lever.

**Single deploy.** FastAPI serves the React build as static files. One process, one URL, no CORS. Simpler to deploy, simpler to reason about.

**Coins, not points.** Same number, different framing. "You earned 435 coins" feels more tangible than "You scored 435 points," especially for users who will eventually exchange them for something real.

**Badges as goals.** 10 badges give new players something to aim at beyond the daily score. Things like "Speed Demon" (finish under 30 seconds) or "Week Warrior" (7-day streak) are achievable enough to feel motivating.

## What I left out

**User accounts with login.** Right now, identity is a UUID in localStorage. If someone clears their browser, they lose their history. For a real product, I'd add phone number or Google sign-in — but for a build task, anonymous auth keeps the friction at zero.

**Difficulty scaling.** All words are roughly the same difficulty. A real version could grade words by frequency and ramp up as users level up.

**Sounds and animations.** A small success sound on correct answers and a shake animation on wrong ones would make the app feel much better. I skipped them to keep scope tight.

**Offline support.** A service worker could cache the daily puzzle and queue score submissions. Important for users on spotty mobile data, but out of scope here.

## AI tools

I used Claude Code (Anthropic) throughout. It handled scaffolding, component writing, route generation, and iterating on the game logic. I made the design decisions — what to build, how the reward system works, the two-mode structure, server-side scoring — and reviewed all the code it produced.
