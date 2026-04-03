import { useState } from 'react';
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
    arb_price_usd: dealPrice + tile.taxes_usd,
    arb_price_promo_usd: dealPrice + tile.taxes_usd,
    cash_price_usd: tile.cash_fare_usd || null,
    cash_price_source: '',
    savings_usd: tile.savings_usd,
    value_ratio: tile.cash_fare_usd > 0 && dealPrice + tile.taxes_usd > 0
      ? tile.cash_fare_usd / (dealPrice + tile.taxes_usd) : null,
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

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8787';

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

export default function App() {
  const [page, setPage] = useState<Page>(isAdmin ? 'Analytics' : 'Search');
  const [view, setView] = useState<View>('search');
  const [loading, setLoading] = useState(false);
  const [flexLoading, setFlexLoading] = useState(false);
  const [flexDateInfo, setFlexDateInfo] = useState<import('./types').FlexDateInfo | null>(null);
  const [cabinFallbackInfo, setCabinFallbackInfo] = useState<import('./types').CabinFallbackInfo | null>(null);
  const [results, setResults] = useState<FlightResult[]>([]);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [booking, setBooking] = useState<{ result: FlightResult; trip: Trip } | null>(null);
  const [detectedOrigin, setDetectedOrigin] = useState('');

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setFlexLoading(false);
    setFlexDateInfo(null);
    setCabinFallbackInfo(null);
    setSearchParams(params);
    setError('');

    const body = {
      origin: params.from,
      destination: params.to,
      date_from: params.date,
      date_to: params.date,
      cabin: params.cabin === 'any' ? undefined : params.cabin,
    };

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);

      const res = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data: SearchResponse = await res.json();
      console.log('[flyAI] search results', data);
      // Fire-and-forget analytics tracking
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin:        params.from,
          destination:   params.to,
          date:          params.date,
          cabin:         params.cabin,
          results_count: Array.isArray(data.results) ? data.results.length : 0,
        }),
      }).catch(() => { /* ignore */ });
      if (Array.isArray(data.results) && data.results.length > 0) {
        console.table(data.results.map(r => ({
          program: r.program_name,
          miles: r.miles,
          taxes_usd: r.taxes_usd,
          total_usd: r.arb_price_usd,
          cabin: r.cabin,
          direct: r.direct,
          airlines: r.airlines,
        })));
      }
      setResults(Array.isArray(data.results) ? data.results : []);
      setSummary(data.summary ?? '');
      setFlexDateInfo(data.flex_date_info ?? null);
      setCabinFallbackInfo(data.cabin_fallback_info ?? null);
      setView('results');
      setLoading(false);
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
                cabinFallbackInfo={cabinFallbackInfo}
                onBack={() => { setView('search'); setFlexLoading(false); }}
                onBook={(result, trip) => { trackBooking(result, trip); setBooking({ result, trip }); }}
                onDateChange={date => handleSearch({ ...searchParams!, date })}
              />
            )}
          </div>
        );
      case 'AI Travel Agent':
        return <AIAgentPage />;
      case 'My Dashboard':
        return <DashboardPage />;
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
