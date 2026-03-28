import { useState } from 'react';

const STORAGE_KEY = 'airb_auth';
const GATE_KEY = (import.meta.env.VITE_GATE_KEY as string)?.trim();

function isUnlocked() {
  return localStorage.getItem(STORAGE_KEY) === GATE_KEY;
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (!GATE_KEY || unlocked) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === GATE_KEY) {
      localStorage.setItem(STORAGE_KEY, GATE_KEY);
      setUnlocked(true);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#DFD9D9] flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] px-8 py-10 w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <div className="text-3xl font-extrabold text-[#555555] tracking-tight">✈ A(i)rbitrage</div>
          <p className="text-sm text-[#aaaaaa] mt-2">Private beta — enter your access code</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            placeholder="Access code"
            autoFocus
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition
              ${error
                ? 'border-red-300 bg-red-50 text-red-700 placeholder-red-300'
                : 'border-[#e0e0e0] bg-[#fafafa] text-[#444444] focus:border-[#aaaaaa]'
              }`}
          />
          {error && <p className="text-xs text-red-500 -mt-1">Incorrect code — try again.</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#555555] text-white text-sm font-semibold hover:bg-[#444444] transition"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
