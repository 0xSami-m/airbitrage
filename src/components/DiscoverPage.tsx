import { useEffect, useState } from 'react';
import type { DiscoverTile, DiscoverResponse, TripSegment } from '../types';
import { airlineLogoUrl, airlineName } from '../utils/airlineLogo';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8787';

const CABIN_LABELS: Record<string, string> = {
  economy: 'Economy',
  premium: 'Prem. Economy',
  business: 'Business',
  first: 'First',
};

function formatMiles(n: number) {
  return n.toLocaleString();
}

function formatUSD(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

// airlines comes back as either a string ("LX, AC") or a list (["LX","AC"])
function parseCodes(airlines: string | string[] | null | undefined): string[] {
  if (!airlines) return [];
  if (Array.isArray(airlines)) return airlines.filter(Boolean);
  return String(airlines).split(/[,\s]+/).filter(Boolean);
}

const CABIN_BADGE: Record<string, string> = {
  first:    'bg-[#b8973a] text-white font-bold px-2 py-0.5 rounded text-xs',
  business: 'bg-[#666666] text-white font-semibold px-2 py-0.5 rounded text-xs',
  premium:  'bg-[#999999] text-white px-2 py-0.5 rounded text-xs',
  economy:  'text-[#aaaaaa] text-xs',
};

// Common connecting-airport city names for expanded timeline display
const AIRPORT_CITIES: Record<string, string> = {
  // North America
  ATL: 'Atlanta', ORD: 'Chicago', DFW: 'Dallas', DEN: 'Denver',
  LAX: 'Los Angeles', JFK: 'New York', EWR: 'Newark', LGA: 'New York',
  SFO: 'San Francisco', SEA: 'Seattle', MIA: 'Miami', BOS: 'Boston',
  IAD: 'Washington', DCA: 'Washington', PHX: 'Phoenix', MSP: 'Minneapolis',
  DTW: 'Detroit', CLT: 'Charlotte', PHL: 'Philadelphia', LAS: 'Las Vegas',
  YYZ: 'Toronto', YVR: 'Vancouver', YUL: 'Montreal', YYC: 'Calgary',
  MEX: 'Mexico City', CUN: 'Cancun',
  // Europe
  LHR: 'London', LGW: 'London', STN: 'London', LCY: 'London',
  CDG: 'Paris', ORY: 'Paris', AMS: 'Amsterdam', FRA: 'Frankfurt',
  MUC: 'Munich', ZRH: 'Zurich', VIE: 'Vienna', BRU: 'Brussels',
  MAD: 'Madrid', BCN: 'Barcelona', FCO: 'Rome', MXP: 'Milan',
  LIN: 'Milan', CPH: 'Copenhagen', ARN: 'Stockholm', HEL: 'Helsinki',
  OSL: 'Oslo', LIS: 'Lisbon', ATH: 'Athens', WAW: 'Warsaw',
  // Middle East
  DXB: 'Dubai', AUH: 'Abu Dhabi', DOH: 'Doha', IST: 'Istanbul',
  // Asia Pacific
  SIN: 'Singapore', HKG: 'Hong Kong', NRT: 'Tokyo', HND: 'Tokyo',
  ICN: 'Seoul', PVG: 'Shanghai', PEK: 'Beijing', BKK: 'Bangkok',
  KUL: 'Kuala Lumpur', SYD: 'Sydney', MEL: 'Melbourne',
  // Africa
  JNB: 'Johannesburg', NBO: 'Nairobi', ADD: 'Addis Ababa', CAI: 'Cairo',
};

function cityLabel(code: string, cityMap: Record<string, string>) {
  const city = cityMap[code] ?? AIRPORT_CITIES[code];
  return city ? `${city} (${code})` : code;
}

// If appa sends the airport code as the city name, substitute a friendly name
function normalizeCity(city: string, code: string) {
  if (city === code || /^[A-Z]{3}$/.test(city)) {
    return AIRPORT_CITIES[code] ?? city;
  }
  return city;
}

function formatLocalTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC',
  });
}

function segmentDuration(seg: TripSegment) {
  // Prefer appa-provided duration to avoid cross-timezone calculation errors
  const mins = seg.duration_min
    ?? Math.round((new Date(seg.arrives_at).getTime() - new Date(seg.departs_at).getTime()) / 60000);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ''}`;
}

function layoverDuration(prev: TripSegment, next: TripSegment) {
  const mins = Math.round((new Date(next.departs_at).getTime() - new Date(prev.arrives_at).getTime()) / 60000);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ''}`;
}

function SegmentTimeline({
  segments, cabin, cityMap,
}: {
  segments: TripSegment[];
  cabin: string;
  cityMap: Record<string, string>;
}) {
  return (
    <div>
      {segments.map((seg, idx) => (
        <div key={idx}>
          {/* Departure of this segment */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-[#aaaaaa] bg-white" />
              <div className="w-px flex-1 bg-[#dddddd] my-1" style={{ minHeight: 36 }} />
            </div>
            <div className="pb-1">
              <div className="text-sm font-semibold text-[#333333]">
                {formatLocalTime(seg.departs_at)}
                <span className="font-normal text-[#555555] ml-2">{cityLabel(seg.origin, cityMap)}</span>
              </div>
            </div>
          </div>

          {/* Flight details */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0" style={{ width: 10 }}>
              <div className="w-px flex-1 bg-[#dddddd]" style={{ minHeight: 24 }} />
            </div>
            <div className="text-xs text-[#999999] pb-1 flex flex-wrap gap-x-2 gap-y-0.5">
              {seg.flight_number && <span>{seg.flight_number}</span>}
              <span>·</span>
              <span>{airlineName(seg.airline_code)}</span>
              {cabin && <><span>·</span><span>{CABIN_LABELS[cabin] ?? cabin} Class</span></>}
              {seg.aircraft_name && <><span>·</span><span>{seg.aircraft_name}</span></>}
              {(() => { const d = segmentDuration(seg); return d ? <><span>·</span><span>{d}</span></> : null; })()}
            </div>
          </div>

          {/* Arrival of this segment */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-[#aaaaaa] bg-white" />
              {idx < segments.length - 1 && (
                <div className="w-px flex-1 bg-[#dddddd] my-1" style={{ minHeight: 24 }} />
              )}
            </div>
            <div className="pb-1">
              <div className="text-sm font-semibold text-[#333333]">
                {formatLocalTime(seg.arrives_at)}
                <span className="font-normal text-[#555555] ml-2">{cityLabel(seg.destination, cityMap)}</span>
              </div>
            </div>
          </div>

          {/* Layover between segments */}
          {idx < segments.length - 1 && (() => {
            const layover = layoverDuration(seg, segments[idx + 1]);
            return (
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0" style={{ width: 10 }}>
                  <div className="w-px flex-1 bg-[#dddddd]" style={{ minHeight: 28 }} />
                </div>
                <div className="text-xs text-[#bbbbbb] italic pb-1 ml-1">
                  Layover {cityLabel(seg.destination, cityMap)}{layover ? ` · ${layover}` : ''}
                </div>
              </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

function FallbackTimeline({ tile, airlineCodes }: { tile: DiscoverTile; airlineCodes: string[] }) {
  const cityMap = {
    [tile.origin_code]: normalizeCity(tile.origin_city, tile.origin_code),
    [tile.destination_code]: normalizeCity(tile.destination_city, tile.destination_code),
  };
  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center pt-1 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-[#aaaaaa] bg-white" />
          <div className="w-px flex-1 bg-[#dddddd] my-1" style={{ minHeight: 36 }} />
        </div>
        <div className="pb-2">
          <div className="text-sm font-semibold text-[#333333]">
            {tile.departs_at ? formatLocalTime(tile.departs_at) : '—'}
            <span className="font-normal text-[#555555] ml-2">
              {cityLabel(tile.origin_code, cityMap)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center shrink-0" style={{ width: 10 }}>
          <div className="w-px flex-1 bg-[#dddddd]" style={{ minHeight: 28 }} />
        </div>
        <div className="text-xs text-[#999999] pb-2 flex flex-wrap gap-x-2 gap-y-0.5">
          {airlineCodes.map(c => airlineName(c)).join(' · ')}
          {tile.cabin && (
            <><span>·</span><span>{CABIN_LABELS[tile.cabin] ?? tile.cabin} Class</span></>
          )}
          {tile.aircraft_name && (
            <><span>·</span><span>{tile.aircraft_name}</span></>
          )}
          {tile.departs_at && tile.arrives_at && (() => {
            const mins = Math.round((new Date(tile.arrives_at).getTime() - new Date(tile.departs_at).getTime()) / 60000);
            if (mins > 0) {
              const h = Math.floor(mins / 60), m = mins % 60;
              return <><span>·</span><span>Travel time: {h}h{m > 0 ? ` ${m}m` : ''}</span></>;
            }
            return null;
          })()}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center pt-1 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-[#aaaaaa] bg-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#333333]">
            {tile.arrives_at ? formatLocalTime(tile.arrives_at) : '—'}
            <span className="font-normal text-[#555555] ml-2">
              {cityLabel(tile.destination_code, cityMap)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ tile }: { tile: DiscoverTile }) {
  const [expanded, setExpanded] = useState(false);
  const dimmed = !tile.availability_exists;
  const airlineCodes = parseCodes(tile.airlines as string | string[]);
  const promoCost = tile.arb_miles_cost_promo_usd ?? tile.buy_promo_usd;
  const cabinBadge = CABIN_BADGE[tile.cabin] ?? 'text-[#aaaaaa] text-xs';
  const cityMap = {
    [tile.origin_code]: normalizeCity(tile.origin_city, tile.origin_code),
    [tile.destination_code]: normalizeCity(tile.destination_city, tile.destination_code),
  };

  return (
    <div className={`bg-white rounded-xl border border-[#dddddd] overflow-hidden transition hover:shadow-sm ${dimmed ? 'opacity-50' : ''}`}>

      {/* ── Main row ── */}
      <div className="flex items-center gap-4 px-5 py-4">

        {/* Logos — fixed width, far left, max 2 */}
        <div className="flex items-center gap-2 shrink-0 w-[72px]">
          {airlineCodes.length > 0
            ? airlineCodes.slice(0, 2).map(code => (
                <img
                  key={code}
                  src={airlineLogoUrl(code)}
                  alt={code}
                  title={airlineName(code)}
                  className="w-8 h-8 rounded object-contain bg-white"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              ))
            : <div className="w-8 h-8" />}
        </div>

        {/* Route — fixed width */}
        <div className="w-[200px] shrink-0">
          <div className="flex items-center gap-1.5 text-base font-bold text-[#444444]">
            <span>{normalizeCity(tile.origin_city, tile.origin_code)}</span>
            <span className="text-[#cccccc] text-xs font-normal">→</span>
            <span>{normalizeCity(tile.destination_city, tile.destination_code)}</span>
          </div>
        </div>

        {/* Region — fixed width */}
        <div className="w-[90px] shrink-0">
          <span className="hidden sm:inline-block text-xs bg-[#f5f5f5] text-[#888888] px-2 py-0.5 rounded-full font-medium">
            {tile.region}
          </span>
        </div>

        {/* Date · Cabin · Seats — fixed width */}
        <div className="w-[180px] shrink-0 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#aaaaaa]">{tile.date ? formatDate(tile.date) : '—'}</span>
          <span className="text-[#dddddd] text-xs">·</span>
          <span className={cabinBadge}>{CABIN_LABELS[tile.cabin] ?? tile.cabin}</span>
          {tile.remaining_seats > 0 && tile.remaining_seats <= 3 && (
            <>
              <span className="text-[#dddddd] text-xs">·</span>
              <span className="text-xs text-[#999999] font-semibold">{tile.remaining_seats} left</span>
            </>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pricing — fixed width */}
        <div className="flex flex-col items-end shrink-0 w-[110px]">
          {promoCost != null && promoCost > 0 ? (
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-[#4a7a4a]">${formatUSD(promoCost)}</span>
              <span className="text-xs text-[#4a7a4a]">promo</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-[#555555]">{formatMiles(tile.miles)}</span>
              <span className="text-xs text-[#aaaaaa]">mi</span>
            </div>
          )}
          {tile.savings_usd > 0 && (
            <div className="text-xs text-[#4a7a4a] font-medium">Save ~${formatUSD(tile.savings_usd)}</div>
          )}
        </div>

        {/* Expand button */}
        <div className="shrink-0">
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs text-[#aaaaaa] hover:text-[#777777] border border-[#eeeeee] hover:border-[#cccccc] rounded-lg px-3 py-1.5 transition"
          >
            {expanded ? 'Collapse ↑' : 'Expand ↓'}
          </button>
        </div>
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="border-t border-[#f0f0f0] bg-[#fafafa] px-8 py-5 flex gap-10">

          {/* Left: itinerary timeline */}
          <div className="flex-1 min-w-0">
            {tile.segments && tile.segments.length > 0
              ? <SegmentTimeline segments={tile.segments} cabin={tile.cabin} cityMap={cityMap} />
              : <FallbackTimeline tile={tile} airlineCodes={airlineCodes} />
            }
          </div>

          {/* Right: pricing summary */}
          <div className="flex flex-col gap-1.5 shrink-0 text-right">
            {tile.cash_fare_usd > 0 && (
              <div className="text-sm text-[#bbbbbb] line-through">~${formatUSD(tile.cash_fare_usd)} cash</div>
            )}
            <div className="text-sm text-[#555555] font-medium">
              {formatMiles(tile.miles)} miles
              {tile.taxes_usd > 0 && (
                <span className="text-[#aaaaaa] font-normal"> + ${tile.taxes_usd.toFixed(0)} taxes</span>
              )}
            </div>
            <div className="text-xs text-[#aaaaaa]">{tile.program_name}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DiscoverRows() {
  const [tiles, setTiles] = useState<DiscoverTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/discover?_=${Date.now()}`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<DiscoverResponse>;
      })
      .then(data => setTiles(data.tiles))
      .catch(() => setError('Could not load discover tiles. Make sure the server is running.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-[#444444]">Our Best Finds</h2>
        <p className="text-sm text-[#aaaaaa] mt-1">Live availability across all programs</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-[#aaaaaa] py-4">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-[#cccccc] border-t-transparent rounded-full" />
          Loading destinations...
        </div>
      )}

      {error && (
        <div className="bg-white border border-[#dddddd] text-[#888888] rounded-xl px-5 py-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && tiles.length === 0 && (
        <div className="text-sm text-[#bbbbbb] py-4">No destinations returned.</div>
      )}

      {tiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {tiles.map((tile, i) => (
            <Row key={`${tile.origin_code}-${tile.destination_code}-${i}`} tile={tile} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10">
      <DiscoverRows />
    </div>
  );
}
