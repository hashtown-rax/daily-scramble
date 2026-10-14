import { useState, useEffect } from 'react';
import { getUserStats, getDailyStatus } from './api';
import Onboarding from './components/Onboarding';
import PlayMenu from './components/PlayMenu';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import Stats from './components/Stats';
import Navbar from './components/Navbar';

export default function App() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('play');
  const [gameMode, setGameMode] = useState(null); // null = menu, 'daily' | 'practice'
  const [dailyDone, setDailyDone] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user_id');
    if (!stored) {
      setLoading(false);
      return;
    }
    getUserStats(stored)
      .then(() => {
        setUserId(stored);
        return getDailyStatus(stored);
      })
      .then((res) => setDailyDone(res.done))
      .catch(() => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('display_name');
      })
      .finally(() => setLoading(false));
  }, []);

  function handleBackFromGame() {
    setGameMode(null);
    // refresh daily status
    if (userId) {
      getDailyStatus(userId).then((res) => setDailyDone(res.done)).catch(() => {});
    }
    setTab('play');
  }

  function handleDailyDone() {
    setGameMode(null);
    setDailyDone(true);
    setTab('leaderboard');
  }

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
      {tab === 'play' && !gameMode && (
        <PlayMenu
          dailyDone={dailyDone}
          onSelect={(mode) => setGameMode(mode)}
        />
      )}
      {tab === 'play' && gameMode && (
        <Game
          userId={userId}
          mode={gameMode}
          onBack={gameMode === 'daily' ? handleDailyDone : handleBackFromGame}
        />
      )}
      {tab === 'leaderboard' && <Leaderboard />}
      {tab === 'stats' && <Stats userId={userId} />}
      <Navbar active={tab} onChange={(t) => { setTab(t); setGameMode(null); }} />
    </div>
  );
}
