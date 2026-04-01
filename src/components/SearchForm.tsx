import { useState, useRef, useEffect } from 'react';
import type { SearchParams, CabinClass } from '../types';
import { findNearestAirport } from '../utils/nearestAirport';

interface Props {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
  onOriginDetected?: (code: string) => void;
}

const CABIN_OPTIONS: { value: CabinClass; label: string }[] = [
  { value: 'any',      label: 'Any cabin' },
  { value: 'economy',  label: 'Economy' },
  { value: 'premium',  label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first',    label: 'First' },
];

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
  CPT: 'Cape Town', ADD: 'Addis Ababa',
  SIN: 'Singapore', HKG: 'Hong Kong', NRT: 'Tokyo', HND: 'Tokyo Haneda',
  ICN: 'Seoul', PVG: 'Shanghai', PEK: 'Beijing', BKK: 'Bangkok',
  KUL: 'Kuala Lumpur', DEL: 'Delhi', BOM: 'Mumbai',
  SYD: 'Sydney', MEL: 'Melbourne', AKL: 'Auckland',
};

const ALL_AIRPORTS = Object.entries(CODE_TO_CITY).map(([code, city]) => ({
  code, city,
  label: `${city} (${code})`,
  search: `${city} ${code}`.toLowerCase(),
}));

function resolve(input: string): string {
  const up = input.trim().toUpperCase();
  if (CODE_TO_CITY[up]) return up;
  const match = ALL_AIRPORTS.find(a => a.search.startsWith(input.trim().toLowerCase()))
    ?? ALL_AIRPORTS.find(a => a.search.includes(input.trim().toLowerCase()));
  return match ? match.code : up;
}

// ── City autocomplete input ────────────────────────────────────────────────────
function CityInput({
  label, value, onChange, onCommit, placeholder, detecting,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCommit?: () => void;
  placeholder: string;
  detecting?: boolean;
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
    <div ref={ref} className="relative flex-1 px-6 py-4 flex flex-col justify-center min-w-0">
      <label className="text-[10px] uppercase tracking-widest text-[#AAAAAA] font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { setOpen(false); onCommit?.(); }}
        onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') onCommit?.(); }}
        placeholder={detecting ? 'Detecting…' : placeholder}
        required
        autoComplete="off"
        className="font-hand text-4xl font-bold text-[#1A1A1A] bg-transparent outline-none placeholder:text-[#CCCCCC] w-full truncate"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 bg-white border border-[#D4D0CB] rounded-xl shadow-lg overflow-hidden mt-1">
          {suggestions.map(s => (
            <button
              key={s.code}
              type="button"
              onMouseDown={() => {
                onChange(s.city);
                setOpen(false);
                onCommit?.();
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F5F3F0] transition flex items-center justify-between"
            >
              <span className="text-[#1A1A1A]">{s.city}</span>
              <span className="text-xs text-[#AAAAAA] font-mono">{s.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────────
export default function SearchForm({ onSearch, loading, onOriginDetected }: Props) {
  const [fromDisplay, setFromDisplay] = useState('');
  const [toDisplay,   setToDisplay]   = useState('');
  const [toCommitted, setToCommitted] = useState(false);
  const [date,        setDate]        = useState('');
  const [cabin,       setCabin]       = useState<CabinClass>('business');
  const [detecting,   setDetecting]   = useState(false);

  const showDateSection = fromDisplay.trim().length > 1 && toCommitted && toDisplay.trim().length > 1;

  // Detect location on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { code, city } = findNearestAirport(pos.coords.latitude, pos.coords.longitude);
        setFromDisplay(city);
        setDetecting(false);
        onOriginDetected?.(code);
      },
      () => setDetecting(false),
      { timeout: 8000 }
    );
  }, []);

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
          <CityInput
            label="From"
            value={fromDisplay}
            onChange={setFromDisplay}
            placeholder="Boston"
            detecting={detecting && !fromDisplay}
          />
          <div className="flex items-center px-2 border-l border-r border-dashed border-[#D4D0CB] shrink-0">
            <span className="text-[#AAAAAA] text-xl">→</span>
          </div>
          <CityInput
            label="To"
            value={toDisplay}
            onChange={v => { setToDisplay(v); setToCommitted(false); }}
            onCommit={() => { if (toDisplay.trim().length > 1) setToCommitted(true); }}
            placeholder="Zurich"
          />
        </div>

      </div>

      {/* Date pill — revealed after both cities are filled */}
      {showDateSection && (
        <div className="flex gap-3 animate-[fadeSlideDown_0.25s_ease-out]">
          {/* Date input */}
          <label className="flex-1 flex items-center justify-between bg-white border-2 border-[#1A1A1A] rounded-full px-6 py-4 cursor-pointer">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              autoFocus
              min={new Date().toISOString().split('T')[0]}
              className="font-hand text-2xl text-[#1A1A1A] bg-transparent outline-none w-full placeholder:text-[#AAAAAA] [color-scheme:light]"
              placeholder="When do you want to go?"
            />
            <svg className="text-[#888888] shrink-0 ml-3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </label>

          {/* Cabin pill */}
          <label className="flex items-center gap-2 bg-white border-2 border-[#1A1A1A] rounded-full px-5 py-4 cursor-pointer">
            <select
              value={cabin}
              onChange={e => setCabin(e.target.value as CabinClass)}
              className="font-hand text-xl text-[#1A1A1A] bg-transparent outline-none cursor-pointer"
            >
              {CABIN_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Search button — only show after both cities + date filled */}
      {showDateSection && (
        <button
          type="submit"
          disabled={loading || !date}
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
      )}
    </form>
  );
}
