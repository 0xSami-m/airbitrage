import { useState, useEffect, useRef } from 'react';
import type { FlightResult, Trip } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8787';

interface Props {
  result: FlightResult;
  trip: Trip;
  onBack: () => void;
}

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

function formatDuration(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatUSD(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const inputCls = "w-full px-4 py-3 border border-[#D4D0CB] rounded-xl text-sm text-[#333333] bg-white focus:outline-none focus:border-[#888888] transition placeholder:text-[#CCCCCC]";

export default function BookingPage({ result, trip, onBack }: Props) {
  const [firstName, setFirstName]     = useState('');
  const [lastName, setLastName]       = useState('');
  const [dob, setDob]                 = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [passport, setPassport]       = useState('');
  const [nationality, setNationality] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(false);
  const partialSentRef                = useRef(false);

  const totalUsd = result.arb_price_usd;

  const pingAppa = (text: string) => {
    fetch(`${API_BASE}/api/notify-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).catch(() => {/* best-effort */});
  };

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
    pingAppa(`[Booking] ${firstName} ${lastName} · ${result.origin}→${result.destination} ${result.date} (${result.cabin}) · ${result.miles.toLocaleString()} miles + $${result.taxes_usd.toFixed(2)} taxes · Total $${totalUsd.toFixed(2)} · DOB: ${dob} · Phone: ${phone} · Email: ${email || 'N/A'} · Passport: ${passport || 'N/A'} · Nationality: ${nationality || 'N/A'}`);
    setSuccess(true);
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center px-4 py-16 gap-6 w-full max-w-xl mx-auto text-center">
        <div className="font-hand font-bold text-4xl text-[#1A1A1A]">
          You're going to {AIRPORT_CITIES[result.destination] ?? result.destination}!
        </div>
        <div className="text-[#3DB551] font-hand text-xl">
          and you just saved{' '}
          {result.savings_usd != null && (
            <span className="border-2 border-[#3DB551] rounded-full px-3 py-0.5">
              ${formatUSD(result.savings_usd)}
            </span>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-[#D4D0CB] overflow-hidden w-full shadow-sm">
          <div className="bg-[#3DB551] text-white px-5 py-2 flex items-center justify-between">
            <span className="font-hand font-bold text-base">Boarding Pass</span>
            <span className="text-xs font-semibold uppercase tracking-widest">Confirmed</span>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="font-hand font-bold text-5xl text-[#1A1A1A]">{result.origin}</div>
              <div className="flex-1 flex items-center gap-1">
                <div className="flex-1 border-b-2 border-dashed border-[#CCCCCC]" />
                <span className="text-[#AAAAAA]">✈</span>
                <div className="flex-1 border-b-2 border-dashed border-[#CCCCCC]" />
              </div>
              <div className="font-hand font-bold text-5xl text-[#1A1A1A]">{result.destination}</div>
            </div>
            <div className="text-sm text-[#888888]">
              {formatDate(result.date)} · {formatTime(trip.departs_at)} → {formatTime(trip.arrives_at)} · {formatDuration(trip.total_duration_min)}
            </div>
            <div className="text-sm text-[#555555]">
              {trip.flight_numbers} · {result.program_name} · {result.cabin.charAt(0).toUpperCase() + result.cabin.slice(1)} · {trip.stops === 0 ? 'Nonstop' : `${trip.stops} stop${trip.stops > 1 ? 's' : ''}`}
            </div>
            <div className="border-t border-dashed border-[#DDDDDD] pt-3 flex items-center gap-3">
              {result.cash_price_usd != null && (
                <span className="text-sm text-[#AAAAAA] line-through">${formatUSD(result.cash_price_usd)}</span>
              )}
              <span className="font-hand font-bold text-2xl text-[#3DB551]">${formatUSD(totalUsd)}</span>
              {result.value_ratio != null && result.value_ratio >= 1.5 && (
                <span className="bg-[#F5C842] text-[#1A1A1A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {result.value_ratio.toFixed(1)}x value
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm text-[#888888]">
          We'll send confirmation to <strong>{email}</strong> once your booking is processed.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24 flex flex-col gap-4">
      {/* Flight summary card */}
      <div className="bg-white rounded-2xl border border-[#D4D0CB] overflow-hidden shadow-sm">
        <div className="bg-[#3DB551] px-5 py-2 flex items-center justify-between">
          <span className="font-hand font-bold text-white text-base">flyAI</span>
          <button onClick={onBack} className="text-white text-xs opacity-80 hover:opacity-100 transition">
            Change flight →
          </button>
        </div>
        <div className="p-6 flex flex-col gap-3">
          {/* Route */}
          <div className="flex items-center gap-3">
            <div className="font-hand font-bold text-5xl text-[#1A1A1A] leading-none">{result.origin}</div>
            <div className="flex-1 flex items-center gap-1">
              <div className="flex-1 border-b-2 border-dashed border-[#CCCCCC]" />
              <span className="text-[#AAAAAA]">✈</span>
              <div className="flex-1 border-b-2 border-dashed border-[#CCCCCC]" />
            </div>
            <div className="font-hand font-bold text-5xl text-[#1A1A1A] leading-none">{result.destination}</div>
          </div>

          <div className="text-sm text-[#888888]">{formatDate(result.date)}</div>

          <div className="text-sm text-[#555555]">
            {trip.flight_numbers} · {result.program_name} · {result.cabin.charAt(0).toUpperCase() + result.cabin.slice(1)}
            {' · '}{trip.stops === 0 ? 'Nonstop' : `${trip.stops} stop${trip.stops > 1 ? 's' : ''}`}
            {' · '}{formatDuration(trip.total_duration_min)}
          </div>

          {/* Timeline dots */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-semibold text-[#222222]">{formatTime(trip.departs_at)}</span>
              <span className="text-xs text-[#999999]">{cityLabel(result.origin)}</span>
            </div>
            <div className="flex-1 flex items-center gap-1 mx-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3DB551] shrink-0" />
              <div className="flex-1 h-0.5 bg-[#3DB551]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#3DB551] shrink-0" />
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm font-semibold text-[#222222]">{formatTime(trip.arrives_at)}</span>
              <span className="text-xs text-[#999999]">{cityLabel(result.destination)}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 pt-1">
            {result.cash_price_usd != null && (
              <span className="text-base text-[#AAAAAA] line-through">${formatUSD(result.cash_price_usd)}</span>
            )}
            <span className="font-hand font-bold text-3xl text-[#3DB551]">${formatUSD(totalUsd)}</span>
            {result.value_ratio != null && result.value_ratio >= 1.5 && (
              <span className="bg-[#F5C842] text-[#1A1A1A] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {result.value_ratio.toFixed(1)}x value
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Passenger form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-[#D4D0CB] p-6 flex flex-col gap-5 shadow-sm">
          <h3 className="font-hand font-bold text-2xl text-[#1A1A1A] flex items-center gap-2">
            Who's flying?
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#888888]">First name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} required className={inputCls} placeholder="Namik" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#888888]">Last name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} required className={inputCls} placeholder="Muduroglu" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#888888]">Date of birth</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} required className={inputCls} placeholder="mm/dd/yyyy" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#888888]">Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className={inputCls} placeholder="+1 555 000 0000" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#888888]">Passport number</label>
              <input value={passport} onChange={e => setPassport(e.target.value)} required className={inputCls} placeholder="AB123456" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#888888]">Nationality</label>
              <input value={nationality} onChange={e => setNationality(e.target.value)} required className={inputCls} placeholder="US" />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs text-[#888888]">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} placeholder="namik@example.com" />
            </div>
          </div>
        </div>

        {/* Sticky bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#3DB551] hover:bg-[#35A348] disabled:opacity-50 text-white font-hand font-bold text-2xl py-4 rounded-2xl transition"
            >
              {submitting ? 'Processing...' : `Finalize Booking · $${formatUSD(totalUsd)}`}
            </button>
            <p className="text-center text-xs text-[#AAAAAA] mt-2">
              By booking you agree to <span className="underline cursor-pointer">FlyAI's terms</span>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
