import { useState, useEffect } from 'react';
import { geoNaturalEarth1, geoPath, geoGraticule } from 'd3-geo';
import { feature } from 'topojson-client';
import type { AuthUser } from './AuthPage';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const WIDTH = 960;
const HEIGHT = 500;

const projection = geoNaturalEarth1()
  .scale(153)
  .translate([WIDTH / 2, HEIGHT / 2]);

const pathGen = geoPath(projection);

// IATA code → [longitude, latitude]
const AIRPORT_COORDS: Record<string, [number, number]> = {
  // Northeast US
  JFK: [-73.7789, 40.6397], EWR: [-74.1745, 40.6895], LGA: [-73.8726, 40.7773],
  BOS: [-71.0052, 42.3643], PVD: [-71.4281, 41.7243], BDL: [-72.6832, 41.9389],
  MHT: [-71.4357, 42.9326], PWM: [-70.3094, 43.6462], BTV: [-73.1533, 44.7200],
  ALB: [-73.8017, 42.7483], SYR: [-76.1063, 43.1112], BUF: [-78.7322, 42.9405],
  ROC: [-77.6724, 43.1189], HPN: [-73.7076, 41.0670],
  PHL: [-75.2411, 39.8719], DCA: [-77.0377, 38.8521], IAD: [-77.4558, 38.9445],
  BWI: [-76.6683, 39.1754], RIC: [-77.3197, 37.5052], ORF: [-76.0356, 36.8976],
  // Southeast US
  ATL: [-84.4277, 33.6407], CLT: [-80.9431, 35.2140], RDU: [-78.7875, 35.8776],
  MIA: [-80.2870, 25.7959], FLL: [-80.1527, 26.0726], MCO: [-81.3090, 28.4294],
  TPA: [-82.5332, 27.9755], RSW: [-81.7552, 26.5362], PBI: [-80.0956, 26.6832],
  JAX: [-81.6879, 30.4941], SAV: [-81.2021, 32.1276], CHS: [-80.0406, 32.8987],
  MSY: [-90.2590, 29.9934], BNA: [-86.6782, 36.1245], BHM: [-86.7535, 33.5629],
  MEM: [-89.9767, 35.0424], GSP: [-82.2190, 34.8957], GSO: [-79.9373, 36.0978],
  // Midwest US
  ORD: [-87.9073, 41.9742], MDW: [-87.7524, 41.7868], MKE: [-87.8965, 42.9472],
  MSP: [-93.2218, 44.8848], DTW: [-83.3534, 42.2124], CLE: [-81.8498, 41.4117],
  IND: [-86.2944, 39.7173], CMH: [-82.8919, 39.9980], CVG: [-84.6678, 39.0488],
  SDF: [-85.7360, 38.1744], STL: [-90.3700, 38.7487], MCI: [-94.7139, 39.2976],
  OMA: [-95.8941, 41.3032], DSM: [-93.6631, 41.5340], MSN: [-89.3375, 43.1399],
  // South / Southwest US
  DFW: [-97.0380, 32.8998], IAH: [-95.3414, 29.9902], AUS: [-97.6699, 30.1975],
  SAT: [-98.4698, 29.5337], HOU: [-95.2789, 29.6454], ELP: [-106.3777, 31.8072],
  TUL: [-95.8881, 36.1984], OKC: [-97.6007, 35.3931], ABQ: [-106.6097, 35.0402],
  // Mountain / West US
  DEN: [-104.6737, 39.8561], SLC: [-111.9779, 40.7884], PHX: [-112.0116, 33.4373],
  TUS: [-110.9410, 32.1161], LAS: [-115.1522, 36.0840], BOI: [-116.2230, 43.5644],
  RNO: [-119.7678, 39.4991], GEG: [-117.5340, 47.6199],
  // West Coast US
  LAX: [-118.4085, 33.9425], SFO: [-122.3790, 37.6190], SJC: [-121.9290, 37.3626],
  OAK: [-122.2208, 37.7213], SMF: [-121.5908, 38.6954], SAN: [-117.1896, 32.7336],
  SNA: [-117.8681, 33.6757], BUR: [-118.3590, 34.2007], LGB: [-118.1517, 33.8177],
  SEA: [-122.3088, 47.4502], PDX: [-122.5975, 45.5887],
  // Hawaii & Alaska
  HNL: [-157.9224, 21.3187], OGG: [-156.4300, 20.8986], KOA: [-156.0456, 19.7388],
  ANC: [-149.9961, 61.1744], FAI: [-147.8561, 64.8151],
  // Canada
  YYZ: [-79.6248, 43.6772], YVR: [-123.1839, 49.1939], YUL: [-73.7408, 45.4706],
  YYC: [-114.0200, 51.1281], YOW: [-75.6692, 45.3225], YHZ: [-63.5086, 44.8808],
  YEG: [-113.5800, 53.3097], YWG: [-97.2399, 49.9100],
  // Mexico / Caribbean / Central America
  MEX: [-99.0721, 19.4363], CUN: [-86.8770, 21.0366], GDL: [-103.3106, 20.5218],
  MTY: [-100.1069, 25.7785], SJD: [-109.7210, 23.1518], PVR: [-105.2544, 20.6801],
  PTY: [-79.3835, 9.0714], SJO: [-84.2088, 9.9939], SJU: [-66.0018, 18.4394],
  NAS: [-77.4662, 25.0390], MBJ: [-77.9135, 18.5037], KIN: [-76.7875, 17.9357],
  CUR: [-68.9598, 12.1889],
  // South America
  GRU: [-46.4731, -23.4356], GIG: [-43.2505, -22.8100], BSB: [-47.9208, -15.8711],
  FOR: [-38.5326, -3.7763], REC: [-34.9231, -8.1265], POA: [-51.1714, -29.9944],
  BOG: [-74.1469, 4.7016], UIO: [-78.3576, -0.1292], GYE: [-79.8836, -2.1574],
  LIM: [-77.1143, -12.0219], SCL: [-70.7858, -33.3930], EZE: [-58.5358, -34.8222],
  MVD: [-56.0308, -34.8384], CCS: [-66.9908, 10.6012],
  // UK & Ireland
  LHR: [-0.4543, 51.4775], LGW: [-0.1821, 51.1537], LCY: [-0.0553, 51.5048],
  LTN: [-0.3683, 51.8747], STN: [0.2350, 51.8850], MAN: [-2.2750, 53.3537],
  BHX: [-1.7480, 52.4539], BRS: [-2.7191, 51.3827], EDI: [-3.3725, 55.9500],
  GLA: [-4.4330, 55.8719], DUB: [-6.2700, 53.4213],
  // Western Europe
  CDG: [2.5479, 49.0097], ORY: [2.3794, 48.7233], LYS: [5.0810, 45.7256],
  NCE: [7.2159, 43.6584], MRS: [5.2214, 43.4393], BOD: [-0.7156, 44.8283],
  TLS: [1.3638, 43.6293], NTE: [-1.6103, 47.1532],
  AMS: [4.7641, 52.3086], BRU: [4.4844, 50.9014],
  FRA: [8.5706, 50.0333], MUC: [11.7861, 48.3538], BER: [13.5033, 52.3667],
  DUS: [6.7668, 51.2895], HAM: [9.9882, 53.6304], CGN: [7.1427, 50.8659],
  STR: [9.2220, 48.6900], NUE: [11.0669, 49.4987],
  ZRH: [8.5492, 47.4647], GVA: [6.1092, 46.2380], BSL: [7.5299, 47.5896],
  VIE: [16.5697, 48.1103], SZG: [13.0043, 47.7933], INN: [11.3440, 47.2602],
  LIS: [-9.1354, 38.7742], OPO: [-8.6814, 41.2481], FAO: [-7.9659, 37.0144],
  // Southern Europe
  BCN: [2.0785, 41.2971], MAD: [-3.5673, 40.4719], VLC: [-0.4815, 39.4893],
  AGP: [-4.4992, 36.6749], PMI: [2.7388, 39.5517], BIO: [-2.9106, 43.3011],
  FCO: [12.2389, 41.8003], MXP: [8.7231, 45.6306], VCE: [12.3519, 45.5053],
  VRN: [10.8885, 45.3957],
  NAP: [14.2908, 40.8860], PSA: [10.3927, 43.6839], BLQ: [11.2888, 44.5354],
  FLR: [11.2051, 43.8100], CTA: [15.0664, 37.4668], PMO: [13.1010, 38.1759],
  ATH: [23.9445, 37.9364], SKG: [22.9709, 40.5197], HER: [25.1803, 35.3397],
  IST: [28.8141, 40.9769], AYT: [30.8005, 36.8987],
  // Northern Europe
  CPH: [12.6561, 55.6180], ARN: [17.9186, 59.6519], OSL: [11.1004, 60.1939],
  HEL: [24.9633, 60.3172], BGO: [5.2181, 60.2934], TRD: [10.9200, 63.4578],
  // Eastern Europe
  WAW: [14.1622, 52.1657], KRK: [19.7848, 50.0778], GDN: [18.4662, 54.3776],
  PRG: [14.2600, 50.1008], BUD: [19.2556, 47.4298], BEG: [20.3091, 44.8184],
  OTP: [26.0851, 44.5722], SOF: [23.4114, 42.6952], ZAG: [16.0688, 45.7429],
  LJU: [14.4576, 46.2237], TIA: [19.7206, 41.4147], SKP: [21.6214, 41.9616],
  KBP: [30.8947, 50.3450],
  // Middle East
  DXB: [55.3644, 25.2532], AUH: [54.6511, 24.4330], DOH: [51.6138, 25.2731],
  RUH: [46.6987, 24.9576], JED: [39.1565, 21.6796], DMM: [49.7979, 26.4712],
  KWI: [47.9688, 29.2267], BAH: [50.6336, 26.2708], MCT: [58.2840, 23.5933],
  AMM: [35.9932, 31.7226], BEY: [35.4884, 33.8209], TLV: [34.8854, 32.0114],
  // South Asia
  DEL: [77.1031, 28.5665], BOM: [72.8679, 19.0887], BLR: [77.7063, 13.1979],
  MAA: [80.1693, 12.9900], HYD: [78.4298, 17.2313], CCU: [88.4467, 22.6547],
  COK: [76.2701, 10.1520], CMB: [79.8853, 7.1800], DAC: [90.3978, 23.8433],
  KHI: [67.1609, 24.9065], LHE: [74.4036, 31.5216], ISB: [72.8566, 33.6167],
  KTM: [85.3592, 27.6966],
  // East Asia
  NRT: [140.3864, 35.7653], HND: [139.7798, 35.5494], KIX: [135.2380, 34.4272],
  FUK: [130.4511, 33.5853], CTS: [141.6921, 42.7752], NGO: [136.8045, 34.8583],
  ICN: [126.4505, 37.4602], PUS: [128.9386, 35.1795],
  PEK: [116.5977, 40.0725], PVG: [121.8050, 31.1443], CAN: [113.2990, 23.3924],
  HKG: [113.9145, 22.3080], TPE: [121.2333, 25.0777], CTU: [103.9474, 30.5785],
  KMG: [102.9291, 24.9921], XIY: [108.7519, 34.4471], SZX: [113.8107, 22.6393],
  // Southeast Asia
  SIN: [103.9915, 1.3644], KUL: [101.7098, 2.7456], BKK: [100.7501, 13.6811],
  HAN: [105.8067, 21.2212], SGN: [106.6520, 10.8188], CGK: [106.6558, -6.1255],
  MNL: [121.0197, 14.5086], RGN: [96.1332, 16.9073], REP: [103.8127, 13.4107],
  PNH: [104.8440, 11.5466], VTE: [102.5633, 17.9883], DAD: [108.1993, 16.0439],
  DPS: [115.1670, -8.7482], SUB: [112.7869, -7.3798],
  // Pacific / Oceania
  SYD: [151.1772, -33.9461], MEL: [144.8410, -37.6690], BNE: [153.1175, -27.3842],
  PER: [115.9672, -31.9403], ADL: [138.5302, -34.9450], CBR: [149.1950, -35.3069],
  AKL: [174.7917, -37.0082], CHC: [172.5369, -43.4894], WLG: [174.8050, -41.3272],
  NAN: [177.4431, -17.7554], PPT: [-149.6067, -17.5534], GUM: [144.7960, 13.4834],
  TRW: [173.1470, 1.3814],
  // Africa
  JNB: [28.2460, -26.1392], CPT: [18.6017, -33.9648], DUR: [30.9508, -29.6144],
  NBO: [36.9275, -1.3192], MBA: [39.5942, -4.0348], DAR: [39.2026, -6.8781],
  EBB: [32.4435, 0.0424], ADD: [38.7993, 8.9779], CAI: [31.4056, 30.1219],
  CMN: [-7.5900, 33.3675], RAK: [-8.0365, 31.6069], TUN: [10.2272, 36.8510],
  ALG: [3.2154, 36.6910], LOS: [3.3214, 6.5774], ACC: [-0.1668, 5.6052],
  ABJ: [-3.9263, 5.2613], DKR: [-17.4902, 14.7397], KGL: [30.1395, -1.9686],
  HRE: [31.0928, -17.9318], LUN: [28.4526, -15.3308], LAD: [13.2312, -8.8583],
  TNR: [47.4788, -18.7969], MRU: [57.6836, -20.4302],
  // Central Asia / Russia
  GYD: [49.8462, 40.4675], TBS: [44.9547, 41.6693], EVN: [44.3959, 40.1473],
  ALA: [77.0405, 43.3521], TAS: [69.2812, 41.2579], SVO: [37.4146, 55.9726],
  DME: [37.9063, 55.4088], LED: [30.2625, 59.8003],
};

// ── Flight log data ─────────────────────────────────────────────────────────
export interface LoggedFlight {
  date: string;           // YYYY-MM-DD
  airline?: string;
  origin_code: string;
  origin_city?: string;
  dest_code: string;
  dest_city?: string;
  plane?: string;
  distance_mi?: number;
  duration_min?: number;
  cabin: 'economy' | 'premium' | 'business' | 'first';
  miles?: number;
  arb_price_usd?: number;
  arb_price_standard_usd?: number;
  cash_fare_usd?: number;
}

const FLIGHTS: LoggedFlight[] = [
  // ── Jan 2025 · American Airlines · MEX → BOS via DFW, PHL ──────────────
  { date: '2025-01-22', airline: 'American Airlines', origin_code: 'MEX', origin_city: 'Mexico City', dest_code: 'DFW', dest_city: 'Dallas', plane: 'Boeing 737-800', distance_mi: 963, duration_min: 160, cabin: 'business' },
  { date: '2025-01-22', airline: 'American Airlines', origin_code: 'DFW', origin_city: 'Dallas', dest_code: 'PHL', dest_city: 'Philadelphia', plane: 'Airbus A321', distance_mi: 1299, duration_min: 204, cabin: 'business' },
  { date: '2025-01-22', airline: 'American Airlines', origin_code: 'PHL', origin_city: 'Philadelphia', dest_code: 'BOS', dest_city: 'Boston', plane: 'Boeing 737-800', distance_mi: 280, duration_min: 51, cabin: 'business' },
  // ── Mar 2025 · Etihad · AUH → LHR ─────────────────────────────────────
  { date: '2025-03-20', airline: 'Etihad Airways', origin_code: 'AUH', origin_city: 'Abu Dhabi', dest_code: 'LHR', dest_city: 'London', plane: 'Airbus A380-800', distance_mi: 3432, duration_min: 425, cabin: 'first' },
  // ── Apr 2025 · Air Dolomiti / Lufthansa · VRN → BOS via FRA, MUC ───────
  { date: '2025-04-01', airline: 'Air Dolomiti', origin_code: 'VRN', origin_city: 'Verona', dest_code: 'FRA', dest_city: 'Frankfurt', plane: 'Embraer ERJ-195', distance_mi: 381, duration_min: 85, cabin: 'business' },
  { date: '2025-04-01', airline: 'Lufthansa', origin_code: 'FRA', origin_city: 'Frankfurt', dest_code: 'MUC', dest_city: 'Munich', plane: 'Boeing 787-9', distance_mi: 187, duration_min: 55, cabin: 'business' },
  { date: '2025-04-01', airline: 'Lufthansa', origin_code: 'MUC', origin_city: 'Munich', dest_code: 'BOS', dest_city: 'Boston', plane: 'Airbus A380-800', distance_mi: 3843, duration_min: 500, cabin: 'first' },
  // ── May 2025 · United Airlines · PVD → PPT via IAD, SFO ────────────────
  { date: '2025-05-13', airline: 'United Airlines', origin_code: 'PVD', origin_city: 'Providence', dest_code: 'IAD', dest_city: 'Washington', distance_mi: 371, duration_min: 101, cabin: 'economy' },
  { date: '2025-05-13', airline: 'United Airlines', origin_code: 'IAD', origin_city: 'Washington', dest_code: 'SFO', dest_city: 'San Francisco', plane: 'Boeing 777', distance_mi: 2416, duration_min: 357, cabin: 'economy' },
  { date: '2025-05-13', airline: 'United Airlines', origin_code: 'SFO', origin_city: 'San Francisco', dest_code: 'PPT', dest_city: 'Papeete', plane: 'Boeing 787-9', distance_mi: 4097, duration_min: 520, cabin: 'business' },
  // ── May 2025 · Fiji Airways · AKL → TRW via NAN ────────────────────────
  { date: '2025-05-21', airline: 'Fiji Airways', origin_code: 'AKL', origin_city: 'Auckland', dest_code: 'NAN', dest_city: 'Nadi', plane: 'Airbus A330-300', distance_mi: 1342, duration_min: 180, cabin: 'economy' },
  { date: '2025-05-22', airline: 'Fiji Airways', origin_code: 'NAN', origin_city: 'Nadi', dest_code: 'TRW', dest_city: 'Tarawa', plane: 'Boeing 737 MAX 8', distance_mi: 1356, duration_min: 185, cabin: 'economy' },
  // ── May 2025 · JAL / Qatar · HND → DOH via BKK ─────────────────────────
  { date: '2025-05-28', airline: 'Japan Airlines', origin_code: 'HND', origin_city: 'Tokyo', dest_code: 'BKK', dest_city: 'Bangkok', plane: 'Boeing 777-300ER', distance_mi: 2867, duration_min: 390, cabin: 'first' },
  { date: '2025-05-28', airline: 'Qatar Airways', origin_code: 'BKK', origin_city: 'Bangkok', dest_code: 'DOH', dest_city: 'Doha', plane: 'Airbus A380-800', distance_mi: 3246, duration_min: 430, cabin: 'first' },
  // ── May 2025 · Qatar / Lufthansa · DOH → ZRH via DMM, RUH, FRA ─────────
  { date: '2025-05-30', airline: 'Qatar Airways', origin_code: 'DOH', origin_city: 'Doha', dest_code: 'DMM', dest_city: 'Dammam', plane: 'Airbus A350-1000', distance_mi: 138, duration_min: 60, cabin: 'business' },
  { date: '2025-05-30', airline: 'Lufthansa', origin_code: 'DMM', origin_city: 'Dammam', dest_code: 'RUH', dest_city: 'Riyadh', plane: 'Airbus A340-600', distance_mi: 187, duration_min: 60, cabin: 'first' },
  { date: '2025-05-31', airline: 'Lufthansa', origin_code: 'RUH', origin_city: 'Riyadh', dest_code: 'FRA', dest_city: 'Frankfurt', plane: 'Airbus A340-600', distance_mi: 2672, duration_min: 380, cabin: 'first' },
  { date: '2025-05-31', airline: 'Lufthansa', origin_code: 'FRA', origin_city: 'Frankfurt', dest_code: 'ZRH', dest_city: 'Zurich', plane: 'Airbus A320', distance_mi: 188, duration_min: 55, cabin: 'business' },
  // ── Jun 2025 · British Airways · VRN → LGW ─────────────────────────────
  { date: '2025-06-02', airline: 'British Airways', origin_code: 'VRN', origin_city: 'Verona', dest_code: 'LGW', dest_city: 'London', plane: 'Airbus A321', distance_mi: 648, duration_min: 130, cabin: 'business' },
  // ── Jun 2025 · Swiss · MXP → BOS via ZRH ───────────────────────────────
  { date: '2025-06-12', airline: 'Swiss International Airlines', origin_code: 'MXP', origin_city: 'Milan', dest_code: 'ZRH', dest_city: 'Zurich', plane: 'Embraer ERJ-190', distance_mi: 131, duration_min: 55, cabin: 'business' },
  { date: '2025-06-12', airline: 'Swiss International Airlines', origin_code: 'ZRH', origin_city: 'Zurich', dest_code: 'BOS', dest_city: 'Boston', plane: 'Airbus A330-300', distance_mi: 3739, duration_min: 500, cabin: 'business' },
  // ── Jun 2025 · American Airlines · PVD → DCA / DCA → BOS ───────────────
  { date: '2025-06-26', airline: 'American Airlines', origin_code: 'PVD', origin_city: 'Providence', dest_code: 'DCA', dest_city: 'Washington', plane: 'Embraer 175', distance_mi: 356, duration_min: 97, cabin: 'business' },
  { date: '2025-06-27', airline: 'American Airlines', origin_code: 'DCA', origin_city: 'Washington', dest_code: 'BOS', dest_city: 'Boston', plane: 'Embraer 175', distance_mi: 397, duration_min: 100, cabin: 'economy' },
  // ── Jul 2025 · British Airways · LHR → CPH ─────────────────────────────
  { date: '2025-07-02', airline: 'British Airways', origin_code: 'LHR', origin_city: 'London', dest_code: 'CPH', dest_city: 'Copenhagen', plane: 'Airbus A319', distance_mi: 619, duration_min: 115, cabin: 'business' },
  // ── Jul 2025 · Lufthansa · CDG → CPH via FRA ───────────────────────────
  { date: '2025-07-14', airline: 'Lufthansa', origin_code: 'CDG', origin_city: 'Paris', dest_code: 'FRA', dest_city: 'Frankfurt', plane: 'Airbus A320', distance_mi: 288, duration_min: 75, cabin: 'economy' },
  { date: '2025-07-14', airline: 'Lufthansa', origin_code: 'FRA', origin_city: 'Frankfurt', dest_code: 'CPH', dest_city: 'Copenhagen', plane: 'Airbus A321', distance_mi: 423, duration_min: 85, cabin: 'economy' },
  // ── Aug 2025 · Emirates · GVA → DXB ────────────────────────────────────
  { date: '2025-08-03', airline: 'Emirates', origin_code: 'GVA', origin_city: 'Geneva', dest_code: 'DXB', dest_city: 'Dubai', plane: 'Boeing 777-300ER', distance_mi: 3200, duration_min: 390, cabin: 'first' },
  // ── Aug 2025 · Virgin Atlantic · BOS → LHR ─────────────────────────────
  { date: '2025-08-11', airline: 'Virgin Atlantic', origin_code: 'BOS', origin_city: 'Boston', dest_code: 'LHR', dest_city: 'London', plane: 'Airbus A330-900neo', distance_mi: 3268, duration_min: 410, cabin: 'business' },
  // ── Aug 2025 · Qatar Airways · AKL → LHR via DOH ───────────────────────
  { date: '2025-08-24', airline: 'Qatar Airways', origin_code: 'AKL', origin_city: 'Auckland', dest_code: 'DOH', dest_city: 'Doha', plane: 'Boeing 777-200LR', distance_mi: 9063, duration_min: 1020, cabin: 'business' },
  { date: '2025-08-25', airline: 'Qatar Airways', origin_code: 'DOH', origin_city: 'Doha', dest_code: 'LHR', dest_city: 'London', plane: 'Airbus A380-800', distance_mi: 3261, duration_min: 435, cabin: 'business' },
  // ── Oct 2025 · Lufthansa · BOS → ZRH via FRA, IST + CAI → ZRH ──────────
  { date: '2025-10-14', airline: 'Lufthansa', origin_code: 'BOS', origin_city: 'Boston', dest_code: 'FRA', dest_city: 'Frankfurt', plane: 'Airbus A340-600', distance_mi: 3671, duration_min: 440, cabin: 'first' },
  { date: '2025-10-15', airline: 'Lufthansa', origin_code: 'FRA', origin_city: 'Frankfurt', dest_code: 'IST', dest_city: 'Istanbul', plane: 'Airbus A321', distance_mi: 1396, duration_min: 185, cabin: 'business' },
  { date: '2025-10-22', airline: 'Egyptair', origin_code: 'CAI', origin_city: 'Cairo', dest_code: 'ZRH', dest_city: 'Zurich', plane: 'Airbus A320neo', distance_mi: 1710, duration_min: 310, cabin: 'business' },
  { date: '2025-10-22', airline: 'Swiss International Airlines', origin_code: 'ZRH', origin_city: 'Zurich', dest_code: 'BOS', dest_city: 'Boston', plane: 'Airbus A330-300', distance_mi: 3739, duration_min: 500, cabin: 'business' },
  // ── Nov 2025 · United / Aegean / BA · EWR → BOS via ATH, IST, LHR ──────
  { date: '2025-11-09', airline: 'United Airlines', origin_code: 'EWR', origin_city: 'Newark', dest_code: 'ATH', dest_city: 'Athens', plane: 'Boeing 767-400', distance_mi: 4938, duration_min: 590, cabin: 'business' },
  { date: '2025-11-10', airline: 'Aegean Airlines', origin_code: 'ATH', origin_city: 'Athens', dest_code: 'IST', dest_city: 'Istanbul', plane: 'Airbus A320', distance_mi: 345, duration_min: 90, cabin: 'economy' },
  { date: '2025-11-15', airline: 'British Airways', origin_code: 'IST', origin_city: 'Istanbul', dest_code: 'LHR', dest_city: 'London', plane: 'Airbus A320', distance_mi: 1548, duration_min: 205, cabin: 'business' },
  { date: '2025-11-15', airline: 'British Airways', origin_code: 'LHR', origin_city: 'London', dest_code: 'BOS', dest_city: 'Boston', plane: 'Boeing 787-10', distance_mi: 3259, duration_min: 525, cabin: 'business' },
  // ── Dec 2025 · Iberia · BOS → MXP via MAD ──────────────────────────────
  { date: '2025-12-16', airline: 'Iberia', origin_code: 'BOS', origin_city: 'Boston', dest_code: 'MAD', dest_city: 'Madrid', plane: 'Airbus A321neo', distance_mi: 3413, duration_min: 430, cabin: 'business' },
  { date: '2025-12-17', airline: 'Iberia', origin_code: 'MAD', origin_city: 'Madrid', dest_code: 'MXP', dest_city: 'Milan', plane: 'Airbus A321', distance_mi: 829, duration_min: 135, cabin: 'economy' },
  // ── Jan 2026 · Thai / China Eastern / Etihad / BA ───────────────────────
  { date: '2026-01-01', airline: 'Thai Airways', origin_code: 'MXP', origin_city: 'Milan', dest_code: 'BKK', dest_city: 'Bangkok', plane: 'Boeing 787-9', distance_mi: 5639, duration_min: 650, cabin: 'business' },
  { date: '2026-01-02', airline: 'Thai Airways', origin_code: 'BKK', origin_city: 'Bangkok', dest_code: 'KUL', dest_city: 'Kuala Lumpur', plane: 'Boeing 777-300ER', distance_mi: 761, duration_min: 130, cabin: 'business' },
  { date: '2026-01-17', airline: 'China Eastern Airlines', origin_code: 'PVG', origin_city: 'Shanghai', dest_code: 'SIN', dest_city: 'Singapore', plane: 'Airbus A350-900', distance_mi: 2448, duration_min: 340, cabin: 'business' },
  { date: '2026-01-17', airline: 'Etihad Airways', origin_code: 'SIN', origin_city: 'Singapore', dest_code: 'AUH', dest_city: 'Abu Dhabi', plane: 'Airbus A380-800', distance_mi: 3646, duration_min: 475, cabin: 'first' },
  { date: '2026-01-18', airline: 'Etihad Airways', origin_code: 'AUH', origin_city: 'Abu Dhabi', dest_code: 'LHR', dest_city: 'London', plane: 'Airbus A380-800', distance_mi: 3432, duration_min: 420, cabin: 'first' },
  { date: '2026-01-26', airline: 'British Airways', origin_code: 'LHR', origin_city: 'London', dest_code: 'BOS', dest_city: 'Boston', plane: 'Boeing 787-10', distance_mi: 3259, duration_min: 525, cabin: 'economy' },
  // ── Feb 2026 · American Airlines · PVD → DCA ────────────────────────────
  { date: '2026-02-20', airline: 'American Airlines', origin_code: 'PVD', origin_city: 'Providence', dest_code: 'DCA', dest_city: 'Washington', plane: 'Airbus A319', distance_mi: 356, duration_min: 96, cabin: 'business' },
  // ── Mar 2026 · PTY → CUR ────────────────────────────────────────────────
  { date: '2026-03-26', origin_code: 'PTY', origin_city: 'Panama City', dest_code: 'CUR', dest_city: 'Curaçao', cabin: 'economy' },
  // ── Apr 2026 · BOS → ZRH ────────────────────────────────────────────────
  { date: '2026-04-10', origin_code: 'BOS', origin_city: 'Boston', dest_code: 'ZRH', dest_city: 'Zurich', cabin: 'business' },
];

// ── Per-user flight logs ──────────────────────────────────────────────────────
const USER_FLIGHTS: Record<string, LoggedFlight[]> = {
  'samimuduroglu1@gmail.com': FLIGHTS,
  'imrantrehan@gmail.com': [
    { date: '2026-04-07', airline: 'American Airlines', origin_code: 'JFK', origin_city: 'New York', dest_code: 'LAX', dest_city: 'Los Angeles', plane: 'Airbus A321T', distance_mi: 2475, duration_min: 330, cabin: 'business', arb_price_usd: 858, cash_fare_usd: 1716 },
  ],
};

// ── Computed stats ───────────────────────────────────────────────────────────
function totalMilesFlown(flights: LoggedFlight[]) {
  return flights.reduce((s, f) => s + (f.distance_mi ?? 0), 0);
}

function totalMoneySaved(flights: LoggedFlight[]) {
  return flights.reduce((s, f) =>
    f.cash_fare_usd != null && f.arb_price_usd != null
      ? s + (f.cash_fare_usd - f.arb_price_usd)
      : s
  , 0);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtUSD(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Compute great-circle arc as SVG path string via d3-geo
function arcPath(from: [number, number], to: [number, number]): string {
  const line: GeoJSON.LineString = { type: 'LineString', coordinates: [from, to] };
  return pathGen(line) ?? '';
}

interface DashboardProps {
  user?: AuthUser;
  onLogout?: () => void;
}

export default function DashboardPage({ user, onLogout }: DashboardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    fetch(GEO_URL)
      .then(r => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((topo: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c = (feature(topo, topo.objects.countries) as any).features;
        setCountries(c);
      })
      .catch(() => { /* map renders blank if CDN unreachable */ });
  }, []);

  const myFlights = USER_FLIGHTS[user?.email?.toLowerCase() ?? ''] ?? [];

  // Derive unique arcs from flight log (only those with known coords)
  const flightArcs: { from: string; to: string }[] = [];
  {
    const seen = new Set<string>();
    for (const f of myFlights) {
      if (!AIRPORT_COORDS[f.origin_code] || !AIRPORT_COORDS[f.dest_code]) continue;
      const key = `${f.origin_code}|${f.dest_code}`;
      if (!seen.has(key)) { seen.add(key); flightArcs.push({ from: f.origin_code, to: f.dest_code }); }
    }
  }

  const plotted = new Set(flightArcs.flatMap(r => [r.from, r.to]));

  // Graticule (grid lines)
  const graticule = geoGraticule()();
  const graticulePath = pathGen(graticule) ?? '';

  // Sphere outline
  const spherePath = pathGen({ type: 'Sphere' }) ?? '';

  return (
    <div className="flex flex-col gap-6 px-6 py-10 w-full max-w-5xl mx-auto">
      {user && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
              Welcome back, {user.firstName}.
            </h2>
            <p className="text-sm text-[#999999] mt-0.5">{user.email}</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-semibold text-[#999999] hover:text-[#555555] border border-[#D4D0CB] hover:border-[#999999] rounded-xl transition"
            >
              Log out
            </button>
          )}
        </div>
      )}
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#dddddd] shadow-sm px-6 py-5">
          <div className="text-xs text-[#aaaaaa] font-medium uppercase tracking-wide mb-1">Miles Flown</div>
          <div className="text-3xl font-extrabold text-[#444444]">
            {totalMilesFlown(myFlights) > 0 ? totalMilesFlown(myFlights).toLocaleString() : '—'}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#dddddd] shadow-sm px-6 py-5">
          <div className="text-xs text-[#aaaaaa] font-medium uppercase tracking-wide mb-1">Money Saved</div>
          <div className="text-3xl font-extrabold text-[#4a7a4a]">
            {totalMoneySaved(myFlights) > 0 ? fmtUSD(totalMoneySaved(myFlights)) : '—'}
          </div>
        </div>
      </div>

      {/* ── Upcoming trips ── */}
      <div className="bg-white rounded-2xl border border-[#dddddd] shadow-sm px-6 py-5">
        <div className="text-sm font-semibold text-[#555555] mb-3">Upcoming Trips</div>
        <div className="text-sm text-[#bbbbbb]">No upcoming trips.</div>
      </div>

      {/* Map */}
      <h2 className="text-2xl font-extrabold text-[#555555] tracking-tight">Flight Log</h2>
      <div className="bg-white rounded-2xl border border-[#dddddd] overflow-hidden shadow-sm">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* Ocean background */}
          <path d={spherePath} fill="#f0f0ee" />

          {/* Graticule */}
          <path d={graticulePath} fill="none" stroke="#e0e0de" strokeWidth={0.4} />

          {/* Countries */}
          {countries.map((geo, i) => (
            <path
              key={i}
              d={pathGen(geo) ?? ''}
              fill="#e8e4de"
              stroke="#d4d0ca"
              strokeWidth={0.5}
            />
          ))}

          {/* Arcs from flight log */}
          {flightArcs.map((r, i) => (
            <path
              key={`f-${i}`}
              d={arcPath(AIRPORT_COORDS[r.from], AIRPORT_COORDS[r.to])}
              fill="none"
              stroke="#666666"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="5 4"
              opacity={0.8}
            />
          ))}
          {/* Airport dots + labels (nudged to avoid overlap) */}
          {(() => {
            const aps = [...plotted].flatMap(code => {
              const coords = AIRPORT_COORDS[code];
              if (!coords) return [];
              const proj = projection(coords);
              if (!proj) return [];
              return [{ code, x: proj[0], y: proj[1] }];
            });

            const charW = 5.8;
            const labelH = 9;
            const pad = 2;
            const dotR = 6; // clearance from dot center

            // Candidate offsets: above, below, right, left, diagonals
            const offsets: [number, number, 'middle' | 'start' | 'end'][] = [
              [0,    -(dotR + 2),  'middle'], // above (default)
              [0,    dotR + labelH, 'middle'], // below
              [dotR + 2, 0,        'start'],  // right
              [-(dotR + 2), 0,     'end'],    // left
              [dotR, -(dotR + 2),  'start'],  // upper-right
              [-dotR, -(dotR + 2), 'end'],    // upper-left
              [dotR, dotR + labelH,'start'],  // lower-right
              [-dotR, dotR + labelH,'end'],   // lower-left
            ];

            type Rect = { x1: number; y1: number; x2: number; y2: number };
            const occupied: Rect[] = [];

            // Also reserve dot areas
            for (const ap of aps) {
              occupied.push({ x1: ap.x - 5, y1: ap.y - 5, x2: ap.x + 5, y2: ap.y + 5 });
            }

            function overlaps(r: Rect) {
              return occupied.some(o => r.x1 < o.x2 && r.x2 > o.x1 && r.y1 < o.y2 && r.y2 > o.y1);
            }

            function labelRect(lx: number, ly: number, anchor: 'middle' | 'start' | 'end', w: number): Rect {
              const x1 = anchor === 'start' ? lx - pad : anchor === 'end' ? lx - w - pad : lx - w / 2 - pad;
              return { x1, y1: ly - labelH - pad, x2: x1 + w + pad * 2, y2: ly + pad };
            }

            const placements: { code: string; ax: number; ay: number; lx: number; ly: number; anchor: 'middle' | 'start' | 'end' }[] = [];

            for (const ap of aps) {
              const w = ap.code.length * charW;
              let placed = false;
              for (const [dx, dy, anchor] of offsets) {
                const lx = ap.x + dx;
                const ly = ap.y + dy;
                const r = labelRect(lx, ly, anchor, w);
                if (!overlaps(r)) {
                  occupied.push(r);
                  placements.push({ code: ap.code, ax: ap.x, ay: ap.y, lx, ly, anchor });
                  placed = true;
                  break;
                }
              }
              // Fallback: use default above position regardless
              if (!placed) {
                const lx = ap.x, ly = ap.y - dotR - 2;
                placements.push({ code: ap.code, ax: ap.x, ay: ap.y, lx, ly, anchor: 'middle' });
              }
            }

            return placements.map(({ code, ax, ay, lx, ly, anchor }) => (
              <g key={code}>
                <circle cx={ax} cy={ay} r={4} fill="#555555" stroke="white" strokeWidth={1.5} />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  fontSize={9}
                  fontFamily="monospace"
                  fontWeight="600"
                  fill="#444444"
                >
                  {code}
                </text>
              </g>
            ));
          })()}
        </svg>

        {flightArcs.length === 0 && (
          <div className="text-center text-sm text-[#bbbbbb] pb-6 -mt-2">
            No flights logged yet.
          </div>
        )}
      </div>

      {/* ── Flight log ── */}
      <div className="bg-white rounded-2xl border border-[#dddddd] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#eeeeee]">
          <div className="text-sm font-semibold text-[#555555]">Flight Log</div>
        </div>
        {myFlights.length === 0 ? (
          <div className="px-6 py-8 text-sm text-[#bbbbbb] text-center">No flights logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#aaaaaa] font-medium border-b border-[#eeeeee]">
                  <th className="text-left px-4 py-3 whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Airline</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">From</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">To</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Aircraft</th>
                  <th className="text-right px-4 py-3 whitespace-nowrap">Distance</th>
                  <th className="text-right px-4 py-3 whitespace-nowrap">Arb Price</th>
                  <th className="text-right px-4 py-3 whitespace-nowrap">Cash Fare</th>
                </tr>
              </thead>
              <tbody>
                {[...myFlights].reverse().map((f, i) => (
                  <tr key={i} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition">
                    <td className="px-4 py-3 text-[#777777] whitespace-nowrap">{fmtDate(f.date)}</td>
                    <td className="px-4 py-3 text-[#555555] font-medium whitespace-nowrap">{f.airline ?? '—'}</td>
                    <td className="px-4 py-3 text-[#555555] whitespace-nowrap">
                      {f.origin_city ? <>{f.origin_city} <span className="text-[#aaaaaa] font-mono text-xs">({f.origin_code})</span></> : <span className="font-mono">{f.origin_code}</span>}
                    </td>
                    <td className="px-4 py-3 text-[#555555] whitespace-nowrap">
                      {f.dest_city ? <>{f.dest_city} <span className="text-[#aaaaaa] font-mono text-xs">({f.dest_code})</span></> : <span className="font-mono">{f.dest_code}</span>}
                    </td>
                    <td className="px-4 py-3 text-[#777777] whitespace-nowrap">{f.plane ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-[#777777] whitespace-nowrap">{f.distance_mi != null ? `${f.distance_mi.toLocaleString()} mi` : '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#4a7a4a] whitespace-nowrap">{f.arb_price_usd != null ? fmtUSD(f.arb_price_usd) : '—'}</td>
                    <td className="px-4 py-3 text-right text-[#bbbbbb] line-through whitespace-nowrap">{f.cash_fare_usd != null ? fmtUSD(f.cash_fare_usd) : '—'}</td>
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
