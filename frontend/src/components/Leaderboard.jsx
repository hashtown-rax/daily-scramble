import { useState, useEffect } from 'react';
import { getLeaderboard } from '../api';

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-slate-400 text-center mt-12">Loading...</p>;
  }

  if (!data || data.scores.length === 0) {
    return (
      <div className="text-center mt-12 px-4">
        <h2 className="text-xl font-bold mb-2">Leaderboard</h2>
        <p className="text-slate-400">No scores yet today. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Today's Leaderboard</h2>

      <div className="space-y-2">
        {data.scores.map((entry, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-bold w-6 ${
                  i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'
                }`}
              >
                {i + 1}
              </span>
              <span className="text-white">{entry.display_name}</span>
            </div>
            <div className="text-right">
              <span className="text-amber-500 font-semibold">{entry.points}</span>
              <span className="text-slate-500 text-xs ml-2">{entry.time_seconds.toFixed(1)}s</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
