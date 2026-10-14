const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Something went wrong' }));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

export function createUser(displayName) {
  return request('/api/users', {
    method: 'POST',
    body: JSON.stringify({ display_name: displayName }),
  });
}

export function getUserStats(userId) {
  return request(`/api/users/${userId}/stats`);
}

export function getNewPuzzle() {
  return request('/api/puzzle/new');
}

export function submitScore(data) {
  return request('/api/scores', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getLeaderboard(date) {
  const params = date ? `?target_date=${date}` : '';
  return request(`/api/leaderboard${params}`);
}
