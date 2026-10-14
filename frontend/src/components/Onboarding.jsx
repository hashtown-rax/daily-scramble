import { useState } from 'react';
import { createUser } from '../api';

export default function Onboarding({ onDone }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const user = await createUser(name.trim());
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('display_name', user.display_name);
      onDone(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-3xl font-bold mb-2">Daily Scramble</h1>
      <p className="text-slate-400 mb-8 text-center">
        Unscramble 5 words every day. Earn points. Build your streak.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pick a display name"
          maxLength={20}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-center text-lg"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full mt-4 py-3 rounded-lg bg-amber-500 text-slate-900 font-semibold text-lg disabled:opacity-50 active:bg-amber-600"
        >
          {loading ? 'Creating...' : "Let's go"}
        </button>
        {error && <p className="text-red-400 mt-3 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
}
