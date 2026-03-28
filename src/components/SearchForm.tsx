import { useState } from 'react';
import type { SearchParams, CabinClass } from '../types';

interface Props {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

const CABIN_OPTIONS: { value: CabinClass; label: string }[] = [
  { value: 'any', label: 'Any Cabin' },
  { value: 'economy', label: 'Economy' },
  { value: 'premium', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
];

export default function SearchForm({ onSearch, loading }: Props) {
  const [form, setForm] = useState<SearchParams>({
    from: '',
    to: '',
    date: '',
    cabin: 'any',
  });

  const set = (field: keyof SearchParams) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.from && form.to && form.date) onSearch(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-[#dddddd] p-8 w-full max-w-3xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* From */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#aaaaaa] uppercase tracking-wider">
            From
          </label>
          <input
            type="text"
            value={form.from}
            onChange={set('from')}
            placeholder="BOS"
            maxLength={3}
            required
            className="border border-[#dddddd] rounded-lg px-4 py-3 text-lg font-medium uppercase tracking-widest text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#bbbbbb] transition"
          />
        </div>

        {/* To */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#aaaaaa] uppercase tracking-wider">
            To
          </label>
          <input
            type="text"
            value={form.to}
            onChange={set('to')}
            placeholder="ZRH"
            maxLength={3}
            required
            className="border border-[#dddddd] rounded-lg px-4 py-3 text-lg font-medium uppercase tracking-widest text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#bbbbbb] transition"
          />
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#aaaaaa] uppercase tracking-wider">
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={set('date')}
            required
            min={new Date().toISOString().split('T')[0]}
            className="border border-[#dddddd] rounded-lg px-4 py-3 text-base text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#bbbbbb] transition"
          />
        </div>

        {/* Cabin Class */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#aaaaaa] uppercase tracking-wider">
            Cabin Class
          </label>
          <select
            value={form.cabin}
            onChange={set('cabin')}
            className="border border-[#dddddd] rounded-lg px-4 py-3 text-base text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#bbbbbb] transition bg-white"
          >
            {CABIN_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-[#aaaaaa] hover:bg-[#999999] disabled:bg-[#cccccc] text-white font-bold py-4 rounded-xl text-lg tracking-wide transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            Searching...
          </>
        ) : (
          'Yip Yip!'
        )}
      </button>
    </form>
  );
}
