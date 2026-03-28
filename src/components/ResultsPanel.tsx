import type { FlightResult, SearchParams, Trip } from '../types';
import FlightCard from './FlightCard';
import { useState } from 'react';

interface Props {
  results: FlightResult[];
  summary: string;
  error: string;
  searchParams: SearchParams;
  flexLoading?: boolean;
  onBack: () => void;
  onBook: (result: FlightResult, trip: Trip) => void;
}

type SortKey = 'miles' | 'taxes' | 'total' | 'value';

export default function ResultsPanel({ results, summary, error, searchParams, flexLoading, onBack, onBook }: Props) {
  const [sort, setSort] = useState<SortKey>('miles');
  const [directOnly, setDirectOnly] = useState(false);

  const filtered = results
    .filter(r => !directOnly || r.direct)
    .sort((a, b) => {
      if (sort === 'miles') return a.miles - b.miles;
      if (sort === 'taxes') return a.taxes_usd - b.taxes_usd;
      if (sort === 'value') return (b.value_ratio ?? 0) - (a.value_ratio ?? 0);
      return a.arb_price_usd - b.arb_price_usd;
    });

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-[#aaaaaa] hover:text-[#777777] transition text-sm flex items-center gap-1"
        >
          ← New Search
        </button>
        <div className="text-[#555555] font-semibold text-lg">
          {searchParams.from} → {searchParams.to}
          <span className="text-[#aaaaaa] font-normal text-sm ml-3">
            {new Date(searchParams.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
            })}
          </span>
        </div>
        <div className="ml-auto text-[#aaaaaa] text-sm">{filtered.length} results</div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-white border border-[#dddddd] text-[#888888] rounded-xl px-5 py-4 text-sm">
          {error}
        </div>
      )}

      {/* Summary */}
      {summary && !error && (
        <div className="bg-white border border-[#dddddd] rounded-xl px-5 py-3 text-[#777777] text-sm">
          {summary}
        </div>
      )}

      {/* Filters & Sort */}
      {!error && results.length > 0 && (
        <div className="bg-white border border-[#dddddd] rounded-xl p-4 flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setDirectOnly(v => !v)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              directOnly
                ? 'bg-[#aaaaaa] text-white'
                : 'bg-[#f5f5f5] text-[#aaaaaa] hover:bg-[#dddddd]'
            }`}
          >
            Nonstop only
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[#aaaaaa] text-sm font-medium">Sort:</span>
            {(['miles', 'taxes', 'total', 'value'] as SortKey[]).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition ${
                  sort === s
                    ? 'bg-[#aaaaaa] text-white'
                    : 'bg-[#f5f5f5] text-[#aaaaaa] hover:bg-[#dddddd]'
                }`}
              >
                {s === 'total' ? 'Total $' : s === 'value' ? 'Best Value' : s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cards */}
      {!error && filtered.length === 0 && (
        <div className="text-center text-[#bbbbbb] py-16">
          No results found.
        </div>
      )}

      {!error && filtered.length > 0 && (
        <div className="flex flex-col gap-4">
          {filtered.map((r, i) => (
            <FlightCard key={`${r.program}-${r.date}-${i}`} result={r} onBook={onBook} />
          ))}
        </div>
      )}

      {/* Flex date loading indicator */}
      {flexLoading && (
        <div className="flex items-center gap-3 text-sm text-[#aaaaaa] py-2 px-1">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-[#cccccc] border-t-[#aaaaaa] rounded-full shrink-0" />
          Looking for better deals nearby dates…
        </div>
      )}
    </div>
  );
}
