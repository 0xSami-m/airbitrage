import { useState } from 'react';
import type { FlightResult, Trip, TripsResponse } from '../types';
import { airlineLogoUrl } from '../utils/airlineLogo';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8787';

interface Props {
  result: FlightResult;
  mockTrips?: Trip[];
  onBook?: (result: FlightResult, trip: Trip) => void;
}

const CABIN_COLORS: Record<string, string> = {
  economy: 'bg-[#f5f5f5] text-[#888888]',
  premium: 'bg-[#eeeae4] text-[#777777]',
  business: 'bg-[#e8e4de] text-[#666666]',
  first: 'bg-[#dddad4] text-[#555555]',
};

const CABIN_LABELS: Record<string, string> = {
  economy: 'Economy',
  premium: 'Prem. Economy',
  business: 'Business',
  first: 'First',
};

const AIRPORT_CITIES: Record<string, string> = {
  ATL: 'Atlanta', ORD: 'Chicago', DFW: 'Dallas', DEN: 'Denver',
  LAX: 'Los Angeles', JFK: 'New York', EWR: 'Newark', LGA: 'New York',
  SFO: 'San Francisco', SEA: 'Seattle', MIA: 'Miami', BOS: 'Boston',
  IAD: 'Washington', DCA: 'Washington', PHX: 'Phoenix', MSP: 'Minneapolis',
  DTW: 'Detroit', CLT: 'Charlotte', PHL: 'Philadelphia', LAS: 'Las Vegas',
  YYZ: 'Toronto', YVR: 'Vancouver', YUL: 'Montreal', MEX: 'Mexico City',
  CUN: 'Cancun', LHR: 'London', LGW: 'London', CDG: 'Paris', ORY: 'Paris',
  AMS: 'Amsterdam', FRA: 'Frankfurt', MUC: 'Munich', ZRH: 'Zurich',
  VIE: 'Vienna', BRU: 'Brussels', MAD: 'Madrid', BCN: 'Barcelona',
  FCO: 'Rome', MXP: 'Milan', CPH: 'Copenhagen', ARN: 'Stockholm',
  HEL: 'Helsinki', OSL: 'Oslo', LIS: 'Lisbon', ATH: 'Athens',
  DXB: 'Dubai', AUH: 'Abu Dhabi', DOH: 'Doha', IST: 'Istanbul',
  RUH: 'Riyadh', SIN: 'Singapore', HKG: 'Hong Kong', NRT: 'Tokyo',
  HND: 'Tokyo', ICN: 'Seoul', PVG: 'Shanghai', PEK: 'Beijing',
  BKK: 'Bangkok', KUL: 'Kuala Lumpur', SYD: 'Sydney', MEL: 'Melbourne',
  JNB: 'Johannesburg', NBO: 'Nairobi', CAI: 'Cairo',
};

function cityLabel(code: string) {
  const city = AIRPORT_CITIES[code];
  return city ? `${city} (${code})` : code;
}

function segmentDuration(departs: string, arrives: string) {
  const mins = Math.round((new Date(arrives).getTime() - new Date(departs).getTime()) / 60000);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ''}`;
}

function layoverDuration(prevArrives: string, nextDeparts: string) {
  const mins = Math.round((new Date(nextDeparts).getTime() - new Date(prevArrives).getTime()) / 60000);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ''}`;
}

function formatMiles(n: number) {
  return n.toLocaleString();
}

function formatUSD(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatTime(iso: string) {
  // Parse as UTC, display time only
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC',
  });
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Fallback SVG plane shown when an image URL fails to load
const PLANE_FALLBACK = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23aaaaaa" stroke-width="1.5"><path d="M22 16.5H2l4-8h12l4 8z"/><path d="M12 2v6"/></svg>'
)}`;

interface LogoProps {
  src: string;
  alt: string;
  size: number;        // px
  initials?: string;   // shown as circle fallback if src is empty
}

function Logo({ src, alt, size, initials }: LogoProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return initials ? (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-[#bbbbbb] flex items-center justify-center text-white text-xs font-bold shrink-0"
      >
        {initials.slice(0, 2).toUpperCase()}
      </div>
    ) : (
      <img src={PLANE_FALLBACK} alt={alt} style={{ width: size, height: size }} className="shrink-0 opacity-50" />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: size, height: size }}
      className="rounded object-contain shrink-0 bg-white"
      onError={() => { console.warn('[Logo] failed to load:', src); setFailed(true); }}
    />
  );
}

function ValueBadge({ ratio }: { ratio: number | null }) {
  if (ratio == null) return null;
  const color =
    ratio >= 2.5 ? 'bg-[#d4ead4] text-[#4a7a4a]' :
    ratio >= 1.5 ? 'bg-[#eeeae4] text-[#666666]' :
                   'bg-[#f5f5f5] text-[#aaaaaa]';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {ratio.toFixed(1)}x value
    </span>
  );
}

function TripTimeline({ trip }: { trip: Trip }) {
  return (
    <>
      {trip.segments.map((seg, idx) => (
        <div key={idx}>
          {/* Departure */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-[#aaaaaa] bg-white" />
              <div className="w-px flex-1 bg-[#dddddd] my-1" style={{ minHeight: 36 }} />
            </div>
            <div className="pb-1">
              <div className="text-sm font-semibold text-[#333333]">
                {formatTime(seg.departs_at)}
                <span className="font-normal text-[#555555] ml-2">{cityLabel(seg.origin)}</span>
              </div>
            </div>
          </div>

          {/* Flight details */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0" style={{ width: 10 }}>
              <div className="w-px flex-1 bg-[#dddddd]" style={{ minHeight: 24 }} />
            </div>
            <div className="text-xs text-[#999999] pb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 ml-1">
              {seg.flight_number && <span>{seg.flight_number}</span>}
              <span>·</span>
              <Logo src={airlineLogoUrl(seg.airline_code) || seg.airline_logo} alt={seg.airline_code} size={14} />
              <span>{seg.airline_code}</span>
              {seg.aircraft_name && <><span>·</span><span>{seg.aircraft_name}</span></>}
              {seg.fare_class && <><span>·</span><span>Class {seg.fare_class}</span></>}
              {(() => { const d = segmentDuration(seg.departs_at, seg.arrives_at); return d ? <><span>·</span><span>{d}</span></> : null; })()}
            </div>
          </div>

          {/* Arrival */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-[#aaaaaa] bg-white" />
              {idx < trip.segments.length - 1 && (
                <div className="w-px flex-1 bg-[#dddddd] my-1" style={{ minHeight: 24 }} />
              )}
            </div>
            <div className="pb-1">
              <div className="text-sm font-semibold text-[#333333]">
                {formatTime(seg.arrives_at)}
                <span className="font-normal text-[#555555] ml-2">{cityLabel(seg.destination)}</span>
              </div>
            </div>
          </div>

          {/* Layover */}
          {idx < trip.segments.length - 1 && (() => {
            const layover = layoverDuration(seg.arrives_at, trip.segments[idx + 1].departs_at);
            return (
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0" style={{ width: 10 }}>
                  <div className="w-px flex-1 bg-[#dddddd]" style={{ minHeight: 28 }} />
                </div>
                <div className="text-xs text-[#bbbbbb] italic pb-1 ml-1">
                  Layover {cityLabel(seg.destination)}{layover ? ` · ${layover}` : ''}
                </div>
              </div>
            );
          })()}
        </div>
      ))}
    </>
  );
}

function TripRow({ trip }: { trip: Trip }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-[#eeeeee] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fafafa] transition"
      >
        <span className="text-sm font-semibold text-[#555555] w-16 shrink-0">
          {trip.flight_numbers}
        </span>
        <span className="text-sm text-[#555555]">{formatTime(trip.departs_at)}</span>
        <span className="text-[#cccccc] text-xs">→</span>
        <span className="text-sm text-[#555555]">{formatTime(trip.arrives_at)}</span>
        <span className="text-xs text-[#aaaaaa] ml-1">{formatDuration(trip.total_duration_min)}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ml-1 ${
          trip.stops === 0 ? 'bg-[#d4ead4] text-[#4a7a4a]' : 'bg-[#f5f5f5] text-[#aaaaaa]'
        }`}>
          {trip.stops === 0 ? 'Nonstop' : `${trip.stops} stop${trip.stops > 1 ? 's' : ''}`}
        </span>
        {trip.remaining_seats <= 3 && (
          <span className="text-xs text-[#999999] font-semibold ml-auto shrink-0">
            {trip.remaining_seats} left
          </span>
        )}
        <span className={`ml-auto text-[#aaaaaa] text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {expanded && (
        <div className="border-t border-[#f0f0f0] bg-[#fafafa] px-8 py-5">
          <TripTimeline trip={trip} />
        </div>
      )}
    </div>
  );
}

export default function FlightCard({ result, mockTrips, onBook }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState('');
  const [bookLoading, setBookLoading] = useState(false);

  const cabinColor = CABIN_COLORS[result.cabin] ?? 'bg-[#f5f5f5] text-[#888888]';
  const cabinLabel = CABIN_LABELS[result.cabin] ?? result.cabin;

  const handleToggle = async () => {
    if (expanded) { setExpanded(false); setAllOpen(false); return; }
    setExpanded(true);
    if (trips !== null) return; // already loaded

    // Use mock data if provided (dev/test mode)
    if (mockTrips) { setTrips(mockTrips); return; }

    setTripsLoading(true);
    setTripsError('');
    try {
      const primaryCarrier = result.airlines.split(/[,\s]+/)[0];

      const fetchTrips = async (withCarrier: boolean) => {
        const params = new URLSearchParams();
        if (result.direct) params.set('direct_only', 'true');
        if (withCarrier && primaryCarrier) params.set('carriers', primaryCarrier);
        const res = await fetch(`${API_BASE}/api/trips/${result.availability_id}?${params}`);
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json() as Promise<TripsResponse>;
      };

      let data = await fetchTrips(true);
      // If carrier-filtered request returns nothing, retry without the filter
      if (data.trips.length === 0 && primaryCarrier) {
        data = await fetchTrips(false);
      }

      const seen = new Set<string>();
      const deduped = data.trips.filter(t => {
        const key = `${t.flight_numbers}|${t.departs_at}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setTrips(deduped);
    } catch {
      setTripsError('Could not load itineraries.');
    } finally {
      setTripsLoading(false);
    }
  };

  const handleBook = async () => {
    if (!onBook) return;
    if (trips && trips.length > 0) { onBook(result, trips[0]); return; }
    setBookLoading(true);
    try {
      const primaryCarrier = result.airlines.split(/[,\s]+/)[0];
      const fetchTrips = async (withCarrier: boolean) => {
        const params = new URLSearchParams();
        if (result.direct) params.set('direct_only', 'true');
        if (withCarrier && primaryCarrier) params.set('carriers', primaryCarrier);
        const res = await fetch(`${API_BASE}/api/trips/${result.availability_id}?${params}`);
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json() as Promise<TripsResponse>;
      };
      let data = await fetchTrips(true);
      if (data.trips.length === 0 && primaryCarrier) data = await fetchTrips(false);
      const seen = new Set<string>();
      const deduped = data.trips.filter(t => {
        const key = `${t.flight_numbers}|${t.departs_at}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (mockTrips) { setTrips(mockTrips); onBook(result, mockTrips[0]); }
      else if (deduped.length > 0) { setTrips(deduped); onBook(result, deduped[0]); }
    } catch { /* ignore */ }
    setBookLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-[#dddddd] overflow-hidden">
      <div className="p-6 flex flex-col gap-4">

        {/* Top row: pricing + cabin badge */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            {/* Cash — real Google Flights price, struck through */}
            {result.cash_price_usd != null && (
              <div className="flex items-baseline gap-2">
                <span className="text-xl text-[#bbbbbb] line-through">
                  ${formatUSD(result.cash_price_usd)}
                </span>
                {result.google_flights_url && (
                  <a
                    href={result.google_flights_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#aaaaaa] hover:text-[#777777] transition"
                  >
                    Check Google Flights →
                  </a>
                )}
              </div>
            )}
            {/* Promo — headline "sale" price */}
            {result.arb_price_promo_usd ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-[#4a7a4a]">
                  ${formatUSD(result.arb_price_promo_usd)}
                </span>
                <span className="text-sm text-[#4a7a4a]">at promo rate</span>
              </div>
            ) : (
              <div className="text-3xl font-bold text-[#555555]">
                {formatMiles(result.miles)}
                <span className="text-base font-normal text-[#aaaaaa] ml-1">miles</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {result.alt_date && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#fff3cd] text-[#856404]">
                {formatDate(result.date)} ✦ flex date
              </span>
            )}
            <ValueBadge ratio={result.value_ratio} />
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cabinColor}`}>
              {cabinLabel}
            </span>
          </div>
        </div>

        {/* Flight route */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#444444]">{result.origin}</div>
            <div className="text-xs text-[#aaaaaa] mt-0.5">{formatDate(result.date)}</div>
          </div>

          <div className="flex-1 mx-4 flex flex-col items-center gap-1">
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-[#dddddd]" />
              {result.direct ? (
                <div className="text-xs bg-[#d4ead4] text-[#4a7a4a] px-2 py-0.5 rounded-full whitespace-nowrap">
                  Nonstop
                </div>
              ) : (
                <div className="text-xs bg-[#f5f5f5] text-[#aaaaaa] px-2 py-0.5 rounded-full whitespace-nowrap">
                  Connecting
                </div>
              )}
              <div className="flex-1 h-px bg-[#dddddd]" />
            </div>
            <div className="flex items-center justify-center gap-1.5">
            {(() => {
              const codes = result.airlines.split(/[,\s]+/).filter(Boolean);
              return codes.map(code => {
                const logoUrl = airlineLogoUrl(code) || result.carrier_logos?.[code] || '';
                return logoUrl ? (
                  <Logo key={code} src={logoUrl} alt={code} size={16} />
                ) : null;
              });
            })()}
          </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-[#444444]">{result.destination}</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {result.remaining_seats > 0 && result.remaining_seats <= 3 && (
            <div className="text-xs text-[#999999] font-semibold">
              Only {result.remaining_seats} left!
            </div>
          )}
          {onBook && (
            <button
              onClick={handleBook}
              disabled={bookLoading}
              className="bg-[#555555] hover:bg-[#444444] disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition"
            >
              {bookLoading ? 'Loading...' : 'Book'}
            </button>
          )}
        </div>
      </div>

      {/* Expand arrow */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-center py-2 border-t border-[#eeeeee] text-[#cccccc] hover:text-[#aaaaaa] hover:bg-[#fafafa] transition"
      >
        <span className={`text-base transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* First itinerary inline + more button */}
      {expanded && (
        <div className="border-t border-[#f0f0f0] bg-[#fafafa] px-8 py-5 flex flex-col gap-4">
          {tripsLoading && (
            <div className="flex items-center gap-2 text-sm text-[#aaaaaa]">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-[#cccccc] border-t-transparent rounded-full" />
              Loading itineraries...
            </div>
          )}
          {tripsError && <div className="text-sm text-[#aaaaaa]">{tripsError}</div>}
          {trips && trips.length === 0 && <div className="text-sm text-[#aaaaaa]">No itineraries found.</div>}
          {trips && trips.length > 0 && (
            <>
              <TripTimeline trip={trips[0]} />
              {trips.length > 1 && (
                <>
                  <button
                    onClick={() => setAllOpen(v => !v)}
                    className="self-start text-xs text-[#aaaaaa] hover:text-[#777777] border border-[#eeeeee] hover:border-[#cccccc] rounded-lg px-3 py-1.5 transition"
                  >
                    {allOpen
                      ? 'Hide other itineraries ↑'
                      : `Show ${trips.length - 1} more itinerar${trips.length - 1 > 1 ? 'ies' : 'y'} ↓`}
                  </button>
                  {allOpen && (
                    <div className="flex flex-col gap-2">
                      {trips.slice(1).map((trip, i) => (
                        <TripRow key={i} trip={trip} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
