import { useState } from 'react';
import type { FlightResult, Trip } from '../types';
import { airlineLogoUrl, airlineName } from '../utils/airlineLogo';

interface Props {
  result: FlightResult;
  mockTrips?: Trip[];
  onBook?: (result: FlightResult, trip: Trip) => void;
  isBestDeal?: boolean;
}

const CABIN_LABELS: Record<string, string> = {
  economy:  'Economy',
  premium:  'Prem. Economy',
  business: 'Business',
  first:    'First',
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

function cityFor(code: string) { return AIRPORT_CITIES[code] ?? ''; }

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC',
  });
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatUSD(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function segmentDuration(departs: string, arrives: string) {
  const mins = Math.round((new Date(arrives).getTime() - new Date(departs).getTime()) / 60000);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ''}`;
}

function layoverDuration(a: string, b: string) {
  const mins = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ''}`;
}

// ── Airline logo with fallback ────────────────────────────────────────────────
function AirlineBadge({ code, logoUrl }: { code: string; logoUrl: string }) {
  const [failed, setFailed] = useState(false);
  if (!logoUrl || failed) {
    return (
      <div className="w-14 h-14 rounded-xl border border-[#D4D0CB] bg-white flex items-center justify-center text-xs font-bold text-[#555555] shrink-0">
        {code.slice(0, 2)}
      </div>
    );
  }
  return (
    <img
      src={logoUrl}
      alt={code}
      className="w-14 h-14 rounded-xl border border-[#D4D0CB] bg-white object-contain shrink-0 p-1"
      onError={() => setFailed(true)}
    />
  );
}

// ── Value badge ────────────────────────────────────────────────────────────────
function ValueBadge({ ratio }: { ratio: number | null }) {
  if (ratio == null || ratio < 1.5) return null;
  return (
    <span className="inline-block bg-[#F5C842] text-[#1A1A1A] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
      {ratio.toFixed(1)}x value
    </span>
  );
}

// ── Cabin badge ────────────────────────────────────────────────────────────────
function CabinBadge({ cabin }: { cabin: string }) {
  const label = CABIN_LABELS[cabin] ?? cabin;
  const isFirst    = cabin === 'first';
  const isBusiness = cabin === 'business';
  return (
    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${
      isFirst    ? 'border-[#F5C842] bg-[#FFF8DC] text-[#7A6000]' :
      isBusiness ? 'border-[#333333] bg-[#333333] text-white' :
                   'border-[#D4D0CB] bg-white text-[#666666]'
    }`}>
      {label}
    </span>
  );
}

// ── Trip timeline (expanded details) ──────────────────────────────────────────
function TripTimeline({ trip }: { trip: Trip }) {
  return (
    <div className="flex flex-col gap-0">
      {trip.segments.map((seg, idx) => (
        <div key={idx}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full border-2 border-[#999999] bg-white shrink-0" />
            <span className="text-sm font-semibold text-[#222222]">{formatTime(seg.departs_at)}</span>
            <span className="text-sm text-[#666666]">{cityFor(seg.origin) || seg.origin} ({seg.origin})</span>
          </div>
          <div className="flex gap-3 my-1">
            <div className="w-2 flex justify-center shrink-0">
              <div className="w-px bg-[#DDDDDD] h-8" />
            </div>
            <div className="text-xs text-[#999999] flex flex-wrap gap-x-1.5 items-center self-center">
              <span>{seg.flight_number}</span>
              <span>·</span>
              <span>{seg.aircraft_name || seg.aircraft_code}</span>
              {(() => { const d = segmentDuration(seg.departs_at, seg.arrives_at); return d ? <><span>·</span><span>{d}</span></> : null; })()}
              <span>·</span>
              <span>Class {seg.fare_class}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full border-2 border-[#999999] bg-white shrink-0" />
            <span className="text-sm font-semibold text-[#222222]">{formatTime(seg.arrives_at)}</span>
            <span className="text-sm text-[#666666]">{cityFor(seg.destination) || seg.destination} ({seg.destination})</span>
          </div>
          {idx < trip.segments.length - 1 && (() => {
            const l = layoverDuration(seg.arrives_at, trip.segments[idx + 1].departs_at);
            return (
              <div className="flex gap-3 my-2">
                <div className="w-2 flex justify-center shrink-0">
                  <div className="w-px bg-[#DDDDDD] h-6" />
                </div>
                <span className="text-xs text-[#BBBBBB] italic self-center">
                  Layover {cityFor(seg.destination) || seg.destination}{l ? ` · ${l}` : ''}
                </span>
              </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function FlightCard({ result, mockTrips, onBook, isBestDeal }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [trips, setTrips]       = useState<Trip[] | null>(null);
  const [tripsError, setTripsError] = useState('');

  const airlinesStr = Array.isArray(result.airlines) ? result.airlines.join(', ') : (result.airlines ?? '');
  const primaryCode = airlinesStr.split(/[,\s]+/)[0];
  const logoUrl = airlineLogoUrl(primaryCode) || result.carrier_logos?.[primaryCode] || '';

  // Build a Trip directly from the search result's embedded segment data
  const tripFromResult: Trip | null = result.segments && result.segments.length > 0 ? {
    flight_numbers: result.flight_numbers ?? result.segments.map(s => s.flight_number).join(', '),
    departs_at:     result.departs_at ?? result.segments[0].departs_at,
    arrives_at:     result.arrives_at ?? result.segments[result.segments.length - 1].arrives_at,
    total_duration_min: result.segments.reduce((sum, s) => sum + (s.duration_min ?? 0), 0),
    stops:          result.stops ?? result.segments.length - 1,
    carriers:       airlinesStr,
    remaining_seats: result.remaining_seats,
    segments:       result.segments,
  } : null;

  const loadTrips = () => {
    if (trips !== null) return;
    if (mockTrips) { setTrips(mockTrips); return; }
    if (tripFromResult) { setTrips([tripFromResult]); return; }
    setTripsError('No itinerary data available.');
  };

  const handleToggle = () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    loadTrips();
  };

  const handleBook = () => {
    if (!onBook) return;
    const tripList = mockTrips ?? (trips && trips.length > 0 ? trips : tripFromResult ? [tripFromResult] : null);
    if (tripList && tripList.length > 0) { setTrips(tripList); onBook(result, tripList[0]); }
  };

  const firstTrip = trips?.[0];

  return (
    <div className="bg-white rounded-2xl border border-[#D4D0CB] overflow-hidden shadow-sm hover:shadow-md transition">
      {/* Card body */}
      <div className="flex">
        {/* Left: flight info */}
        <div className="flex-1 p-5 flex flex-col gap-3 min-w-0">
          {/* Route */}
          <div className="flex items-center gap-2">
            <div>
              <div className="font-hand font-bold text-4xl text-[#1A1A1A] leading-none">{result.origin}</div>
              {firstTrip && (
                <div className="text-xs text-[#888888] mt-0.5">{formatTime(firstTrip.departs_at)}</div>
              )}
            </div>
            <div className="flex-1 flex items-center gap-0.5 mx-2">
              <div className="flex-1 border-b-2 border-dashed border-[#CCCCCC]" />
              <span className="text-[#AAAAAA] text-base">✈</span>
              <div className="flex-1 border-b-2 border-dashed border-[#CCCCCC]" />
            </div>
            <div className="text-right">
              <div className="font-hand font-bold text-4xl text-[#1A1A1A] leading-none">{result.destination}</div>
              {firstTrip && (
                <div className="text-xs text-[#888888] mt-0.5">{formatTime(firstTrip.arrives_at)}</div>
              )}
            </div>
          </div>

          {/* Airline + stops row */}
          <div className="flex items-center gap-3 flex-wrap">
            <AirlineBadge code={primaryCode} logoUrl={logoUrl} />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-[#1A1A1A]">
                {airlineName(primaryCode)}
                {firstTrip && <span className="font-normal text-[#888888]"> · {firstTrip.segments[0]?.aircraft_name}</span>}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                  result.direct
                    ? 'border-[#3DB551] text-[#3DB551]'
                    : 'border-[#CCCCCC] text-[#888888]'
                }`}>
                  {result.direct ? 'Nonstop' : 'Connecting'}
                </span>
                {result.remaining_seats > 0 && result.remaining_seats <= 3 && (
                  <span className="text-[10px] font-bold bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-200">
                    Only {result.remaining_seats} left!
                  </span>
                )}
                {result.alt_date && (
                  <span className="text-xs bg-[#FFF3CD] text-[#856404] px-2 py-0.5 rounded-full border border-[#F5C842]">
                    {formatDate(result.date)} · flex date
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Flight meta */}
          {firstTrip && (
            <div className="text-xs text-[#999999]">
              Flight {firstTrip.flight_numbers} · {formatDate(result.date)} · {CABIN_LABELS[result.cabin] ?? result.cabin}
              {firstTrip.total_duration_min > 0 && <> · {formatDuration(firstTrip.total_duration_min)}</>}
            </div>
          )}

          {/* Details toggle */}
          <button
            onClick={handleToggle}
            className="self-start text-xs text-[#3DB551] hover:text-[#2A9040] font-medium transition"
          >
            {expanded ? '↑ Hide details' : '↓ More details'}
          </button>
        </div>

        {/* Dashed divider */}
        <div className="w-px border-l border-dashed border-[#D4D0CB] my-4" />

        {/* Right: pricing */}
        <div className="w-44 shrink-0 p-5 flex flex-col gap-2 items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {isBestDeal && (
              <span className="bg-[#F5C842] text-[#1A1A1A] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Best deal
              </span>
            )}
            <CabinBadge cabin={result.cabin} />
            {result.cash_price_usd != null && (
              <span className="text-sm text-[#AAAAAA] line-through">
                ${formatUSD(result.cash_price_usd)}
              </span>
            )}
            <span className="font-hand font-bold text-3xl text-[#3DB551] leading-none">
              ${formatUSD(result.arb_price_usd)}
            </span>
            <ValueBadge ratio={result.value_ratio} />
          </div>

          {onBook && (
            <button
              onClick={handleBook}
              className="w-full bg-[#3DB551] hover:bg-[#35A348] text-white font-hand font-bold text-lg py-2 rounded-xl transition"
            >
              Book
            </button>
          )}
        </div>
      </div>

      {/* Expanded trip details */}
      {expanded && (
        <div className="border-t border-[#EEEEEE] bg-[#FAFAF8] px-6 py-5">
          {false && (
            <div className="flex items-center gap-2 text-sm text-[#AAAAAA]">
              <span className="animate-spin w-4 h-4 border-2 border-[#CCCCCC] border-t-[#AAAAAA] rounded-full inline-block" />
              Loading itinerary...
            </div>
          )}
          {tripsError && <div className="text-sm text-[#AAAAAA]">{tripsError}</div>}
          {trips && trips.length === 0 && <div className="text-sm text-[#AAAAAA]">No itinerary found.</div>}
          {trips && trips.length > 0 && <TripTimeline trip={trips[0]} />}
        </div>
      )}
    </div>
  );
}
