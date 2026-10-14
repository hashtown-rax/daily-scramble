import { useState } from 'react';
import Onboarding from './components/Onboarding';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import Stats from './components/Stats';
import Navbar from './components/Navbar';

export default function App() {
  const storedUserId = localStorage.getItem('user_id');
  const [userId, setUserId] = useState(storedUserId);
  const [tab, setTab] = useState('play');

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
