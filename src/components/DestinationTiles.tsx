import { useEffect, useState } from 'react';
import type { DiscoverTile, DiscoverResponse, TripSegment } from '../types';
import { airlineName } from '../utils/airlineLogo';

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
  onBook?: (tile: DiscoverTile) => void;
}

const DELAYS = ['0s', '1.8s', '3.3s'];

const todayUTC = new Date().toISOString().split('T')[0];
const tomorrowUTC = new Date(Date.now() + 86400000).toISOString().split('T')[0];

function pickTiles(data: DiscoverResponse, originCode: string): DiscoverTile[] {
  const all = (data.tiles ?? []).filter(t => t.date >= tomorrowUTC);
  const fromOrigin = originCode ? all.filter(t => t.origin_code === originCode) : [];
  const pool = fromOrigin.length >= 3 ? fromOrigin : all;
  return [...pool]
    .filter(t => t.availability_exists !== false)
    .sort((a, b) => (b.savings_usd ?? 0) - (a.savings_usd ?? 0))
    .slice(0, 3)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC',
  });
}

function parseCodes(airlines: string | string[] | null | undefined): string[] {
  if (!airlines) return [];
  if (Array.isArray(airlines)) return airlines.filter(Boolean);
  return String(airlines).split(/[,\s]+/).filter(Boolean);
}

function TileTimeline({ tile }: { tile: DiscoverTile }) {
  const segments: TripSegment[] = tile.segments ?? [];

  if (segments.length > 0) {
    return (
      <div className="flex flex-col">
        {segments.map((seg, idx) => (
          <div key={idx}>
            {/* Departure */}
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center pt-0.5 shrink-0">
                <div className="w-2 h-2 rounded-full border-2 border-[#aaaaaa] bg-white" />
                <div className="w-px bg-[#dddddd]" style={{ minHeight: 20 }} />
              </div>
              <div className="text-xs text-[#333333] font-semibold pb-0.5">
                {formatTime(seg.departs_at)}
                <span className="font-normal text-[#888888] ml-1">{seg.origin}</span>
              </div>
            </div>
            {/* Flight info */}
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center shrink-0" style={{ width: 8 }}>
                <div className="w-px bg-[#dddddd]" style={{ minHeight: 16 }} />
              </div>
              <div className="text-[10px] text-[#aaaaaa] pb-0.5">
                {seg.flight_number && <span>{seg.flight_number} · </span>}
                {airlineName(seg.airline_code)}
              </div>
            </div>
            {/* Arrival */}
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center pt-0.5 shrink-0">
                <div className="w-2 h-2 rounded-full border-2 border-[#aaaaaa] bg-white" />
                {idx < segments.length - 1 && <div className="w-px bg-[#dddddd]" style={{ minHeight: 16 }} />}
              </div>
              <div className="text-xs text-[#333333] font-semibold pb-0.5">
                {formatTime(seg.arrives_at)}
                <span className="font-normal text-[#888888] ml-1">{seg.destination}</span>
              </div>
            </div>
            {/* Layover */}
            {idx < segments.length - 1 && (
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center shrink-0" style={{ width: 8 }}>
                  <div className="w-px bg-[#dddddd]" style={{ minHeight: 14 }} />
                </div>
                <div className="text-[10px] text-[#bbbbbb] italic pb-0.5">Layover {seg.destination}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Fallback: no segments
  const departs = tile.departs_at;
  const arrives = tile.arrives_at;
  const airlines = parseCodes(tile.airlines as string | string[]);
  return (
    <div className="flex flex-col">
      {departs && (
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center pt-0.5 shrink-0">
            <div className="w-2 h-2 rounded-full border-2 border-[#aaaaaa] bg-white" />
            <div className="w-px bg-[#dddddd]" style={{ minHeight: 28 }} />
          </div>
          <div className="text-xs text-[#333333] font-semibold">
            {formatTime(departs)}
            <span className="font-normal text-[#888888] ml-1">{tile.origin_code}</span>
          </div>
        </div>
      )}
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-center shrink-0" style={{ width: 8 }}>
          <div className="w-px bg-[#dddddd]" style={{ minHeight: 16 }} />
        </div>
        <div className="text-[10px] text-[#aaaaaa] pb-0.5">{airlines.map(c => airlineName(c)).join(', ')}</div>
      </div>
      {arrives && (
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full border-2 border-[#aaaaaa] bg-white mt-0.5 shrink-0" />
          <div className="text-xs text-[#333333] font-semibold">
            {formatTime(arrives)}
            <span className="font-normal text-[#888888] ml-1">{tile.destination_code}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DestinationTiles({ originCode, onBook }: Props) {
  const [tiles, setTiles] = useState<DiscoverTile[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    const cacheKey = `discover2_${todayUTC}_${originCode}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setTiles(JSON.parse(cached)); return; } catch { /* fall through to fetch */ }
    }

    fetch(`${API_BASE}/api/discover?_=${todayUTC}`)
      .then(r => r.ok ? r.json() as Promise<DiscoverResponse> : Promise.reject())
      .then(data => {
        const top3 = pickTiles(data, originCode);
        localStorage.setItem(cacheKey, JSON.stringify(top3));
        // clean up yesterday's keys
        Object.keys(localStorage)
          .filter(k => k.startsWith('discover') && !k.startsWith(`discover2_${todayUTC}`))
          .forEach(k => localStorage.removeItem(k));
        setTiles(top3);
      })
      .catch(() => {});
  }, [originCode]);

  if (tiles.length === 0) return null;

  return (
    <div className="flex gap-4 w-full justify-center items-start">
      {tiles.map((tile, i) => {
        const dealPrice = tile.arb_miles_cost_promo_usd ?? tile.buy_promo_usd ?? 0;
        const isExpanded = expandedIdx === i;
        return (
          <div
            key={`${tile.origin_code}-${tile.destination_code}-${i}`}
            className={`bg-white rounded-2xl border overflow-hidden shadow-sm flex flex-col w-72 shrink-0 transition-shadow cursor-pointer hover:shadow-md ${isExpanded ? 'border-[#3DB551]' : 'border-[#D4D0CB]'} ${!isExpanded ? 'tile-wobble' : ''}`}
            style={!isExpanded ? { animationDelay: DELAYS[i] } : undefined}
            onClick={() => setExpandedIdx(isExpanded ? null : i)}
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

              {/* Expanded: dot timeline + Book */}
              {isExpanded && (
                <div className="mt-2 flex flex-col gap-3 border-t border-[#EEEEEE] pt-3">
                  <TileTimeline tile={tile} />
                  {onBook && (
                    <button
                      onClick={e => { e.stopPropagation(); onBook(tile); }}
                      className="w-full bg-[#3DB551] hover:bg-[#35A348] text-white font-hand font-bold text-base py-1.5 rounded-xl transition"
                    >
                      Book
                    </button>
                  )}
                </div>
              )}
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
