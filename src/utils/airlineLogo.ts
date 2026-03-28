/**
 * Returns a logo URL for an IATA airline code.
 * Uses Kiwi.com's public CDN which accepts IATA codes directly.
 */
export function airlineLogoUrl(iataCode: string): string {
  if (!iataCode) return '';
  return `https://images.kiwi.com/airlines/64/${iataCode.toUpperCase()}.png`;
}

const AIRLINE_NAMES: Record<string, string> = {
  // North America
  AA: 'American', DL: 'Delta', UA: 'United', B6: 'JetBlue',
  WN: 'Southwest', AS: 'Alaska', NK: 'Spirit', F9: 'Frontier',
  AC: 'Air Canada', WS: 'WestJet', PD: 'Porter',
  // Europe
  BA: 'British Airways', VS: 'Virgin Atlantic', LH: 'Lufthansa',
  LX: 'Swiss', OS: 'Austrian', SN: 'Brussels Airlines',
  EW: 'Eurowings', LO: 'LOT', AY: 'Finnair', SK: 'SAS',
  KL: 'KLM', AF: 'Air France', IB: 'Iberia', VY: 'Vueling',
  TP: 'TAP', A3: 'Aegean', AZ: 'ITA Airways',
  U2: 'easyJet', FR: 'Ryanair', W6: 'Wizz Air', HV: 'Transavia', DY: 'Norwegian',
  // Middle East & Africa
  EK: 'Emirates', EY: 'Etihad', QR: 'Qatar', FZ: 'flydubai',
  WY: 'Oman Air', GF: 'Gulf Air', SV: 'Saudia', RJ: 'Royal Jordanian',
  MS: 'EgyptAir', AT: 'Royal Air Maroc', ET: 'Ethiopian', KQ: 'Kenya Airways',
  // Asia Pacific
  SQ: 'Singapore Airlines', CX: 'Cathay Pacific', NH: 'ANA',
  JL: 'Japan Airlines', OZ: 'Asiana', KE: 'Korean Air',
  TK: 'Turkish', TG: 'Thai Airways', MH: 'Malaysia Airlines',
  GA: 'Garuda', PR: 'Philippine Airlines', VN: 'Vietnam Airlines',
  AI: 'Air India', BR: 'EVA Air', CI: 'China Airlines',
  CA: 'Air China', CZ: 'China Southern', MU: 'China Eastern',
  TR: 'Scoot', JQ: 'Jetstar', NZ: 'Air New Zealand',
  QF: 'Qantas', VA: 'Virgin Australia',
  // Latin America
  AM: 'Aeromexico', LA: 'LATAM', CM: 'Copa', AV: 'Avianca',
  G3: 'GOL', AD: 'Azul',
};

export function airlineName(iataCode: string): string {
  return AIRLINE_NAMES[iataCode.toUpperCase()] ?? iataCode;
}
