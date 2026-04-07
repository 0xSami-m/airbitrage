import { useState, useEffect } from 'react';
import './index.css';
import Nav, { type Page } from './components/Nav';
import SearchForm from './components/SearchForm';
import ResultsPanel from './components/ResultsPanel';
import { DiscoverRows } from './components/DiscoverPage';
import DestinationTiles from './components/DestinationTiles';
import AIAgentPage from './components/AIAgentPage';
import DashboardPage from './components/DashboardPage';
import DevPage from './components/DevPage';
import AnalyticsPage from './components/AnalyticsPage';
import BookingPage from './components/BookingPage';
import AuthPage, { getStoredUser, clearStoredUser, type AuthUser } from './components/AuthPage';
import type { DiscoverTile, FlightResult, SearchParams, SearchResponse, Trip } from './types';

function tileToBooking(tile: DiscoverTile): { result: FlightResult; trip: Trip } {
  const dealPrice = tile.arb_miles_cost_promo_usd ?? tile.buy_promo_usd ?? 0;
  const segments = tile.segments ?? [];
  const departsAt = segments[0]?.departs_at ?? tile.departs_at ?? `${tile.date}T00:00:00Z`;
  const arrivesAt = segments[segments.length - 1]?.arrives_at ?? tile.arrives_at ?? `${tile.date}T00:00:00Z`;
  const rawDuration = segments.reduce((s, seg) => s + (seg.duration_min ?? 0), 0);

  const result: FlightResult = {
    availability_id: `${tile.origin_code}-${tile.destination_code}-${tile.date}`,
    date: tile.date,
    origin: tile.origin_code,
    destination: tile.destination_code,
    program: tile.program,
    program_name: tile.program_name,
    program_logo_url: '',
    carrier_logos: {},
    cabin: tile.cabin,
    miles: tile.miles,
    taxes_usd: tile.taxes_usd,
    arb_miles_cost_usd: dealPrice,
    arb_miles_cost_promo_usd: dealPrice,
    arb_price_usd: tile.arb_price_promo_usd ?? (dealPrice + tile.taxes_usd),
    arb_price_promo_usd: tile.arb_price_promo_usd ?? (dealPrice + tile.taxes_usd),
    cash_price_usd: tile.cash_fare_usd || null,
    cash_price_source: '',
    savings_usd: tile.savings_usd,
    value_ratio: tile.cash_fare_usd > 0 && (tile.arb_price_promo_usd ?? (dealPrice + tile.taxes_usd)) > 0
      ? tile.cash_fare_usd / (tile.arb_price_promo_usd ?? (dealPrice + tile.taxes_usd)) : null,
    google_flights_url: '',
    airlines: tile.airlines,
    direct: tile.direct,
    remaining_seats: tile.remaining_seats,
    buy_miles_info: null,
  };

  const trip: Trip = {
    flight_numbers: segments.map(s => s.flight_number).filter(Boolean).join(', ') || tile.airlines,
    departs_at: departsAt,
    arrives_at: arrivesAt,
    total_duration_min: rawDuration || Math.round((new Date(arrivesAt).getTime() - new Date(departsAt).getTime()) / 60000),
    stops: tile.direct ? 0 : Math.max(0, segments.length - 1),
    carriers: tile.airlines,
    remaining_seats: tile.remaining_seats,
    segments,
  };

  return { result, trip };
}

const API_BASE = '';

async function doOneSearch(
  origin: string, destination: string, date: string, cabin: string, signal: AbortSignal,
): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin,
      destination,
      date_from: date,
      date_to: date,
      cabin: cabin === 'any' ? undefined : cabin,
    }),
    signal,
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

function trackBooking(result: FlightResult, trip: Trip) {
  fetch('/api/track-booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin:        result.origin,
      destination:   result.destination,
      date:          result.date,
      cabin:         result.cabin,
      miles:         result.miles,
      taxes_usd:     result.taxes_usd,
      arb_price_usd: result.arb_price_usd,
      program:       result.program,
      program_name:  result.program_name,
      airlines:      result.airlines,
      direct:        result.direct,
      flight_numbers: trip.flight_numbers,
    }),
  }).catch(() => { /* ignore */ });
}

type View = 'search' | 'results';

const isAdmin = window.location.pathname === '/sami';

// URL format: /{FROM}-{TO}-{DDMMYY}[-cabin]  e.g. /MAD-AUH-100426 or /MAD-AUH-100426-business
function parseSearchUrl(): SearchParams | null {
  const m = window.location.pathname.match(
    /^\/([A-Z]{3}(?:\|[A-Z]{3})*)-([A-Z]{3}(?:\|[A-Z]{3})*)-(\d{6})(?:-([a-z]+))?$/i,
  );
  if (!m) return null;
  const [, from, to, ddmmyy, cabin] = m;
  const dd = ddmmyy.slice(0, 2), mm = ddmmyy.slice(2, 4), yy = ddmmyy.slice(4, 6);
  const date = `20${yy}-${mm}-${dd}`;
  const cabinVal = (['economy','premium','business','first'] as const).find(c => c === cabin?.toLowerCase()) ?? 'any';
  return { from: from.toUpperCase(), to: to.toUpperCase(), date, cabin: cabinVal };
}

function searchToUrl(params: SearchParams): string {
  const [yyyy, mm, dd] = params.date.split('-');
  const ddmmyy = `${dd}${mm}${yyyy.slice(2)}`;
  const cabin = params.cabin !== 'any' ? `-${params.cabin}` : '';
  return `/${params.from}-${params.to}-${ddmmyy}${cabin}`;
}

export default function App() {
  const [page, setPage] = useState<Page>(isAdmin ? 'Analytics' : 'Search');
  const [view, setView] = useState<View>('search');
  const [loading, setLoading] = useState(false);
  const [flexLoading, setFlexLoading] = useState(false);
  const [flexDateInfo, setFlexDateInfo] = useState<import('./types').FlexDateInfo | null>(null);
  const [flexResults, setFlexResults] = useState<FlightResult[]>([]);
  const [cabinFallbackInfo, setCabinFallbackInfo] = useState<import('./types').CabinFallbackInfo | null>(null);
  const [results, setResults] = useState<FlightResult[]>([]);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [booking, setBooking] = useState<{ result: FlightResult; trip: Trip } | null>(null);
  const [detectedOrigin, setDetectedOrigin] = useState('');
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  // Auto-search when landing on a shareable URL
  useEffect(() => {
    const params = parseSearchUrl();
    if (params) handleSearch(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setFlexLoading(false);
    setFlexDateInfo(null);
    setFlexResults([]);
    setCabinFallbackInfo(null);
    setSearchParams(params);
    setError('');
    history.pushState(null, '', searchToUrl(params));

    // Expand multi-airport metro codes (pipe-joined, e.g. "JFK|LGA|EWR")
    const fromCodes = params.from.split('|');
    const toCodes   = params.to.split('|');
    const combos: Array<[string, string]> = fromCodes.flatMap(f => toCodes.map(t => [f, t] as [string, string]));

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);

      const responses = await Promise.allSettled(
        combos.map(([f, t]) => doOneSearch(f, t, params.date, params.cabin, controller.signal)),
      );
      clearTimeout(timer);

      let firstData: SearchResponse | null = null;
      let allResults: FlightResult[] = [];
      for (const r of responses) {
        if (r.status === 'fulfilled') {
          firstData = firstData ?? r.value;
          if (Array.isArray(r.value.results)) allResults = allResults.concat(r.value.results);
        }
      }

      // Deduplicate by availability_id
      const seen = new Set<string>();
      const deduped = allResults.filter(r => {
        if (seen.has(r.availability_id)) return false;
        seen.add(r.availability_id);
        return true;
      });

      console.log('[flyAI] search results', deduped.length, 'across', combos.length, 'combo(s)');
      if (deduped.length > 0) {
        console.table(deduped.map(r => ({
          program: r.program_name, miles: r.miles, taxes_usd: r.taxes_usd,
          total_usd: r.arb_price_usd, cabin: r.cabin, direct: r.direct, airlines: r.airlines,
        })));
      }

      // Fire-and-forget analytics (first combo)
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin:        fromCodes[0],
          destination:   toCodes[0],
          date:          params.date,
          cabin:         params.cabin,
          results_count: deduped.length,
        }),
      }).catch(() => { /* ignore */ });

      if (responses.every(r => r.status === 'rejected')) {
        const msg = responses[0].status === 'rejected' ? String((responses[0] as PromiseRejectedResult).reason) : '';
        throw new Error(msg);
      }

      setResults(deduped);
      setSummary(firstData?.summary ?? '');
      setFlexDateInfo(firstData?.flex_date_info ?? null);
      setCabinFallbackInfo(firstData?.cabin_fallback_info ?? null);
      setView('results');
      setLoading(false);

      if (deduped.length === 0) {
        // No results on the exact date — search nearby dates (±3 days)
        setFlexLoading(true);
        setFlexResults([]);

        const baseDate = new Date(params.date);
        const nearbyDates: string[] = [];
        for (let delta = -3; delta <= 3; delta++) {
          if (delta === 0) continue;
          const d = new Date(baseDate);
          d.setUTCDate(d.getUTCDate() + delta);
          nearbyDates.push(d.toISOString().slice(0, 10));
        }

        const flexController = new AbortController();
        const flexTimer = setTimeout(() => flexController.abort(), 45000);

        Promise.allSettled(
          nearbyDates.flatMap(date =>
            combos.map(([f, t]) => doOneSearch(f, t, date, params.cabin, flexController.signal)
              .then(resp => resp.results?.map(r => ({ ...r, alt_date: true })) ?? [])
            )
          )
        ).then(flexResponses => {
          clearTimeout(flexTimer);
          const flexAll: FlightResult[] = [];
          const flexSeen = new Set<string>();
          for (const r of flexResponses) {
            if (r.status === 'fulfilled') {
              for (const result of r.value) {
                if (!flexSeen.has(result.availability_id)) {
                  flexSeen.add(result.availability_id);
                  flexAll.push(result);
                }
              }
            }
          }
          setFlexResults(flexAll);
          setFlexLoading(false);
        });
      } else {
        setFlexLoading(false);
        setFlexResults([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(
        msg.startsWith('Server error') ? msg :
        msg.includes('abort') || msg.includes('AbortError') ? 'Search timed out — the server took too long. Please try again.' :
        'Could not reach the flight server.'
      );
      setView('results');
      setLoading(false);
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'Search':
        if (booking) {
          return (
            <div className="flex flex-col items-center px-4 py-12 gap-8 w-full">
              <BookingPage
                result={booking.result}
                trip={booking.trip}
                onBack={() => setBooking(null)}
              />
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center px-4 py-10 gap-8 w-full">
            {view === 'search' ? (
              <>
                <SearchForm
                  onSearch={handleSearch}
                  loading={loading}
                  onOriginDetected={setDetectedOrigin}
                />
                <div className="w-full max-w-3xl flex flex-col gap-6">
                  <DestinationTiles originCode={detectedOrigin} onBook={tile => { const b = tileToBooking(tile); trackBooking(b.result, b.trip); setBooking(b); }} />
                  <DiscoverRows onBook={tile => { const b = tileToBooking(tile); trackBooking(b.result, b.trip); setBooking(b); }} />
                </div>
              </>
            ) : (
              <ResultsPanel
                results={results}
                summary={summary}
                error={error}
                searchParams={searchParams!}
                flexLoading={flexLoading}
                flexDateInfo={flexDateInfo}
                flexResults={flexResults}
                cabinFallbackInfo={cabinFallbackInfo}
                onBack={() => { setView('search'); setFlexLoading(false); setFlexResults([]); history.pushState(null, '', '/'); }}
                onBook={(result, trip) => { trackBooking(result, trip); setBooking({ result, trip }); }}
                onDateChange={date => handleSearch({ ...searchParams!, date })}
              />
            )}
          </div>
        );
      case 'AI Travel Agent':
        return <AIAgentPage />;
      case 'My Dashboard':
        if (!user) return <AuthPage onAuth={u => setUser(u)} />;
        return <DashboardPage user={user} onLogout={() => { clearStoredUser(); setUser(null); }} />;
      case 'Settings':
        return <EmptyPage title="Settings" description="Account preferences and API configuration will appear here." />;
      case 'Dev':
        return <DevPage />;
      case 'Analytics':
        return <AnalyticsPage />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isAdmin ? 'bg-[#0f0f1a]' : 'bg-[#EEEAE4]'}`}>
      <Nav current={page} onChange={setPage} isAdmin={isAdmin} />
      {renderPage()}
    </div>
  );
}

function EmptyPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-24 gap-3">
      <div className="text-lg font-semibold text-[#aaaaaa]">{title}</div>
      <div className="text-sm text-[#bbbbbb]">{description}</div>
    </div>
  );
}
