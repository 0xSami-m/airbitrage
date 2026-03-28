// Dev sandbox — real API data frozen on 2026-03-24
// Edit mock data below to iterate on FlightCard UI without running a search.
import FlightCard from './FlightCard';
import type { FlightResult, Trip } from '../types';

// ── PTY → CUR · 2026-03-26 · Flying Blue (best promo find) ───────────────
const PTY_CUR_RESULT: FlightResult = {
  availability_id: '2xI4SlhQwxXFW7H7DFvq5KHmsCd',
  date: '2026-03-26',
  origin: 'PTY',
  destination: 'CUR',
  program: 'flyingblue',
  program_name: 'Air France/KLM Flying Blue',
  program_logo_url: 'https://logo.clearbit.com/flyingblue.com',
  carrier_logos: { CM: 'https://logo.clearbit.com/copa.com' },
  cabin: 'business',
  miles: 23000,
  taxes_usd: 87.45,
  arb_miles_cost_usd: 460.0,
  arb_miles_cost_promo_usd: 328.9,
  arb_price_usd: 547.45,
  arb_price_promo_usd: 416.35,
  cash_price_usd: 620,
  cash_price_source: 'google_flights',
  savings_usd: 204,
  value_ratio: 1.5,
  google_flights_url: 'https://www.google.com/travel/flights?q=one+way+nonstop+business+class+flight+PTY+to+CUR+2026-03-26&curr=USD',
  airlines: 'CM',
  direct: true,
  remaining_seats: 9,
  buy_miles_info: {
    program_name: 'Air France/KLM Flying Blue',
    buy_url: 'https://flyingblue.com/buy-miles',
    standard_cpp_usd: 2.0,
    promo_cpp_usd: 1.43,
    typical_promo_bonus: 40,
    cost_at_standard: 460.0,
    cost_at_promo: 328.9,
    total_at_standard: 547.45,
    total_at_promo: 416.35,
    min_purchase: 2000,
    max_purchase: 200000,
    notes: 'Monthly Promo Awards offer 25-50% off redemptions — better than buying miles.',
  },
};

const PTY_CUR_TRIPS: Trip[] = [
  {
    flight_numbers: 'CM288',
    departs_at: '2026-03-26T09:09:00Z',
    arrives_at: '2026-03-26T12:11:00Z',
    total_duration_min: 122,
    stops: 0,
    carriers: 'CM',
    remaining_seats: 9,
    segments: [
      {
        flight_number: 'CM288',
        origin: 'PTY',
        destination: 'CUR',
        departs_at: '2026-03-26T09:09:00Z',
        arrives_at: '2026-03-26T12:11:00Z',
        duration_min: 122,
        aircraft_code: '7M8',
        aircraft_name: 'Boeing 737 MAX 8',
        fare_class: 'I',
        airline_code: 'CM',
        airline_logo: 'https://logo.clearbit.com/copa.com',
      },
    ],
  },
  {
    flight_numbers: 'CM832',
    departs_at: '2026-03-26T11:29:00Z',
    arrives_at: '2026-03-26T14:32:00Z',
    total_duration_min: 123,
    stops: 0,
    carriers: 'CM',
    remaining_seats: 9,
    segments: [
      {
        flight_number: 'CM832',
        origin: 'PTY',
        destination: 'CUR',
        departs_at: '2026-03-26T11:29:00Z',
        arrives_at: '2026-03-26T14:32:00Z',
        duration_min: 123,
        aircraft_code: '7M9',
        aircraft_name: 'Boeing 737 MAX 9',
        fare_class: 'I',
        airline_code: 'CM',
        airline_logo: 'https://logo.clearbit.com/copa.com',
      },
    ],
  },
];

// ── BOS → ZRH · 2026-04-10 · Lufthansa Miles & More ─────────────────────
const BOS_ZRH_RESULT: FlightResult = {
  availability_id: '2vu4YJqtxFD7ug5JVUNR2kCWFXA',
  date: '2026-04-10',
  origin: 'BOS',
  destination: 'ZRH',
  program: 'lufthansa',
  program_name: 'Lufthansa Miles & More',
  program_logo_url: 'https://logo.clearbit.com/miles-and-more.com',
  carrier_logos: {
    AC: 'https://logo.clearbit.com/aircanada.com',
    BT: 'https://logo.clearbit.com/airbaltic.com',
    LH: 'https://logo.clearbit.com/lufthansa.com',
    LX: 'https://logo.clearbit.com/swiss.com',
  },
  cabin: 'business',
  miles: 95985,
  taxes_usd: 1304.5,
  arb_miles_cost_usd: 1631.74,
  arb_miles_cost_promo_usd: 1209.41,
  arb_price_usd: 2936.24,
  arb_price_promo_usd: 2513.91,
  cash_price_usd: 4200,
  cash_price_source: 'google_flights',
  savings_usd: 1686,
  value_ratio: 1.6,
  google_flights_url: 'https://www.google.com/travel/flights?q=one+way+nonstop+business+class+flight+BOS+to+ZRH+2026-04-10&curr=USD',
  airlines: 'LH, LX',
  direct: true,
  remaining_seats: 5,
  buy_miles_info: {
    program_name: 'Lufthansa Miles & More',
    buy_url: 'https://www.miles-and-more.com/row/en/earn/buy-miles.html',
    standard_cpp_usd: 1.7,
    promo_cpp_usd: 1.26,
    typical_promo_bonus: 35,
    cost_at_standard: 1631.74,
    cost_at_promo: 1209.41,
    total_at_standard: 2936.24,
    total_at_promo: 2513.91,
    min_purchase: 2000,
    max_purchase: 100000,
    notes: 'Infrequent promos. Best used for Star Alliance premium cabin sweet spots.',
  },
};

const BOS_ZRH_TRIPS: Trip[] = [
  {
    flight_numbers: 'LH423, LX1069',
    departs_at: '2026-04-10T17:45:00Z',
    arrives_at: '2026-04-11T09:45:00Z',
    total_duration_min: 720,
    stops: 1,
    carriers: 'LH, LX',
    remaining_seats: 2,
    segments: [
      {
        flight_number: 'LH423',
        origin: 'BOS',
        destination: 'FRA',
        departs_at: '2026-04-10T17:45:00Z',
        arrives_at: '2026-04-11T06:50:00Z',
        duration_min: 425,
        aircraft_code: '744',
        aircraft_name: 'Boeing 747-400',
        fare_class: 'C',
        airline_code: 'LH',
        airline_logo: 'https://logo.clearbit.com/lufthansa.com',
      },
      {
        flight_number: 'LX1069',
        origin: 'FRA',
        destination: 'ZRH',
        departs_at: '2026-04-11T08:50:00Z',
        arrives_at: '2026-04-11T09:45:00Z',
        duration_min: 55,
        aircraft_code: '223',
        aircraft_name: 'Airbus A220',
        fare_class: 'C',
        airline_code: 'LX',
        airline_logo: 'https://logo.clearbit.com/swiss.com',
      },
    ],
  },
  {
    flight_numbers: 'LH425, BT1107',
    departs_at: '2026-04-10T20:05:00Z',
    arrives_at: '2026-04-11T20:05:00Z',
    total_duration_min: 1080,
    stops: 1,
    carriers: 'LH, BT',
    remaining_seats: 0,
    segments: [
      {
        flight_number: 'LH425',
        origin: 'BOS',
        destination: 'MUC',
        departs_at: '2026-04-10T20:05:00Z',
        arrives_at: '2026-04-11T09:25:00Z',
        duration_min: 440,
        aircraft_code: '388',
        aircraft_name: 'Airbus A380-800',
        fare_class: 'C',
        airline_code: 'LH',
        airline_logo: 'https://logo.clearbit.com/lufthansa.com',
      },
      {
        flight_number: 'BT1107',
        origin: 'MUC',
        destination: 'ZRH',
        departs_at: '2026-04-11T19:05:00Z',
        arrives_at: '2026-04-11T20:05:00Z',
        duration_min: 60,
        aircraft_code: '223',
        aircraft_name: 'Airbus A220',
        fare_class: 'C',
        airline_code: 'BT',
        airline_logo: 'https://logo.clearbit.com/airbaltic.com',
      },
    ],
  },
];

export default function DevPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-[#444444]">FlightCard Dev Sandbox</h2>
        <p className="text-sm text-[#aaaaaa] mt-1">
          Real API data frozen 2026-03-24. Edit <code>DevPage.tsx</code> to iterate on the UI.
        </p>
      </div>
      <FlightCard result={PTY_CUR_RESULT} mockTrips={PTY_CUR_TRIPS} />
      <FlightCard result={BOS_ZRH_RESULT} mockTrips={BOS_ZRH_TRIPS} />
    </div>
  );
}
