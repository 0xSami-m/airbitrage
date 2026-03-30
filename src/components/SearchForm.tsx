import { useState, useRef, useEffect } from 'react';
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

// code → primary city name
const CODE_TO_CITY: Record<string, string> = {
  ATL: 'Atlanta', ORD: 'Chicago', DFW: 'Dallas', DEN: 'Denver',
  LAX: 'Los Angeles', JFK: 'New York', EWR: 'Newark', LGA: 'New York',
  SFO: 'San Francisco', SEA: 'Seattle', MIA: 'Miami', BOS: 'Boston',
  IAD: 'Washington DC', DCA: 'Washington DC', PHX: 'Phoenix', MSP: 'Minneapolis',
  DTW: 'Detroit', CLT: 'Charlotte', PHL: 'Philadelphia', LAS: 'Las Vegas',
  AUS: 'Austin', PDX: 'Portland', SLC: 'Salt Lake City', SAN: 'San Diego',
  YYZ: 'Toronto', YVR: 'Vancouver', YUL: 'Montreal', MEX: 'Mexico City',
  CUN: 'Cancun', BOG: 'Bogotá', GRU: 'São Paulo', EZE: 'Buenos Aires',
  LHR: 'London', LGW: 'London Gatwick', STN: 'London Stansted',
  CDG: 'Paris', ORY: 'Paris Orly', AMS: 'Amsterdam',
  FRA: 'Frankfurt', MUC: 'Munich', ZRH: 'Zurich', VIE: 'Vienna',
  BRU: 'Brussels', MAD: 'Madrid', BCN: 'Barcelona', FCO: 'Rome',
  MXP: 'Milan', CPH: 'Copenhagen', ARN: 'Stockholm', HEL: 'Helsinki',
  OSL: 'Oslo', LIS: 'Lisbon', ATH: 'Athens', WAW: 'Warsaw',
  PRG: 'Prague', BUD: 'Budapest', DUB: 'Dublin', EDI: 'Edinburgh',
  DXB: 'Dubai', AUH: 'Abu Dhabi', DOH: 'Doha', IST: 'Istanbul',
  TLV: 'Tel Aviv', CAI: 'Cairo', NBO: 'Nairobi', JNB: 'Johannesburg',
  CPT: 'Cape Town', ADD: 'Addis Ababa', LOS: 'Lagos',
  SIN: 'Singapore', HKG: 'Hong Kong', NRT: 'Tokyo', HND: 'Tokyo Haneda',
  ICN: 'Seoul', PVG: 'Shanghai', PEK: 'Beijing', BKK: 'Bangkok',
  KUL: 'Kuala Lumpur', CGK: 'Jakarta', MNL: 'Manila',
  SYD: 'Sydney', MEL: 'Melbourne', BNE: 'Brisbane', AKL: 'Auckland',
  DEL: 'Delhi', BOM: 'Mumbai', BLR: 'Bangalore', HYD: 'Hyderabad',
  CMB: 'Colombo', DAC: 'Dhaka', KHI: 'Karachi', LHE: 'Lahore',
};

// All entries: [code, display label] — used for autocomplete
const ALL_AIRPORTS: { code: string; label: string; search: string }[] =
  Object.entries(CODE_TO_CITY).map(([code, city]) => ({
    code,
    label: `${city} (${code})`,
    search: `${city} ${code}`.toLowerCase(),
  }));

function resolve(input: string): string {
  const up = input.trim().toUpperCase();
  // Direct code match
  if (CODE_TO_CITY[up]) return up;
  // City name match
  const match = ALL_AIRPORTS.find(a => a.search.includes(input.trim().toLowerCase()));
  return match ? match.code : up;
}

// ── City autocomplete input ────────────────────────────────────────────────────
function CityInput({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (display: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = value.length >= 1
    ? ALL_AIRPORTS.filter(a => a.search.includes(value.toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 px-6 py-4 flex flex-col justify-center">
      <label className="text-[10px] uppercase tracking-widest text-[#AAAAAA] font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        required
        autoComplete="off"
        className="font-hand text-4xl font-bold text-[#1A1A1A] bg-transparent outline-none placeholder:text-[#CCCCCC] w-full"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-20 bg-white border border-[#D4D0CB] rounded-xl shadow-lg overflow-hidden mt-1">
          {suggestions.map(s => (
            <button
              key={s.code}
              type="button"
              onMouseDown={() => { onChange(s.label.split(' (')[0]); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F5F3F0] transition flex items-center justify-between"
            >
              <span className="text-[#1A1A1A]">{s.label.split(' (')[0]}</span>
              <span className="text-xs text-[#AAAAAA] font-mono">{s.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────────
export default function SearchForm({ onSearch, loading }: Props) {
  const [fromDisplay, setFromDisplay] = useState('');
  const [toDisplay,   setToDisplay]   = useState('');
  const [date,  setDate]  = useState('');
  const [cabin, setCabin] = useState<CabinClass>('any');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const from = resolve(fromDisplay);
    const to   = resolve(toDisplay);
    if (from && to && date) onSearch({ from, to, date, cabin });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col gap-3">
      {/* Main search box */}
      <div className="bg-white rounded-2xl border border-[#D4D0CB] shadow-sm overflow-hidden">
        <div className="flex items-stretch">
          <CityInput label="From" value={fromDisplay} onChange={setFromDisplay} placeholder="Boston" />
          <div className="flex items-center px-2 border-l border-r border-dashed border-[#D4D0CB]">
            <span className="text-[#AAAAAA] text-xl">→</span>
          </div>
          <CityInput label="To" value={toDisplay} onChange={setToDisplay} placeholder="Zurich" />
        </div>

        {/* Date + Cabin row */}
        <div className="border-t border-[#EEEEEE] flex">
          <div className="flex-1 px-6 py-3 border-r border-[#EEEEEE]">
            <label className="text-[10px] uppercase tracking-widest text-[#AAAAAA] font-medium block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="text-sm text-[#444444] bg-transparent outline-none w-full"
            />
          </div>
          <div className="flex-1 px-6 py-3">
            <label className="text-[10px] uppercase tracking-widest text-[#AAAAAA] font-medium block mb-1">Cabin</label>
            <select
              value={cabin}
              onChange={e => setCabin(e.target.value as CabinClass)}
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
          'Yip Yip!'
        )}
      </button>
    </form>
  );
}
