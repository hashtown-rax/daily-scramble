import { useState, useEffect } from 'react';
import { getUserStats } from './api';
import Onboarding from './components/Onboarding';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import Stats from './components/Stats';
import Navbar from './components/Navbar';

export default function App() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('play');

  // on mount, check if stored user still exists
  useEffect(() => {
    const stored = localStorage.getItem('user_id');
    if (!stored) {
      setLoading(false);
      return;
    }
    getUserStats(stored)
      .then(() => setUserId(stored))
      .catch(() => {
        // user doesn't exist anymore, clear stale data
        localStorage.removeItem('user_id');
        localStorage.removeItem('display_name');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <Onboarding
        onDone={(user) => setUserId(user.id)}
      />
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {tab === 'play' && <Game userId={userId} />}
      {tab === 'leaderboard' && <Leaderboard />}
      {tab === 'stats' && <Stats userId={userId} />}
      <Navbar active={tab} onChange={setTab} />
    </div>
  );
}
