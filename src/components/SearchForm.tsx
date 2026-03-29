import { useState } from 'react';
import type { SearchParams, CabinClass } from '../types';

interface Props {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

const CABIN_OPTIONS: { value: CabinClass; label: string }[] = [
  { value: 'any',      label: 'Any cabin' },
  { value: 'economy',  label: 'Economy' },
  { value: 'premium',  label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first',    label: 'First' },
];

const AIRPORT_CITIES: Record<string, string> = {
  ATL: 'Atlanta', ORD: 'Chicago', DFW: 'Dallas', DEN: 'Denver',
  LAX: 'Los Angeles', JFK: 'New York', EWR: 'Newark', LGA: 'New York',
  SFO: 'San Francisco', SEA: 'Seattle', MIA: 'Miami', BOS: 'Boston',
  IAD: 'Washington', DCA: 'Washington', PHX: 'Phoenix', LAS: 'Las Vegas',
  YYZ: 'Toronto', YVR: 'Vancouver', YUL: 'Montreal', MEX: 'Mexico City',
  LHR: 'London', LGW: 'London', CDG: 'Paris', AMS: 'Amsterdam',
  FRA: 'Frankfurt', MUC: 'Munich', ZRH: 'Zurich', VIE: 'Vienna',
  MAD: 'Madrid', BCN: 'Barcelona', FCO: 'Rome', MXP: 'Milan',
  CPH: 'Copenhagen', ARN: 'Stockholm', LIS: 'Lisbon', ATH: 'Athens',
  DXB: 'Dubai', AUH: 'Abu Dhabi', DOH: 'Doha', IST: 'Istanbul',
  SIN: 'Singapore', HKG: 'Hong Kong', NRT: 'Tokyo', HND: 'Tokyo',
  ICN: 'Seoul', PVG: 'Shanghai', BKK: 'Bangkok', SYD: 'Sydney',
};

function cityFor(code: string) {
  return AIRPORT_CITIES[code.toUpperCase()] ?? '';
}

export default function SearchForm({ onSearch, loading }: Props) {
  const [form, setForm] = useState<SearchParams>({ from: '', to: '', date: '', cabin: 'any' });

  const set = (field: keyof SearchParams) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.from && form.to && form.date) onSearch(form);
  };

  const fromCity = cityFor(form.from);
  const toCity   = cityFor(form.to);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col gap-3">
      {/* Main search box */}
      <div className="bg-white rounded-2xl border border-[#D4D0CB] shadow-sm overflow-hidden">
        <div className="flex items-stretch">
          {/* From */}
          <div className="flex-1 px-6 py-4 flex flex-col justify-center">
            <label className="text-[10px] uppercase tracking-widest text-[#AAAAAA] font-medium mb-1">From</label>
            <input
              type="text"
              value={form.from}
              onChange={e => setForm(prev => ({ ...prev, from: e.target.value.toUpperCase() }))}
              placeholder="BOS"
              maxLength={3}
              required
              className="font-hand text-4xl font-bold text-[#1A1A1A] bg-transparent outline-none placeholder:text-[#CCCCCC] uppercase w-full"
            />
            {fromCity && <span className="text-xs text-[#999999] mt-0.5">{fromCity}</span>}
          </div>

          {/* Arrow divider */}
          <div className="flex items-center px-2 border-l border-r border-dashed border-[#D4D0CB]">
            <span className="text-[#AAAAAA] text-xl">→</span>
          </div>

          {/* To */}
          <div className="flex-1 px-6 py-4 flex flex-col justify-center">
            <label className="text-[10px] uppercase tracking-widest text-[#AAAAAA] font-medium mb-1">To</label>
            <input
              type="text"
              value={form.to}
              onChange={e => setForm(prev => ({ ...prev, to: e.target.value.toUpperCase() }))}
              placeholder="ZRH"
              maxLength={3}
              required
              className="font-hand text-4xl font-bold text-[#1A1A1A] bg-transparent outline-none placeholder:text-[#CCCCCC] uppercase w-full"
            />
            {toCity && <span className="text-xs text-[#999999] mt-0.5">{toCity}</span>}
          </div>
        </div>

        {/* Date + Cabin row */}
        <div className="border-t border-[#EEEEEE] flex">
          <div className="flex-1 px-6 py-3 border-r border-[#EEEEEE]">
            <label className="text-[10px] uppercase tracking-widest text-[#AAAAAA] font-medium block mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={set('date')}
              required
              min={new Date().toISOString().split('T')[0]}
              className="text-sm text-[#444444] bg-transparent outline-none w-full"
            />
          </div>
          <div className="flex-1 px-6 py-3">
            <label className="text-[10px] uppercase tracking-widest text-[#AAAAAA] font-medium block mb-1">Cabin</label>
            <select
              value={form.cabin}
              onChange={set('cabin')}
              className="text-sm text-[#444444] bg-transparent outline-none w-full"
            >
              {CABIN_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3DB551] hover:bg-[#35A348] disabled:bg-[#A8D9B0] text-white font-hand font-bold text-2xl py-3 rounded-2xl transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            Searching...
          </>
        ) : (
          'Search flights'
        )}
      </button>
    </form>
  );
}
