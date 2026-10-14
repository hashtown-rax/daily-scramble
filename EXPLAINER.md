# What I built

Daily Scramble is a word game. You get 5 scrambled words, unscramble them as fast as you can, and earn coins for it.

There are two modes. The Daily Challenge gives every player the same 5 words for that day. You get one shot at it, and your score goes on the leaderboard so you can see how you did compared to everyone else. Practice mode gives you random words and lets you play as many times as you want.

# Why a word scramble

I wanted something that takes under two minutes, works on any phone, and does not need images or heavy downloads. A word scramble fits all three. The words are common English, 4 to 6 letters, chosen to be easy for people who read English as a second language. The entire app is about 72KB.

# Choices I made

I started with just a daily puzzle but quickly realized that means people open the app once, play, and leave. Adding a practice mode gives them a reason to stay and keep earning. Both modes feed into the same coin balance, streaks, badges, and levels.

Scoring happens on the server. The client sends your guesses, not your score. The server checks each guess against the real answer and calculates the points. This means no one can fake a high score through the browser console.

Streaks on their own feel like a counter that goes up. I tied them to a coin multiplier so they actually mean something. Play 3 days in a row and you earn 1.5x coins. A week gets you 2x. A month gets you 3x. If the platform eventually pays real money, this is where it matters.

I framed everything as coins instead of points. Same number, but "you earned 435 coins" feels more concrete than "you scored 435 points," especially when users will eventually trade them for something real.

There are 10 badges that give new players short-term goals. Things like finishing a puzzle in under 30 seconds, or hitting a 7-day streak. They are achievable enough to keep people motivated in the first few weeks.

For deployment, I kept it to a single process. FastAPI serves the React build as static files. One URL, no separate frontend deploy, no CORS configuration. Simpler to run, simpler to debug.

# What I left out

Right now, identity is just a UUID stored in the browser. If someone clears their data, they lose their history. A real version would need phone number or Google sign-in, but for this task, zero-friction onboarding felt more important than persistence.

All words are roughly the same difficulty. A better version would grade words by how common they are and make puzzles harder as people level up.

Sound and animation would make the app feel a lot better. A small chime on a correct answer, a shake on a wrong one. I skipped them to keep scope tight.

Offline support through a service worker would let people play on spotty connections and sync scores when they are back online. Important for the target audience, but out of scope here.

# AI tools

I used Claude Code by Anthropic throughout the build. It handled scaffolding, writing React components, generating FastAPI routes, and iterating on the game logic. I made the design decisions -- what to build, how rewards work, the two-mode structure, server-side scoring -- and reviewed everything it wrote.
