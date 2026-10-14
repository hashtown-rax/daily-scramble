import { useState, useEffect } from 'react';
import { submitScore } from '../api';

export default function Results({ puzzle, wordScores, guesses, timeTaken, userId }) {
  const [serverData, setServerData] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const wordsSolved = wordScores.filter((s) => s > 0).length;
  const wordPoints = wordScores.reduce((a, b) => a + b, 0);
  const timeBonus = Math.max(0, Math.floor(300 - timeTaken));

  useEffect(() => {
    if (submitted) return;

    submitScore({
      user_id: userId,
      puzzle_id: puzzle.id,
      guesses,
      time_seconds: timeTaken,
    })
      .then((res) => {
        setSubmitted(true);
        setServerData(res);
        localStorage.setItem(`played_${puzzle.date}`, 'true');
      })
      .catch((err) => {
        if (err.message === 'Already submitted for today') {
          setSubmitted(true);
          localStorage.setItem(`played_${puzzle.date}`, 'true');
        } else {
          setError(err.message);
        }
      });
  }, []);

  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    function update() {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const multiplier = serverData?.multiplier || 1;
  const totalCoins = serverData?.coins || (wordPoints + timeBonus);
  const streak = serverData?.streak || 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h2 className="text-2xl font-bold mb-1">Nice work!</h2>
      <p className="text-slate-400 mb-6">
        {wordsSolved} of {puzzle.words.length} words solved
      </p>

      {/* coins earned */}
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-xs mb-4">
        <div className="text-sm text-slate-400 mb-1">Coins earned</div>
        <div className="text-4xl font-bold text-amber-500 mb-4">{totalCoins}</div>
        <div className="text-sm text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Words</span>
            <span className="text-white">{wordPoints}</span>
          </div>
          <div className="flex justify-between">
            <span>Time bonus</span>
            <span className="text-white">+{timeBonus}</span>
          </div>
          {multiplier > 1 && (
            <div className="flex justify-between text-amber-400">
              <span>Streak bonus ({streak} days)</span>
              <span>{multiplier}x</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-700 pt-1 mt-1">
            <span>Time</span>
            <span className="text-white">{timeTaken.toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {/* streak info */}
      {streak > 0 && (
        <div className="bg-slate-800 rounded-lg px-4 py-3 w-full max-w-xs mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-400">Current streak</span>
          <span className="text-lg font-bold text-orange-400">{streak} day{streak !== 1 ? 's' : ''} 🔥</span>
        </div>
      )}

      {/* word breakdown */}
      <div className="w-full max-w-xs space-y-2 mb-6">
        {puzzle.words.map((word, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-slate-400">{word.answer}</span>
            <span className={wordScores[i] > 0 ? 'text-green-400' : 'text-red-400'}>
              {wordScores[i] > 0 ? `+${wordScores[i]}` : 'missed'}
            </span>
          </div>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="text-slate-500 text-sm">
        Next puzzle in <span className="text-white">{countdown}</span>
      </div>
    </div>
  );
}
