export const AIRPORT_COORDS: Record<string, { lat: number; lng: number; city: string }> = {
  // North America
  BOS: { lat: 42.37, lng: -71.01, city: 'Boston' },
  JFK: { lat: 40.64, lng: -73.78, city: 'New York' },
  EWR: { lat: 40.69, lng: -74.17, city: 'Newark' },
  LGA: { lat: 40.78, lng: -73.87, city: 'New York' },
  LAX: { lat: 33.94, lng: -118.41, city: 'Los Angeles' },
  SFO: { lat: 37.62, lng: -122.38, city: 'San Francisco' },
  ORD: { lat: 41.97, lng: -87.91, city: 'Chicago' },
  MIA: { lat: 25.80, lng: -80.28, city: 'Miami' },
  ATL: { lat: 33.64, lng: -84.43, city: 'Atlanta' },
  SEA: { lat: 47.45, lng: -122.31, city: 'Seattle' },
  DFW: { lat: 32.90, lng: -97.04, city: 'Dallas' },
  DEN: { lat: 39.86, lng: -104.67, city: 'Denver' },
  IAD: { lat: 38.94, lng: -77.46, city: 'Washington DC' },
  DCA: { lat: 38.85, lng: -77.04, city: 'Washington DC' },
  LAS: { lat: 36.08, lng: -115.15, city: 'Las Vegas' },
  PHX: { lat: 33.44, lng: -112.01, city: 'Phoenix' },
  MSP: { lat: 44.88, lng: -93.22, city: 'Minneapolis' },
  DTW: { lat: 42.21, lng: -83.35, city: 'Detroit' },
  CLT: { lat: 35.21, lng: -80.94, city: 'Charlotte' },
  PHL: { lat: 39.87, lng: -75.24, city: 'Philadelphia' },
  AUS: { lat: 30.20, lng: -97.67, city: 'Austin' },
  PDX: { lat: 45.59, lng: -122.60, city: 'Portland' },
  SAN: { lat: 32.73, lng: -117.19, city: 'San Diego' },
  YYZ: { lat: 43.68, lng: -79.63, city: 'Toronto' },
  YVR: { lat: 49.19, lng: -123.18, city: 'Vancouver' },
  YUL: { lat: 45.47, lng: -73.74, city: 'Montreal' },
  MEX: { lat: 19.44, lng: -99.07, city: 'Mexico City' },
  CUN: { lat: 21.04, lng: -86.87, city: 'Cancun' },
  // South America
  GRU: { lat: -23.43, lng: -46.47, city: 'São Paulo' },
  EZE: { lat: -34.82, lng: -58.54, city: 'Buenos Aires' },
  BOG: { lat: 4.70,  lng: -74.15, city: 'Bogotá' },
  LIM: { lat: -12.02, lng: -77.11, city: 'Lima' },
  // Europe
  LHR: { lat: 51.48, lng: -0.45, city: 'London' },
  LGW: { lat: 51.15, lng: -0.18, city: 'London' },
  STN: { lat: 51.88, lng:  0.24, city: 'London' },
  CDG: { lat: 49.01, lng:  2.55, city: 'Paris' },
  ORY: { lat: 48.72, lng:  2.36, city: 'Paris' },
  AMS: { lat: 52.31, lng:  4.77, city: 'Amsterdam' },
  FRA: { lat: 50.04, lng:  8.56, city: 'Frankfurt' },
  MUC: { lat: 48.35, lng: 11.79, city: 'Munich' },
  ZRH: { lat: 47.46, lng:  8.55, city: 'Zurich' },
  VIE: { lat: 48.11, lng: 16.57, city: 'Vienna' },
  BRU: { lat: 50.90, lng:  4.48, city: 'Brussels' },
  MAD: { lat: 40.47, lng: -3.56, city: 'Madrid' },
  BCN: { lat: 41.30, lng:  2.08, city: 'Barcelona' },
  FCO: { lat: 41.80, lng: 12.25, city: 'Rome' },
  MXP: { lat: 45.63, lng:  8.72, city: 'Milan' },
  CPH: { lat: 55.62, lng: 12.66, city: 'Copenhagen' },
  ARN: { lat: 59.65, lng: 17.92, city: 'Stockholm' },
  OSL: { lat: 60.19, lng: 11.10, city: 'Oslo' },
  HEL: { lat: 60.32, lng: 24.96, city: 'Helsinki' },
  LIS: { lat: 38.78, lng: -9.14, city: 'Lisbon' },
  ATH: { lat: 37.94, lng: 23.95, city: 'Athens' },
  DUB: { lat: 53.42, lng: -6.27, city: 'Dublin' },
  EDI: { lat: 55.95, lng: -3.37, city: 'Edinburgh' },
  PRG: { lat: 50.10, lng: 14.26, city: 'Prague' },
  WAW: { lat: 52.17, lng: 20.97, city: 'Warsaw' },
  BUD: { lat: 47.44, lng: 19.26, city: 'Budapest' },
  // Middle East
  DXB: { lat: 25.25, lng: 55.36, city: 'Dubai' },
  AUH: { lat: 24.43, lng: 54.65, city: 'Abu Dhabi' },
  DOH: { lat: 25.27, lng: 51.61, city: 'Doha' },
  IST: { lat: 41.26, lng: 28.75, city: 'Istanbul' },
  TLV: { lat: 32.01, lng: 34.89, city: 'Tel Aviv' },
  // Africa
  CAI: { lat: 30.12, lng: 31.41, city: 'Cairo' },
  JNB: { lat: -26.14, lng: 28.24, city: 'Johannesburg' },
  CPT: { lat: -33.97, lng: 18.60, city: 'Cape Town' },
  NBO: { lat: -1.32,  lng: 36.93, city: 'Nairobi' },
  ADD: { lat:  8.98,  lng: 38.80, city: 'Addis Ababa' },
  // Asia
  SIN: { lat:  1.36, lng: 103.99, city: 'Singapore' },
  HKG: { lat: 22.31, lng: 113.91, city: 'Hong Kong' },
  NRT: { lat: 35.77, lng: 140.39, city: 'Tokyo' },
  HND: { lat: 35.55, lng: 139.78, city: 'Tokyo' },
  ICN: { lat: 37.46, lng: 126.44, city: 'Seoul' },
  PVG: { lat: 31.14, lng: 121.81, city: 'Shanghai' },
  PEK: { lat: 40.08, lng: 116.58, city: 'Beijing' },
  BKK: { lat: 13.68, lng: 100.75, city: 'Bangkok' },
  KUL: { lat:  2.74, lng: 101.71, city: 'Kuala Lumpur' },
  DEL: { lat: 28.56, lng:  77.10, city: 'Delhi' },
  BOM: { lat: 19.09, lng:  72.87, city: 'Mumbai' },
  // Oceania
  SYD: { lat: -33.95, lng: 151.18, city: 'Sydney' },
  MEL: { lat: -37.67, lng: 144.84, city: 'Melbourne' },
  AKL: { lat: -37.01, lng: 174.79, city: 'Auckland' },
};

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestAirport(lat: number, lng: number): { code: string; city: string } {
  let best = { code: 'JFK', city: 'New York' };
  let minDist = Infinity;
  for (const [code, ap] of Object.entries(AIRPORT_COORDS)) {
    const d = haversine(lat, lng, ap.lat, ap.lng);
    if (d < minDist) { minDist = d; best = { code, city: ap.city }; }
  }
  return best;
}
