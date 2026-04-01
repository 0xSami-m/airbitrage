import { useState, useRef, useEffect } from 'react';
import type { SearchParams, CabinClass } from '../types';
import { findNearestAirport } from '../utils/nearestAirport';

interface Props {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
  onOriginDetected?: (code: string) => void;
}

const CABIN_OPTIONS: { value: CabinClass; label: string }[] = [
  { value: 'any',      label: 'Any cabin' },
  { value: 'economy',  label: 'Economy' },
  { value: 'premium',  label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first',    label: 'First' },
];

const CODE_TO_CITY: Record<string, string> = {
  // USA
  ATL: 'Atlanta', ORD: 'Chicago', MDW: 'Chicago Midway', DFW: 'Dallas', DAL: 'Dallas Love Field',
  DEN: 'Denver', LAX: 'Los Angeles', BUR: 'Los Angeles Burbank', LGB: 'Long Beach',
  JFK: 'New York', EWR: 'Newark', LGA: 'New York LaGuardia',
  SFO: 'San Francisco', OAK: 'Oakland', SJC: 'San Jose',
  SEA: 'Seattle', MIA: 'Miami', FLL: 'Fort Lauderdale', PBI: 'West Palm Beach',
  BOS: 'Boston', IAD: 'Washington DC', DCA: 'Washington DC Reagan', BWI: 'Baltimore',
  PHX: 'Phoenix', MSP: 'Minneapolis', DTW: 'Detroit', CLT: 'Charlotte',
  PHL: 'Philadelphia', LAS: 'Las Vegas', AUS: 'Austin', PDX: 'Portland',
  SLC: 'Salt Lake City', SAN: 'San Diego', TPA: 'Tampa', MCO: 'Orlando',
  IAH: 'Houston', HOU: 'Houston Hobby', MSY: 'New Orleans', STL: 'St Louis',
  BNA: 'Nashville', RDU: 'Raleigh', IND: 'Indianapolis', CMH: 'Columbus',
  MKE: 'Milwaukee', OMA: 'Omaha', KCI: 'Kansas City', ABQ: 'Albuquerque',
  TUC: 'Tucson', ELP: 'El Paso', ONT: 'Ontario CA', SMF: 'Sacramento',
  SNA: 'Orange County', HNL: 'Honolulu', OGG: 'Maui', KOA: 'Kona',
  ANC: 'Anchorage', FAI: 'Fairbanks', JNU: 'Juneau',
  BTV: 'Burlington', MHT: 'Manchester NH', PWM: 'Portland ME',
  ORF: 'Norfolk', RIC: 'Richmond', CHS: 'Charleston', SAV: 'Savannah',
  JAX: 'Jacksonville', RSW: 'Fort Myers', SRQ: 'Sarasota', PIE: 'St Petersburg',
  BHM: 'Birmingham', MEM: 'Memphis', LIT: 'Little Rock', OKC: 'Oklahoma City',
  TUL: 'Tulsa', DSM: 'Des Moines', MSN: 'Madison', GRR: 'Grand Rapids',
  CLE: 'Cleveland', PIT: 'Pittsburgh', BUF: 'Buffalo', SYR: 'Syracuse',
  ALB: 'Albany', ROC: 'Rochester', CVG: 'Cincinnati',
  // Canada
  YYZ: 'Toronto', YYC: 'Calgary', YVR: 'Vancouver', YUL: 'Montreal',
  YOW: 'Ottawa', YEG: 'Edmonton', YHZ: 'Halifax', YWG: 'Winnipeg',
  // Mexico & Caribbean
  MEX: 'Mexico City', CUN: 'Cancun', GDL: 'Guadalajara', MTY: 'Monterrey',
  PVR: 'Puerto Vallarta', SJD: 'Los Cabos', MZT: 'Mazatlan', OAX: 'Oaxaca',
  NAS: 'Nassau', MBJ: 'Montego Bay', KIN: 'Kingston', SJU: 'San Juan',
  STT: 'St Thomas', STX: 'St Croix', BGI: 'Barbados', ANU: 'Antigua',
  SXM: 'St Maarten', GCM: 'Grand Cayman', HAV: 'Havana', POP: 'Puerto Plata',
  PUJ: 'Punta Cana', SDQ: 'Santo Domingo', UVF: 'St Lucia', TAB: 'Tobago',
  POS: 'Port of Spain', GEO: 'Georgetown Guyana',
  // Central America
  PTY: 'Panama City', GUA: 'Guatemala City', SAL: 'San Salvador',
  SJO: 'San Jose', MGA: 'Managua', TGU: 'Tegucigalpa', BZE: 'Belize City',
  // South America
  BOG: 'Bogota', MDE: 'Medellin', CLO: 'Cali', CTG: 'Cartagena',
  GRU: 'Sao Paulo', GIG: 'Rio de Janeiro', BSB: 'Brasilia', SSA: 'Salvador',
  REC: 'Recife', FOR: 'Fortaleza', BEL: 'Belem', MAO: 'Manaus',
  EZE: 'Buenos Aires', AEP: 'Buenos Aires Aeroparque', MVD: 'Montevideo',
  SCL: 'Santiago', LIM: 'Lima', UIO: 'Quito', GYE: 'Guayaquil',
  CCS: 'Caracas', LPB: 'La Paz', VVI: 'Santa Cruz', ASU: 'Asuncion',
  // Europe
  LHR: 'London', LGW: 'London Gatwick', STN: 'London Stansted', LCY: 'London City',
  CDG: 'Paris', ORY: 'Paris Orly', AMS: 'Amsterdam',
  FRA: 'Frankfurt', MUC: 'Munich', TXL: 'Berlin', BER: 'Berlin Brandenburg',
  HAM: 'Hamburg', DUS: 'Dusseldorf', CGN: 'Cologne', STR: 'Stuttgart', NUE: 'Nuremberg',
  ZRH: 'Zurich', GVA: 'Geneva', BSL: 'Basel', VIE: 'Vienna',
  BRU: 'Brussels', MAD: 'Madrid', BCN: 'Barcelona', PMI: 'Palma de Mallorca',
  AGP: 'Malaga', ALC: 'Alicante', VLC: 'Valencia', SVQ: 'Seville',
  FCO: 'Rome', MXP: 'Milan', LIN: 'Milan Linate', VCE: 'Venice',
  NAP: 'Naples', BGY: 'Milan Bergamo', BLQ: 'Bologna', PSA: 'Pisa', CTA: 'Catania',
  CPH: 'Copenhagen', ARN: 'Stockholm', GOT: 'Gothenburg', HEL: 'Helsinki',
  OSL: 'Oslo', BGO: 'Bergen', TRD: 'Trondheim',
  LIS: 'Lisbon', OPO: 'Porto', FAO: 'Faro',
  ATH: 'Athens', SKG: 'Thessaloniki', HER: 'Heraklion', RHO: 'Rhodes',
  WAW: 'Warsaw', KRK: 'Krakow', PRG: 'Prague', BUD: 'Budapest',
  DUB: 'Dublin', SNN: 'Shannon', EDI: 'Edinburgh', GLA: 'Glasgow', MAN: 'Manchester',
  BHX: 'Birmingham UK', BRS: 'Bristol', NCL: 'Newcastle',
  BEG: 'Belgrade', ZAG: 'Zagreb', LJU: 'Ljubljana', SKP: 'Skopje',
  SOF: 'Sofia', OTP: 'Bucharest', KBP: 'Kyiv', RIX: 'Riga',
  TLL: 'Tallinn', VNO: 'Vilnius', SVO: 'Moscow', DME: 'Moscow Domodedovo',
  LED: 'St Petersburg', TBS: 'Tbilisi', EVN: 'Yerevan', ALA: 'Almaty',
  NIC: 'Nicosia', LCA: 'Larnaca',
  // Middle East
  DXB: 'Dubai', AUH: 'Abu Dhabi', DOH: 'Doha', IST: 'Istanbul', SAW: 'Istanbul Sabiha',
  TLV: 'Tel Aviv', AMM: 'Amman', BEY: 'Beirut', BAH: 'Bahrain',
  KWI: 'Kuwait City', MCT: 'Muscat', RUH: 'Riyadh', JED: 'Jeddah', DMM: 'Dammam',
  // Africa
  CAI: 'Cairo', CMN: 'Casablanca', TUN: 'Tunis', ALG: 'Algiers', TIP: 'Tripoli',
  NBO: 'Nairobi', EBB: 'Entebbe', DAR: 'Dar es Salaam', JRO: 'Kilimanjaro',
  JNB: 'Johannesburg', CPT: 'Cape Town', DUR: 'Durban', PLZ: 'Port Elizabeth',
  ADD: 'Addis Ababa', ACC: 'Accra', LOS: 'Lagos', ABV: 'Abuja',
  DKR: 'Dakar', ABJ: 'Abidjan', CMR: 'Yaounde', DLA: 'Douala',
  // South & Southeast Asia
  DEL: 'Delhi', BOM: 'Mumbai', BLR: 'Bangalore', MAA: 'Chennai',
  HYD: 'Hyderabad', CCU: 'Kolkata', COK: 'Kochi', AMD: 'Ahmedabad',
  CMB: 'Colombo', MLE: 'Male', KTM: 'Kathmandu', DAC: 'Dhaka',
  KHI: 'Karachi', LHE: 'Lahore', ISB: 'Islamabad',
  SIN: 'Singapore', KUL: 'Kuala Lumpur', BKK: 'Bangkok', DMK: 'Bangkok Don Mueang',
  CNX: 'Chiang Mai', HKT: 'Phuket', USM: 'Koh Samui',
  CGK: 'Jakarta', DPS: 'Bali', SUB: 'Surabaya', UPG: 'Makassar',
  MNL: 'Manila', CEB: 'Cebu', DVO: 'Davao',
  SGN: 'Ho Chi Minh City', HAN: 'Hanoi', DAD: 'Da Nang', CXR: 'Nha Trang',
  PNH: 'Phnom Penh', REP: 'Siem Reap', VTE: 'Vientiane', RGN: 'Yangon',
  // East Asia
  HKG: 'Hong Kong', NRT: 'Tokyo', HND: 'Tokyo Haneda', KIX: 'Osaka',
  NGO: 'Nagoya', FUK: 'Fukuoka', CTS: 'Sapporo',
  ICN: 'Seoul', GMP: 'Seoul Gimpo', PUS: 'Busan',
  PVG: 'Shanghai', PEK: 'Beijing', PKX: 'Beijing Daxing', CAN: 'Guangzhou',
  SZX: 'Shenzhen', CTU: 'Chengdu', CKG: 'Chongqing', XIY: 'Xian',
  HGH: 'Hangzhou', NKG: 'Nanjing', WUH: 'Wuhan', KMG: 'Kunming',
  TPE: 'Taipei', KHH: 'Kaohsiung',
  ULN: 'Ulaanbaatar',
  // Pacific & Oceania
  SYD: 'Sydney', MEL: 'Melbourne', BNE: 'Brisbane', PER: 'Perth',
  ADL: 'Adelaide', OOL: 'Gold Coast', CNS: 'Cairns', HBA: 'Hobart',
  AKL: 'Auckland', CHC: 'Christchurch', WLG: 'Wellington',
  NAN: 'Fiji', PPT: 'Tahiti', RAR: 'Rarotonga',
};

const ALL_AIRPORTS = Object.entries(CODE_TO_CITY).map(([code, city]) => ({
  code, city,
  label: `${city} (${code})`,
  search: `${city} ${code}`.toLowerCase(),
}));

function resolve(input: string): string {
  const up = input.trim().toUpperCase();
  if (CODE_TO_CITY[up]) return up;
  const match = ALL_AIRPORTS.find(a => a.search.startsWith(input.trim().toLowerCase()))
    ?? ALL_AIRPORTS.find(a => a.search.includes(input.trim().toLowerCase()));
  return match ? match.code : up;
}

// ── City autocomplete input ────────────────────────────────────────────────────
function CityInput({
  label, value, onChange, onCommit, placeholder, detecting,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCommit?: () => void;
  placeholder: string;
  detecting?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = value.length >= 1
    ? ALL_AIRPORTS.filter(a => a.search.includes(value.toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 px-6 py-4 flex flex-col justify-center min-w-0">
      <label className="text-[10px] uppercase tracking-widest text-[#AAAAAA] font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder={detecting ? 'Detecting…' : placeholder}
        required
        autoComplete="off"
        className="font-hand text-4xl font-bold text-[#1A1A1A] bg-transparent outline-none placeholder:text-[#CCCCCC] w-full truncate"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 bg-white border border-[#D4D0CB] rounded-xl shadow-lg overflow-hidden mt-1">
          {suggestions.map(s => (
            <button
              key={s.code}
              type="button"
              onMouseDown={() => {
                onChange(s.city);
                setOpen(false);
                onCommit?.();
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F5F3F0] transition flex items-center justify-between"
            >
              <span className="text-[#1A1A1A]">{s.city}</span>
              <span className="text-xs text-[#AAAAAA] font-mono">{s.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────────
export default function SearchForm({ onSearch, loading, onOriginDetected }: Props) {
  const [fromDisplay, setFromDisplay] = useState('');
  const [toDisplay,   setToDisplay]   = useState('');
  const [date,        setDate]        = useState('');
  const [cabin,       setCabin]       = useState<CabinClass>('business');
  const [detecting,   setDetecting]   = useState(false);

  const showDateSection = fromDisplay.trim().length > 1 && toDisplay.trim().length >= 3;

  // Detect location on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { code, city } = findNearestAirport(pos.coords.latitude, pos.coords.longitude);
        setFromDisplay(city);
        setDetecting(false);
        onOriginDetected?.(code);
      },
      () => setDetecting(false),
      { timeout: 8000 }
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const from = resolve(fromDisplay);
    const to   = resolve(toDisplay);
    if (from && to && date) onSearch({ from, to, date, cabin });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col gap-3">
      {/* Main search box */}
      <div className="bg-white rounded-2xl border border-[#D4D0CB] shadow-sm overflow-hidden">
        <div className="flex items-stretch">
          <CityInput
            label="From"
            value={fromDisplay}
            onChange={setFromDisplay}
            placeholder="Boston"
            detecting={detecting && !fromDisplay}
          />
          <div className="flex items-center px-2 border-l border-r border-dashed border-[#D4D0CB] shrink-0">
            <span className="text-[#AAAAAA] text-xl">→</span>
          </div>
          <CityInput
            label="To"
            value={toDisplay}
            onChange={setToDisplay}
            placeholder="Zurich"
          />
        </div>

      </div>

      {/* Date pill + search button — always in DOM, visible after 3 chars */}
      <div className={`flex gap-3 transition-all duration-200 ${showDateSection ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'}`}>
        <label className="flex-1 flex items-center justify-between bg-white border-2 border-[#1A1A1A] rounded-full px-6 py-4 cursor-pointer">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required={showDateSection}
            min={new Date().toISOString().split('T')[0]}
            className="font-hand text-2xl text-[#1A1A1A] bg-transparent outline-none w-full placeholder:text-[#AAAAAA] [color-scheme:light]"
            placeholder="When do you want to go?"
          />
          <svg className="text-[#888888] shrink-0 ml-3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </label>
        <label className="flex items-center gap-2 bg-white border-2 border-[#1A1A1A] rounded-full px-5 py-4 cursor-pointer">
          <select
            value={cabin}
            onChange={e => setCabin(e.target.value as CabinClass)}
            className="font-hand text-xl text-[#1A1A1A] bg-transparent outline-none cursor-pointer"
          >
            {CABIN_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className={`transition-all duration-200 ${showDateSection ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'}`}>
        <button
          type="submit"
          disabled={loading || !date}
          className="w-full bg-[#3DB551] hover:bg-[#35A348] disabled:bg-[#A8D9B0] text-white font-hand font-bold text-2xl py-3 rounded-2xl transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              Searching...
            </>
          ) : (
            'Yip Yip!'
          )}
        </button>
      </div>
    </form>
  );
}
