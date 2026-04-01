export type CabinClass = 'economy' | 'premium' | 'business' | 'first' | 'any';

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  cabin: CabinClass;
}

export interface BuyMilesInfo {
  program_name: string;
  buy_url: string;
  standard_cpp_usd: number;
  promo_cpp_usd: number;
  typical_promo_bonus: number;
  cost_at_standard: number;
  cost_at_promo: number;
  total_at_standard: number;
  total_at_promo: number;
  min_purchase: number;
  max_purchase: number;
  notes: string;
}

export interface FlightResult {
  availability_id: string;
  date: string;
  origin: string;
  destination: string;
  program: string;
  program_name: string;
  program_logo_url: string;
  carrier_logos: Record<string, string>;
  cabin: string;
  miles: number;
  taxes_usd: number;
  arb_miles_cost_usd: number;
  arb_miles_cost_promo_usd: number;
  arb_price_usd: number;
  arb_price_promo_usd: number;
  cash_price_usd: number | null;
  cash_price_source: string;
  savings_usd: number | null;
  value_ratio: number | null;
  google_flights_url: string;
  airlines: string;
  direct: boolean;
  remaining_seats: number;
  buy_miles_info: BuyMilesInfo | null;
  alt_date?: boolean;
}

export interface DiscoverTile {
  origin_code: string;
  origin_city: string;
  destination_code: string;
  destination_city: string;
  region: string;
  date: string;             // YYYY-MM-DD, nearest available
  cabin: string;            // economy | premium | business | first
  miles: number;
  taxes_usd: number;
  cash_fare_usd: number;
  savings_usd: number;
  buy_promo_usd?: number;           // cost of miles only at promo rate (current server name)
  arb_miles_cost_promo_usd?: number; // same, new naming convention
  departs_at?: string;      // ISO departure time (local) — fallback if no segments
  arrives_at?: string;      // ISO arrival time (local) — fallback if no segments
  aircraft_name?: string;   // fallback if no segments
  segments?: TripSegment[]; // per-leg breakdown (preferred over top-level fields)
  program: string;          // e.g. "aeroplan"
  program_name: string;     // e.g. "Air Canada Aeroplan"
  airlines: string;         // e.g. "LX, AC" — operating carriers
  direct: boolean;
  remaining_seats: number;
  availability_exists: boolean;
}

export interface DiscoverResponse {
  tiles: DiscoverTile[];
}

export interface FlexDateInfo {
  reason: 'no_results_on_date' | 'cheaper_nearby_date';
  searched_date: string;
  flex_range: string;
  message: string;
  best_price_on_date?: number;
  best_alt_price?: number;
}

export interface CabinFallbackInfo {
  reason: 'cabin_unavailable';
  requested_cabin: string;
  found_cabin: string;
  message: string;
}

export interface SearchResponse {
  summary: string;
  total_found: number;
  results: FlightResult[];
  flex_date_info?: FlexDateInfo | null;
  cabin_fallback_info?: CabinFallbackInfo | null;
  query: Record<string, unknown>;
}

export interface TripSegment {
  flight_number: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  duration_min?: number;   // authoritative leg duration — avoids cross-TZ calculation errors
  aircraft_code: string;
  aircraft_name: string;
  fare_class: string;
  airline_code: string;
  airline_logo: string;
}

export interface Trip {
  flight_numbers: string;
  departs_at: string;
  arrives_at: string;
  total_duration_min: number;
  stops: number;
  carriers: string;
  remaining_seats: number;
  segments: TripSegment[];
}

export interface TripsResponse {
  trips: Trip[];
}
