import type { CabinFallbackInfo, FlightResult, FlexDateInfo, SearchParams, Trip } from '../types';
import FlightCard from './FlightCard';
import { useState } from 'react';

interface Props {
  results: FlightResult[];
  summary: string;
  error: string;
  searchParams: SearchParams;
  flexLoading?: boolean;
  flexDateInfo?: FlexDateInfo | null;
  cabinFallbackInfo?: CabinFallbackInfo | null;
  onBack: () => void;
  onBook: (result: FlightResult, trip: Trip) => void;
  onDateChange: (date: string) => void;
}

type SortKey = 'value' | 'price';

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
  ICN: 'Seoul', SYD: 'Sydney',
};

function cityFor(code: string) {
  return AIRPORT_CITIES[code] ? `${AIRPORT_CITIES[code]} ${code}` : code;
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function shiftDate(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function ResultsPanel({ results, summary, error, searchParams, flexLoading, flexDateInfo, cabinFallbackInfo, onBack, onBook, onDateChange }: Props) {
  const [sort, setSort] = useState<SortKey>('value');
  const [directOnly, setDirectOnly] = useState(false);

  const filtered = results
    .filter(r => !directOnly || r.direct)
    .sort((a, b) => {
      if (sort === 'value') return (b.value_ratio ?? 0) - (a.value_ratio ?? 0);
      return a.arb_price_usd - b.arb_price_usd;
    });

  const dateLabel = new Date(searchParams.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <div className="w-full max-w-3xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <button
          onClick={onBack}
          className="text-sm text-[#888888] hover:text-[#444444] transition flex items-center gap-1 shrink-0 pt-1"
        >
          ← New Search
        </button>
        <div className="text-center flex-1">
          <div className="font-hand font-bold text-2xl text-[#1A1A1A]">
            {cityFor(searchParams.from)} →→ {cityFor(searchParams.to)}
          </div>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <button
              onClick={() => onDateChange(shiftDate(searchParams.date, -1))}
              className="text-[#AAAAAA] hover:text-[#444444] transition text-base leading-none px-1"
              aria-label="Previous day"
            >‹</button>
            <span className="text-sm text-[#888888]">{dateLabel}</span>
            <button
              onClick={() => onDateChange(shiftDate(searchParams.date, +1))}
              className="text-[#AAAAAA] hover:text-[#444444] transition text-base leading-none px-1"
              aria-label="Next day"
            >›</button>
          </div>
        </div>
        <div className="text-sm text-[#AAAAAA] font-hand shrink-0 pt-1">
          {filtered.length} flights found
        </div>
      </div>

      <div className="border-b border-[#D4D0CB]" />

      {/* Sort + filter pills */}
      {!error && results.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { key: 'value' as SortKey, label: 'Best value' },
            { key: 'price' as SortKey, label: 'Cheapest first' },
          ]).map(s => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                sort === s.key
                  ? 'border-[#1A1A1A] font-semibold text-[#1A1A1A] underline underline-offset-2'
                  : 'border-[#D4D0CB] text-[#666666] hover:border-[#999999]'
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => setDirectOnly(v => !v)}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${
              directOnly
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white font-semibold'
                : 'border-[#D4D0CB] text-[#666666] hover:border-[#999999]'
            }`}
          >
            Nonstop only
          </button>
          <div className="ml-auto flex items-center gap-1 text-sm text-[#888888]">
            <FilterIcon /> Filters
          </div>
        </div>
      )}

      {/* Cabin fallback banner */}
      {cabinFallbackInfo && !error && (
        <div className="rounded-2xl px-5 py-3 text-sm flex items-start gap-2 border bg-[#FFF8F0] border-[#F0D9B5] text-[#8B6914]">
          <span className="mt-0.5 shrink-0">🪑</span>
          <span>{cabinFallbackInfo.message}</span>
        </div>
      )}

      {/* Flex-date banner */}
      {flexDateInfo && !error && (
        <div className={`rounded-2xl px-5 py-3 text-sm flex items-start gap-2 border ${
          flexDateInfo.reason === 'no_results_on_date'
            ? 'bg-[#FFF8F0] border-[#F0D9B5] text-[#8B6914]'
            : 'bg-[#F0F7FF] border-[#B5D4F0] text-[#1A4A7A]'
        }`}>
          <span className="mt-0.5 shrink-0">
            {flexDateInfo.reason === 'no_results_on_date' ? '📅' : '💡'}
          </span>
          <span>{flexDateInfo.message}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-white border border-[#D4D0CB] text-[#888888] rounded-2xl px-5 py-4 text-sm">
          {error}
        </div>
      )}

      {/* Summary */}
      {summary && !error && (
        <div className="bg-white border border-[#D4D0CB] rounded-2xl px-5 py-3 text-[#777777] text-sm">
          {summary}
        </div>
      )}

      {/* No results */}
      {!error && filtered.length === 0 && !flexLoading && (
        <div className="text-center text-[#BBBBBB] py-16 font-hand text-xl">
          No flights found.
        </div>
      )}

      {/* Cards */}
      {!error && filtered.length > 0 && (
        <div className="flex flex-col gap-4">
          {filtered.map((r, i) => (
            <FlightCard
              key={`${r.program}-${r.date}-${i}`}
              result={r}
              onBook={onBook}
              isBestDeal={i === 0 && sort === 'value'}
            />
          ))}
        </div>
      )}

      {/* Flex loading */}
      {flexLoading && (
        <div className="flex items-center gap-3 text-sm text-[#AAAAAA] py-2 px-1">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-[#CCCCCC] border-t-[#AAAAAA] rounded-full shrink-0" />
          Looking for better deals on nearby dates…
        </div>
      )}
    </div>
  );
}
