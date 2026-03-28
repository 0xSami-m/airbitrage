import { useState } from 'react';
import './index.css';
import Nav, { type Page } from './components/Nav';
import SearchForm from './components/SearchForm';
import ResultsPanel from './components/ResultsPanel';
import DiscoverPage, { DiscoverRows } from './components/DiscoverPage';
import AIAgentPage from './components/AIAgentPage';
import DashboardPage from './components/DashboardPage';
import DevPage from './components/DevPage';
import BookingPage from './components/BookingPage';
import type { FlightResult, SearchParams, SearchResponse, Trip } from './types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8787';

type View = 'search' | 'results';

export default function App() {
  const [page, setPage] = useState<Page>('Search');
  const [view, setView] = useState<View>('search');
  const [loading, setLoading] = useState(false);
  const [flexLoading, setFlexLoading] = useState(false);
  const [results, setResults] = useState<FlightResult[]>([]);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [booking, setBooking] = useState<{ result: FlightResult; trip: Trip } | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setFlexLoading(false);
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
      setResults(Array.isArray(data.results) ? data.results : []);
      setSummary(data.summary ?? '');
      setView('results');
      setLoading(false);

      // Phase 2: silently search ±3 days for better deals
      const minMiles = data.results.length > 0
        ? Math.min(...data.results.map(r => r.miles))
        : 0;
      if (minMiles > 0) {
        setFlexLoading(true);
        fetch(`${API_BASE}/api/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, flex_only: true, min_miles: Math.floor(minMiles * 0.75) }),
        })
          .then(r => r.ok ? r.json() : null)
          .then((flexData: SearchResponse | null) => {
            if (flexData?.results?.length) {
              setResults(prev => [...prev, ...flexData.results]);
            }
          })
          .catch(() => {/* best-effort */})
          .finally(() => setFlexLoading(false));
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
          <div className="flex flex-col items-center px-4 py-12 gap-8 w-full">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-[#555555] tracking-tight">
                ✈ A(i)rbitrage
              </h1>
              <p className="text-[#aaaaaa] mt-2 text-base">
                Search the best points &amp; miles redemptions across all programs
              </p>
            </div>
            {view === 'search' ? (
              <>
                <SearchForm onSearch={handleSearch} loading={loading} />
                <div className="w-full max-w-5xl">
                  <DiscoverRows />
                </div>
              </>
            ) : (
              <ResultsPanel
                results={results}
                summary={summary}
                error={error}
                searchParams={searchParams!}
                flexLoading={flexLoading}
                onBack={() => { setView('search'); setFlexLoading(false); }}
                onBook={(result, trip) => setBooking({ result, trip })}
              />
            )}
          </div>
        );
      case 'Discover':
        return <DiscoverPage />;
      case 'AI Travel Agent':
        return <AIAgentPage />;
      case 'My Dashboard':
        return <DashboardPage />;
      case 'Settings':
        return <EmptyPage title="Settings" description="Account preferences and API configuration will appear here." />;
      case 'Dev':
        return <DevPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#DFD9D9] flex flex-col">
      <Nav current={page} onChange={setPage} />
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
