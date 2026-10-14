import { useState, useEffect } from 'react';
import { getUserStats } from '../api';

const LEVEL_THRESHOLDS = [0, 2000, 5000, 10000, 20000];

export default function Stats({ userId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserStats(userId)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <p className="text-slate-400 text-center mt-12">Loading...</p>;
  }

  if (!stats) {
    return <p className="text-slate-400 text-center mt-12">Could not load stats.</p>;
  }

  const nextThreshold = LEVEL_THRESHOLDS[stats.level] || null;
  const prevThreshold = LEVEL_THRESHOLDS[stats.level - 1] || 0;
  const progress = nextThreshold
    ? ((stats.total_points - prevThreshold) / (nextThreshold - prevThreshold)) * 100
    : 100;

  const earnedBadges = stats.badges.filter((b) => b.earned);
  const lockedBadges = stats.badges.filter((b) => !b.earned);

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-1 text-center">{stats.display_name}</h2>
      <p className="text-amber-500 text-center mb-6">
        Level {stats.level} — {stats.level_name}
      </p>

      {/* level progress bar */}
      <div className="bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
        <div
          className="bg-amber-500 h-full rounded-full transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="text-slate-500 text-xs mb-6 text-center">
        {stats.total_points} pts
        {nextThreshold ? ` / ${nextThreshold} to next level` : ' — max level!'}
      </p>

      {/* coins */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 text-center">
        <div className="text-3xl font-bold text-amber-500">{stats.total_coins}</div>
        <div className="text-xs text-slate-400 mt-1">Total coins earned</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Current streak" value={stats.current_streak > 0 ? `${stats.current_streak} 🔥` : '0'} />
        <StatCard label="Longest streak" value={`${stats.longest_streak} day${stats.longest_streak !== 1 ? 's' : ''}`} />
        <StatCard label="Games played" value={stats.games_played} />
        <StatCard label="Best score" value={stats.best_score} />
      </div>

      {/* badges */}
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Badges</h3>
      {earnedBadges.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {earnedBadges.map((badge) => (
            <div key={badge.id} className="bg-slate-800 rounded-lg p-3 border border-amber-500/30">
              <div className="text-sm font-semibold text-white">{badge.name}</div>
              <div className="text-xs text-slate-400 mt-1">{badge.description}</div>
            </div>
          ))}
        </div>
      )}
      {lockedBadges.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {lockedBadges.map((badge) => (
            <div key={badge.id} className="bg-slate-800/50 rounded-lg p-3 opacity-50">
              <div className="text-sm font-semibold text-slate-500">{badge.name}</div>
              <div className="text-xs text-slate-600 mt-1">{badge.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 text-center">
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}
