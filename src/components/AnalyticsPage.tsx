import { useState, useEffect } from 'react';

interface SearchEvent {
  origin: string;
  destination: string;
  date: string;
  cabin: string;
  results_count: number;
  had_results: boolean;
  timestamp: string;
}

interface BookingEvent {
  event_type?: string;
  origin: string;
  destination: string;
  date: string;
  cabin: string;
  miles: number;
  taxes_usd: number;
  arb_price_usd: number;
  program: string;
  program_name: string;
  airlines: string;
  direct?: boolean;
  flight_numbers: string;
  ip?: string;
  geo?: { lat: number; lon: number } | null;
  client?: {
    first_name: string;
    last_name: string;
    dob: string;
    email: string;
    phone: string;
    passport: string;
    passport_expiry: string;
    nationality: string;
  };
  timestamp: string;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function fmtUSD(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const PASSWORD = 'Rthj9bd,x*5731';

interface VaultProgram {
  points: string;
  cpp: string; // cents per point
}

const VAULT_PROGRAMS = [
  { key: 'virgin',  label: 'Virgin Atlantic', color: '#E31837' },
  { key: 'alaska',  label: 'Alaska Airlines',  color: '#0060A9' },
  { key: 'aeroplan', label: 'Air Canada Aeroplan', color: '#D22630' },
] as const;

type VaultKey = typeof VAULT_PROGRAMS[number]['key'];

function loadVaults(): Record<VaultKey, VaultProgram> {
  try {
    const raw = localStorage.getItem('flyai_vaults');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { virgin: { points: '', cpp: '' }, alaska: { points: '', cpp: '' }, aeroplan: { points: '', cpp: '' } };
}

export default function AnalyticsPage() {
  const [authed, setAuthed]     = useState(() => sessionStorage.getItem('flyai_admin') === '1');
  const [pwInput, setPwInput]   = useState('');
  const [pwError, setPwError]   = useState(false);
  const [searches, setSearches] = useState<SearchEvent[] | null>(null);
  const [bookings, setBookings] = useState<BookingEvent[] | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState<'searches' | 'bookings' | 'vaults'>('searches');
  const [filter, setFilter]     = useState<'all' | 'no_results'>('all');
  const [vaults, setVaults]     = useState<Record<VaultKey, VaultProgram>>(loadVaults);

  const updateVault = (key: VaultKey, field: keyof VaultProgram, value: string) => {
    setVaults(prev => {
      const next = { ...prev, [key]: { ...prev[key], [field]: value } };
      localStorage.setItem('flyai_vaults', JSON.stringify(next));
      return next;
    });
  };

  const login = () => {
    if (pwInput === PASSWORD) {
      sessionStorage.setItem('flyai_admin', '1');
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch('/api/analytics')
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((data: { searches: SearchEvent[]; bookings: BookingEvent[] }) => {
        setSearches(data.searches ?? []);
        setBookings(data.bookings ?? []);
      })
      .catch(() => setError('Could not load analytics.'))
      .finally(() => setLoading(false));
  }, [authed]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const total       = searches?.length ?? 0;
  const noResults   = searches?.filter(e => !e.had_results).length ?? 0;
  const noResultPct = total > 0 ? Math.round((noResults / total) * 100) : 0;

  const routeCounts: Record<string, number> = {};
  const destCounts:  Record<string, number> = {};
  searches?.forEach(e => {
    const r = `${e.origin} → ${e.destination}`;
    routeCounts[r] = (routeCounts[r] ?? 0) + 1;
    destCounts[e.destination] = (destCounts[e.destination] ?? 0) + 1;
  });
  const topRoutes = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topDests  = Object.entries(destCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const displayedSearches = filter === 'no_results'
    ? (searches ?? []).filter(e => !e.had_results)
    : (searches ?? []);

  // ── Password gate ────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 px-4">
        <div className="text-base font-semibold text-[#444444]">Analytics</div>
        <div className="flex gap-2 w-full max-w-xs">
          <input
            type="password"
            value={pwInput}
            onChange={e => { setPwInput(e.target.value); setPwError(false); }}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Password"
            className={`flex-1 px-4 py-2 rounded-xl border text-sm outline-none ${pwError ? 'border-red-400' : 'border-[#D4D0CB] focus:border-[#888888]'}`}
            autoFocus
          />
          <button
            onClick={login}
            className="px-4 py-2 bg-[#1A1A1A] text-white text-sm font-semibold rounded-xl transition"
          >
            Go
          </button>
        </div>
        {pwError && <p className="text-xs text-red-400">Wrong password.</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[#AAAAAA]">
        Loading analytics…
      </div>
    );
  }

  if (error || !searches) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-red-400">
        {error || 'No data.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-10 w-full max-w-5xl mx-auto">
      {/* Header + tabs */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-extrabold text-[#555555] tracking-tight">Analytics</h2>
        <div className="flex gap-2">
          {(['searches', 'bookings', 'vaults'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm border transition capitalize ${
                tab === t
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white font-semibold'
                  : 'border-[#D4D0CB] text-[#666666] hover:border-[#999999]'
              }`}
            >
              {t === 'searches' ? `searches (${total})` : t === 'bookings' ? `bookings (${bookings?.length ?? 0})` : 'vaults'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Searches tab ── */}
      {tab === 'searches' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Searches',  value: total.toLocaleString() },
              { label: 'No Results',      value: noResults.toLocaleString(), red: noResults > 0 },
              { label: 'No-Result Rate',  value: `${noResultPct}%`,          red: noResultPct > 20 },
              { label: 'Unique Routes',   value: Object.keys(routeCounts).length.toLocaleString() },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-[#dddddd] shadow-sm px-5 py-4">
                <div className="text-xs text-[#aaaaaa] font-medium uppercase tracking-wide mb-1">{s.label}</div>
                <div className={`text-3xl font-extrabold ${s.red ? 'text-red-500' : 'text-[#444444]'}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Top Routes',       items: topRoutes },
              { title: 'Top Destinations', items: topDests },
            ].map(({ title, items }) => (
              <div key={title} className="bg-white rounded-2xl border border-[#dddddd] shadow-sm px-5 py-4">
                <div className="text-xs text-[#aaaaaa] font-medium uppercase tracking-wide mb-3">{title}</div>
                {items.length === 0 ? <div className="text-sm text-[#bbbbbb]">—</div> : (
                  <div className="flex flex-col gap-2">
                    {items.map(([name, count]) => (
                      <div key={name} className="flex items-center gap-2">
                        <div className="flex-1 text-sm text-[#555555] font-mono">{name}</div>
                        <div className="text-sm font-bold text-[#888888]">{count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[#dddddd] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eeeeee] flex items-center gap-3">
              <div className="text-sm font-semibold text-[#555555]">Recent Searches</div>
              <div className="flex gap-2 ml-auto">
                {(['all', 'no_results'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs border transition ${
                      filter === f ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white font-semibold' : 'border-[#D4D0CB] text-[#666666] hover:border-[#999999]'
                    }`}>
                    {f === 'all' ? 'All' : 'No results only'}
                  </button>
                ))}
              </div>
            </div>
            {displayedSearches.length === 0 ? (
              <div className="px-6 py-10 text-sm text-[#bbbbbb] text-center">No searches yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-[#aaaaaa] font-medium border-b border-[#eeeeee]">
                      <th className="text-left px-4 py-3 whitespace-nowrap">Time</th>
                      <th className="text-left px-4 py-3 whitespace-nowrap">Route</th>
                      <th className="text-left px-4 py-3 whitespace-nowrap">Date</th>
                      <th className="text-left px-4 py-3 whitespace-nowrap">Cabin</th>
                      <th className="text-right px-4 py-3 whitespace-nowrap">Results</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSearches.map((e, i) => (
                      <tr key={i} className={`border-b border-[#f5f5f5] ${!e.had_results ? 'bg-red-50' : 'hover:bg-[#fafafa]'} transition`}>
                        <td className="px-4 py-2.5 text-[#999999] whitespace-nowrap text-xs">{fmtTime(e.timestamp)}</td>
                        <td className="px-4 py-2.5 font-mono font-semibold text-[#444444] whitespace-nowrap">{e.origin} → {e.destination}</td>
                        <td className="px-4 py-2.5 text-[#777777] whitespace-nowrap">{e.date}</td>
                        <td className="px-4 py-2.5 text-[#777777] capitalize whitespace-nowrap">{e.cabin}</td>
                        <td className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${!e.had_results ? 'text-red-500' : 'text-[#3DB551]'}`}>
                          {e.had_results ? e.results_count : '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Bookings tab ── */}
      {tab === 'bookings' && (
        <div className="flex flex-col gap-4">
          <div className="text-xs text-[#aaaaaa]">
            {bookings?.length ?? 0} events — button clicks and form submissions
          </div>
          {!bookings || bookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#dddddd] px-6 py-10 text-sm text-[#bbbbbb] text-center">No bookings yet.</div>
          ) : (
            bookings.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#dddddd] shadow-sm px-6 py-5 flex flex-col gap-4">
                {/* Header row */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg text-[#333333]">{b.origin} → {b.destination}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.event_type === 'form_submit' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {b.event_type === 'form_submit' ? 'Form submitted' : 'Book clicked'}
                    </span>
                  </div>
                  <div className="text-xs text-[#999999]">{fmtTime(b.timestamp)}</div>
                </div>

                {/* Flight info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-[#aaaaaa] text-xs block">Date</span>{b.date}</div>
                  <div><span className="text-[#aaaaaa] text-xs block">Cabin</span><span className="capitalize">{b.cabin}</span></div>
                  <div><span className="text-[#aaaaaa] text-xs block">Program</span>{b.program_name || b.program}</div>
                  <div><span className="text-[#aaaaaa] text-xs block">Flights</span>{b.flight_numbers || '—'}</div>
                  <div><span className="text-[#aaaaaa] text-xs block">Miles</span>{b.miles?.toLocaleString() ?? '—'}</div>
                  <div><span className="text-[#aaaaaa] text-xs block">Taxes</span>{b.taxes_usd != null ? fmtUSD(b.taxes_usd) : '—'}</div>
                  <div><span className="text-[#aaaaaa] text-xs block">Total</span><span className="font-semibold text-[#3DB551]">{fmtUSD(b.arb_price_usd)}</span></div>
                </div>

                {/* Client info (form submissions only) */}
                {b.client && (
                  <div className="border-t border-[#eeeeee] pt-4">
                    <div className="text-xs text-[#aaaaaa] font-semibold uppercase tracking-wide mb-2">Passenger</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><span className="text-[#aaaaaa] text-xs block">Name</span>{b.client.first_name} {b.client.last_name}</div>
                      <div><span className="text-[#aaaaaa] text-xs block">DOB</span>{b.client.dob}</div>
                      <div><span className="text-[#aaaaaa] text-xs block">Email</span>{b.client.email}</div>
                      <div><span className="text-[#aaaaaa] text-xs block">Phone</span>{b.client.phone}</div>
                      <div><span className="text-[#aaaaaa] text-xs block">Passport</span>{b.client.passport}</div>
                      <div><span className="text-[#aaaaaa] text-xs block">Expiry</span>{b.client.passport_expiry}</div>
                      <div><span className="text-[#aaaaaa] text-xs block">Nationality</span>{b.client.nationality}</div>
                    </div>
                  </div>
                )}

                {/* IP + geo */}
                {(b.ip || b.geo) && (
                  <div className="border-t border-[#eeeeee] pt-3 flex flex-wrap gap-4 text-xs text-[#888888]">
                    {b.ip && <span>IP: <span className="font-mono text-[#555555]">{b.ip}</span></span>}
                    {b.geo && <span>GPS: <span className="font-mono text-[#555555]">{b.geo.lat.toFixed(4)}, {b.geo.lon.toFixed(4)}</span></span>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      {/* ── Vaults tab ── */}
      {tab === 'vaults' && (
        <div className="flex flex-col gap-5">
          {VAULT_PROGRAMS.map(prog => {
            const v = vaults[prog.key];
            const points = parseFloat(v.points.replace(/,/g, '')) || 0;
            const cpp    = parseFloat(v.cpp) || 0;
            const value  = points * cpp / 100;
            return (
              <div key={prog.key} className="bg-white rounded-2xl border border-[#dddddd] shadow-sm overflow-hidden">
                <div className="px-6 py-3 flex items-center gap-3" style={{ backgroundColor: prog.color }}>
                  <span className="text-white font-bold text-sm">{prog.label}</span>
                </div>
                <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Remaining points */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#aaaaaa] font-medium uppercase tracking-wide">Remaining Points</label>
                    <input
                      type="text"
                      value={v.points}
                      onChange={e => updateVault(prog.key, 'points', e.target.value)}
                      placeholder="e.g. 150,000"
                      className="px-4 py-2.5 border border-[#D4D0CB] rounded-xl text-sm text-[#333333] focus:outline-none focus:border-[#888888] transition"
                    />
                  </div>
                  {/* Cents per point */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#aaaaaa] font-medium uppercase tracking-wide">Price per Point (¢)</label>
                    <input
                      type="text"
                      value={v.cpp}
                      onChange={e => updateVault(prog.key, 'cpp', e.target.value)}
                      placeholder="e.g. 1.5"
                      className="px-4 py-2.5 border border-[#D4D0CB] rounded-xl text-sm text-[#333333] focus:outline-none focus:border-[#888888] transition"
                    />
                  </div>
                  {/* Value */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#aaaaaa] font-medium uppercase tracking-wide">Value of Points</label>
                    <div className="px-4 py-2.5 border border-[#eeeeee] rounded-xl bg-[#fafafa] text-sm font-bold" style={{ color: value > 0 ? prog.color : '#bbbbbb' }}>
                      {value > 0 ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
