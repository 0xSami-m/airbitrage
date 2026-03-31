import { useEffect, useState } from 'react';
import type { DiscoverTile, DiscoverResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8787';

const CABIN_LABELS: Record<string, string> = {
  economy: 'Economy', premium: 'Prem. Economy', business: 'Business Class', first: 'First Class',
};

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

function formatUSD(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

interface Props {
  originCode: string; // e.g. "BOS" — if empty, show any top deals
}

const DELAYS = ['0s', '1.8s', '3.3s'];

export default function DestinationTiles({ originCode }: Props) {
  const [tiles, setTiles] = useState<DiscoverTile[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/discover?_=${Date.now()}`)
      .then(r => r.ok ? r.json() as Promise<DiscoverResponse> : Promise.reject())
      .then(data => {
        const all = data.tiles ?? [];
        // prefer tiles from user's origin; fall back to all
        const fromOrigin = originCode
          ? all.filter(t => t.origin_code === originCode)
          : [];
        const pool = fromOrigin.length >= 3 ? fromOrigin : all;
        // pick top 3 by savings
        const top3 = [...pool]
          .filter(t => t.availability_exists && t.cash_fare_usd > 0)
          .sort((a, b) => (b.savings_usd ?? 0) - (a.savings_usd ?? 0))
          .slice(0, 3);
        setTiles(top3);
      })
      .catch(() => {});
  }, [originCode]);

  if (tiles.length === 0) return null;

  return (
    <div className="flex gap-4 w-full justify-center">
      {tiles.map((tile, i) => {
        const dealPrice = tile.arb_miles_cost_promo_usd ?? tile.buy_promo_usd ?? 0;
        return (
          <div
            key={`${tile.origin_code}-${tile.destination_code}-${i}`}
            className="tile-wobble bg-white rounded-2xl border border-[#D4D0CB] overflow-hidden shadow-sm flex flex-col w-56 shrink-0 cursor-pointer hover:shadow-md transition-shadow"
            style={{ animationDelay: DELAYS[i] }}
          >
            {/* Card top */}
            <div className="p-4 flex flex-col gap-2 flex-1">
              {/* Route */}
              <div className="flex items-center gap-1">
                <div>
                  <div className="font-hand font-bold text-xl text-[#1A1A1A] leading-tight">{tile.origin_city}</div>
                  <div className="text-xs text-[#888888]">{tile.origin_code}</div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[#CCCCCC] text-sm">✈</span>
                </div>
                <div className="text-right">
                  <div className="font-hand font-bold text-xl text-[#1A1A1A] leading-tight">{tile.destination_city}</div>
                  <div className="text-xs text-[#888888]">{tile.destination_code}</div>
                </div>
              </div>

              {/* Date + cabin */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[#888888]">{formatDate(tile.date)}</span>
                <span className="bg-[#333333] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  {CABIN_LABELS[tile.cabin] ?? tile.cabin}
                </span>
              </div>
            </div>

            {/* Green price section */}
            <div className="bg-[#3DB551] px-4 py-3">
              <div className="flex items-baseline gap-2">
                {tile.cash_fare_usd > 0 && (
                  <span className="text-sm line-through text-white opacity-60">
                    ${formatUSD(tile.cash_fare_usd)}
                  </span>
                )}
                <span className="font-hand font-bold text-2xl text-white">
                  ${formatUSD(dealPrice || tile.cash_fare_usd - (tile.savings_usd ?? 0))}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
