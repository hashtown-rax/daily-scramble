export default function PlayMenu({ onSelect, dailyDone }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-3xl font-bold mb-2">Daily Scramble</h1>
      <p className="text-slate-400 mb-8 text-center">
        Unscramble 5 words. Earn coins. Build your streak.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => onSelect('daily')}
          className={`w-full py-4 rounded-xl font-semibold text-lg ${
            dailyDone
              ? 'bg-slate-800 text-slate-500'
              : 'bg-amber-500 text-slate-900 active:bg-amber-600'
          }`}
          disabled={dailyDone}
        >
          {dailyDone ? 'Daily Challenge completed' : "Today's Challenge"}
        </button>
        {!dailyDone && (
          <p className="text-xs text-slate-500 text-center -mt-1">
            Same words for everyone. Scores go on the leaderboard.
          </p>
        )}

        <button
          onClick={() => onSelect('practice')}
          className="w-full py-4 rounded-xl bg-slate-800 text-white font-semibold text-lg active:bg-slate-700"
        >
          Practice
        </button>
        <p className="text-xs text-slate-500 text-center -mt-1">
          Random words. Play as many times as you want.
        </p>
      </div>
    </div>
  );
}
