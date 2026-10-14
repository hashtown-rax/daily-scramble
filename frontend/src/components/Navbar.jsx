export default function Navbar({ active, onChange }) {
  const tabs = [
    { id: 'play', label: 'Play' },
    { id: 'leaderboard', label: 'Ranks' },
    { id: 'stats', label: 'Stats' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800">
      <div className="flex max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-4 text-sm font-medium ${
              active === tab.id ? 'text-amber-500' : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
