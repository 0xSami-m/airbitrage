import { useState, useEffect, useRef } from 'react';
import type { FlightResult, Trip } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8787';

interface Props {
  result: FlightResult;
  trip: Trip;
  onBack: () => void;
}

interface Breakdown {
  miles_cost_cents: number;
  taxes_cents: number;
  service_fee_cents: number;
  total_cents: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  SIN: 'Singapore', HKG: 'Hong Kong', NRT: 'Tokyo', HND: 'Tokyo',
  ICN: 'Seoul', PVG: 'Shanghai', PEK: 'Beijing', BKK: 'Bangkok',
  KUL: 'Kuala Lumpur', SYD: 'Sydney', MEL: 'Melbourne',
  PTY: 'Panama City', CUR: 'Curaçao',
};

function cityLabel(code: string) {
  return AIRPORT_CITIES[code] ? `${AIRPORT_CITIES[code]} (${code})` : code;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC',
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
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

function formatDuration(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function FlightTimeline({ trip }: { trip: Trip }) {
  return (
    <div className="flex flex-col">
      {trip.segments.map((seg, idx) => (
        <div key={idx}>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-[#aaaaaa] bg-white" />
              <div className="w-px bg-[#dddddd] my-1" style={{ minHeight: 36 }} />
            </div>
            <div className="pb-1">
              <div className="text-sm font-semibold text-[#333333]">
                {formatTime(seg.departs_at)}
                <span className="font-normal text-[#555555] ml-2">{cityLabel(seg.origin)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0" style={{ width: 10 }}>
              <div className="w-px bg-[#dddddd]" style={{ minHeight: 24 }} />
            </div>
            <div className="text-xs text-[#999999] pb-1 flex flex-wrap items-center gap-x-2 ml-1">
              <span>{seg.flight_number}</span>
              <span>·</span>
              <span>{seg.aircraft_name || seg.aircraft_code}</span>
              {(() => { const d = segmentDuration(seg.departs_at, seg.arrives_at); return d ? <><span>·</span><span>{d}</span></> : null; })()}
              <span>·</span>
              <span>Class {seg.fare_class}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-[#aaaaaa] bg-white" />
              {idx < trip.segments.length - 1 && (
                <div className="w-px bg-[#dddddd] my-1" style={{ minHeight: 24 }} />
              )}
            </div>
            <div className="pb-1">
              <div className="text-sm font-semibold text-[#333333]">
                {formatTime(seg.arrives_at)}
                <span className="font-normal text-[#555555] ml-2">{cityLabel(seg.destination)}</span>
              </div>
            </div>
          </div>

          {idx < trip.segments.length - 1 && (() => {
            const layover = layoverDuration(seg.arrives_at, trip.segments[idx + 1].departs_at);
            return (
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0" style={{ width: 10 }}>
                  <div className="w-px bg-[#dddddd]" style={{ minHeight: 28 }} />
                </div>
                <div className="text-xs text-[#bbbbbb] italic pb-1 ml-1">
                  Layover {cityLabel(seg.destination)}{layover ? ` · ${layover}` : ''}
                </div>
              </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

// ── Input helper ──────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-[#aaaaaa] font-medium uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm text-[#444444] bg-white focus:outline-none focus:border-[#aaaaaa] transition";

// ── Inner form (uses stripe hooks) ───────────────────────────────────────────
function CheckoutForm({ breakdown, result }: {
  breakdown: Breakdown;
  result: FlightResult;
}) {
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [dob, setDob]               = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [passport, setPassport]     = useState('');
  const [nationality, setNationality] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const partialSentRef              = useRef(false);

  const pingAppa = (text: string) => {
    fetch(`${API_BASE}/api/notify-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).catch(() => {/* best-effort */});
  };

  // Silent early ping once name + dob + phone are all filled
  useEffect(() => {
    if (partialSentRef.current) return;
    if (firstName && lastName && dob && phone) {
      partialSentRef.current = true;
      pingAppa(`[Lead] ${firstName} ${lastName} · DOB: ${dob} · Phone: ${phone} — filling out ${result.origin}→${result.destination} ${result.date} (${result.cabin})`);
    }
  }, [firstName, lastName, dob, phone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    pingAppa(`[Booking] ${firstName} ${lastName} · ${result.origin}→${result.destination} ${result.date} (${result.cabin}) · ${result.miles.toLocaleString()} miles + $${result.taxes_usd.toFixed(2)} · Total $${(breakdown.total_cents / 100).toFixed(2)} · DOB: ${dob} · Phone: ${phone} · Email: ${email || 'N/A'} · Passport: ${passport || 'N/A'} · Nationality: ${nationality || 'N/A'}`);
    setSuccess(true);
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-[#dddddd] p-10 text-center flex flex-col gap-5">
        <div className="flex justify-center">
          <span className="animate-spin w-10 h-10 border-4 border-[#dddddd] border-t-[#aaaaaa] rounded-full" />
        </div>
        <div className="text-xl font-bold text-[#444444]">Processing Your Ticket</div>
        <p className="text-sm text-[#aaaaaa] max-w-xs mx-auto">
          Please check back in a few minutes — we'll email you at <strong>{email}</strong> once it's confirmed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Passenger details */}
      <div className="bg-white rounded-2xl border border-[#dddddd] p-6 flex flex-col gap-5">
        <h3 className="font-semibold text-[#444444]">Passenger Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <input value={firstName} onChange={e => setFirstName(e.target.value)}
              required className={inputCls} placeholder="Jane" />
          </Field>
          <Field label="Last Name">
            <input value={lastName} onChange={e => setLastName(e.target.value)}
              required className={inputCls} placeholder="Smith" />
          </Field>
          <Field label="Date of Birth">
            <input type="date" value={dob} onChange={e => setDob(e.target.value)}
              required className={inputCls} />
          </Field>
          <Field label="Phone">
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              required className={inputCls} placeholder="+1 555 000 0000" />
          </Field>
          <Field label="Passport Number">
            <input value={passport} onChange={e => setPassport(e.target.value)}
              required className={inputCls} placeholder="AB123456" />
          </Field>
          <Field label="Nationality">
            <input value={nationality} onChange={e => setNationality(e.target.value)}
              required className={inputCls} placeholder="US" />
          </Field>
          <div className="col-span-2">
            <Field label="Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required className={inputCls} placeholder="jane@example.com" />
            </Field>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 bg-[#555555] hover:bg-[#444444] disabled:opacity-50 text-white font-bold rounded-xl text-base transition"
      >
        {submitting ? 'Processing...' : `Finalize Booking · $${(breakdown.total_cents / 100).toFixed(2)}`}
      </button>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BookingPage({ result, trip, onBack }: Props) {
  const breakdown: Breakdown = {
    miles_cost_cents:  Math.round(result.arb_miles_cost_usd * 100),
    taxes_cents:       Math.round(result.taxes_usd * 100),
    service_fee_cents: 0,
    total_cents:       Math.round(result.arb_price_usd * 100),
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">
      <button onClick={onBack} className="self-start text-sm text-[#aaaaaa] hover:text-[#777777] transition">
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-[#444444]">Book Your Flight</h2>

      {/* Flight summary */}
      <div className="bg-white rounded-2xl border border-[#dddddd] p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold text-[#444444]">
              {result.origin} → {result.destination}
            </div>
            <div className="text-sm text-[#aaaaaa] mt-1">{formatDate(result.date)}</div>
          </div>
          <span className="text-xs font-semibold bg-[#e8e4de] text-[#666666] px-3 py-1.5 rounded-full capitalize">
            {result.cabin}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#aaaaaa]">
          <span>{formatDuration(trip.total_duration_min)}</span>
          <span>·</span>
          <span className={trip.stops === 0 ? 'text-[#4a7a4a] font-semibold' : ''}>
            {trip.stops === 0 ? 'Nonstop' : `${trip.stops} stop${trip.stops > 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="border-t border-[#f0f0f0] pt-4">
          <FlightTimeline trip={trip} />
        </div>

        <div className="border-t border-[#f0f0f0] pt-4">
          <div className="flex justify-between font-bold text-[#444444] text-base">
            <span>Total charged today</span>
            <span>${(breakdown.total_cents / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <CheckoutForm breakdown={breakdown} result={result} />
    </div>
  );
}
