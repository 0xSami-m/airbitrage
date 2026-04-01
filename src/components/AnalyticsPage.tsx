import { useState } from 'react';

interface SearchEvent {
  origin: string;
  destination: string;
  date: string;
  cabin: string;
  results_count: number;
  had_results: boolean;
  timestamp: string;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export default function AnalyticsPage() {
  const [token, setToken]     = useState('');
  const [events, setEvents]   = useState<SearchEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState<'all' | 'no_results'>('all');

  const load = async (t: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/analytics?token=${encodeURIComponent(t)}`);
      if (res.status === 401) { setError('Wrong password.'); setLoading(false); return; }
      if (!res.ok) throw new Error(`${res.status}`);
      const data: SearchEvent[] = await res.json();
      setEvents(data);
    } catch {
      setError('Could not load analytics.');
    }
    setLoading(false);
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const total      = events?.length ?? 0;
  const noResults  = events?.filter(e => !e.had_results).length ?? 0;
  const noResultPct = total > 0 ? Math.round((noResults / total) * 100) : 0;

  const routeCounts: Record<string, number> = {};
  const destCounts:  Record<string, number> = {};
  events?.forEach(e => {
    const r = `${e.origin} → ${e.destination}`;
    routeCounts[r] = (routeCounts[r] ?? 0) + 1;
    destCounts[e.destination] = (destCounts[e.destination] ?? 0) + 1;
  });
  const topRoutes = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topDests  = Object.entries(destCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const displayed = filter === 'no_results'
    ? (events ?? []).filter(e => !e.had_results)
    : (events ?? []);

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!events) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 px-4">
        <div className="text-lg font-semibold text-[#444444]">Analytics</div>
        <div className="flex gap-2 w-full max-w-sm">
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && token) load(token); }}
            placeholder="Enter ANALYTICS_SECRET"
            className="flex-1 px-4 py-2 rounded-xl border border-[#D4D0CB] text-sm outline-none focus:border-[#888888]"
          />
          <button
            onClick={() => token && load(token)}
            disabled={loading || !token}
            className="px-4 py-2 bg-[#1A1A1A] text-white text-sm font-semibold rounded-xl disabled:opacity-40 transition"
          >
            {loading ? '...' : 'Load'}
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-10 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-[#555555] tracking-tight">Search Analytics</h2>
        <button
          onClick={() => { setEvents(null); setToken(''); }}
          className="text-xs text-[#AAAAAA] hover:text-[#666666] transition"
        >
          Log out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Searches',    value: total.toLocaleString() },
          { label: 'No Results',        value: noResults.toLocaleString(), red: noResults > 0 },
          { label: 'No-Result Rate',    value: `${noResultPct}%`,          red: noResultPct > 20 },
          { label: 'Unique Routes',     value: Object.keys(routeCounts).length.toLocaleString() },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#dddddd] shadow-sm px-5 py-4">
            <div className="text-xs text-[#aaaaaa] font-medium uppercase tracking-wide mb-1">{s.label}</div>
            <div className={`text-3xl font-extrabold ${s.red ? 'text-red-500' : 'text-[#444444]'}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Top routes + destinations */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { title: 'Top Routes', items: topRoutes },
          { title: 'Top Destinations', items: topDests },
        ].map(({ title, items }) => (
          <div key={title} className="bg-white rounded-2xl border border-[#dddddd] shadow-sm px-5 py-4">
            <div className="text-xs text-[#aaaaaa] font-medium uppercase tracking-wide mb-3">{title}</div>
            {items.length === 0 ? (
              <div className="text-sm text-[#bbbbbb]">—</div>
            ) : (
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

      {/* Filter + table */}
      <div className="bg-white rounded-2xl border border-[#dddddd] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#eeeeee] flex items-center gap-3">
          <div className="text-sm font-semibold text-[#555555]">Recent Searches</div>
          <div className="flex gap-2 ml-auto">
            {(['all', 'no_results'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs border transition ${
                  filter === f
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white font-semibold'
                    : 'border-[#D4D0CB] text-[#666666] hover:border-[#999999]'
                }`}
              >
                {f === 'all' ? 'All' : 'No results only'}
              </button>
            ))}
          </div>
        </div>
        {displayed.length === 0 ? (
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
                {displayed.map((e, i) => (
                  <tr
                    key={i}
                    className={`border-b border-[#f5f5f5] ${
                      !e.had_results ? 'bg-red-50' : 'hover:bg-[#fafafa]'
                    } transition`}
                  >
                    <td className="px-4 py-2.5 text-[#999999] whitespace-nowrap text-xs">{fmtTime(e.timestamp)}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-[#444444] whitespace-nowrap">
                      {e.origin} → {e.destination}
                    </td>
                    <td className="px-4 py-2.5 text-[#777777] whitespace-nowrap">{e.date}</td>
                    <td className="px-4 py-2.5 text-[#777777] capitalize whitespace-nowrap">{e.cabin}</td>
                    <td className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${
                      !e.had_results ? 'text-red-500' : 'text-[#3DB551]'
                    }`}>
                      {e.had_results ? e.results_count : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
