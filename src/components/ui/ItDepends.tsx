import React from 'react';
import { DONATION_URL } from '../../constants';

export const ItDepends: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [count, setCount] = React.useState<number>(() => {
    try { return parseInt(localStorage.getItem('fa:depends-count') || '0', 10) || 0; } catch { return 0; }
  });

  const increment = () => {
    const next = count + 1;
    setCount(next);
    try { localStorage.setItem('fa:depends-count', String(next)); } catch {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(o => !o); increment(); }}
        className="text-xs bg-white border border-slate-300 rounded-full px-2 py-1 hover:bg-slate-50 inline-flex items-center gap-1"
        title="Click for a smile 😊"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>It depends</span>
        <span aria-hidden className="text-slate-400">🎲</span>
      </button>
      {open && (
        <div role="dialog" aria-label="It depends panel" className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-40">
          <div className="text-sm text-slate-800 font-medium">It depends…</div>
          <div className="text-xs text-slate-600 mt-1">On your goals, your data, and the friends we made along the way.</div>
          <div className="mt-2 text-xs text-slate-500">Clicks so far: <span className="font-semibold text-slate-700">{count}</span></div>
          <div className="mt-3 flex items-center gap-2">
            <a href={DONATION_URL} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 inline-flex items-center gap-1">
              <i className="fas fa-hand-holding-heart" aria-hidden="true"></i>
              Donate $1
            </a>
            <button onClick={() => setOpen(false)} className="text-xs px-2 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-100">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

