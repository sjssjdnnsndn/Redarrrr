export type GemStatus =
  | "heating"
  | "launching"
  | "mooning"
  | "cooling"
  | "dumped";

export type Venue = "alpha" | "spot" | "perp";

export type AlertKind =
  | "volume_burst"
  | "whale_print"
  | "oi_surge"
  | "taker_sweep"
  | "new_perp"
  | "short_cover";

export type AlertSeverity = "info" | "high" | "critical";

export type VolumeAlert = {
  id: string;
  symbol: string;
  pair: string;
  name: string;
  kind: AlertKind;
  severity: AlertSeverity;
  title: string;
  detail: string;
  quoteUsd: number;
  price: number;
  change24h: number;
  ts: string;
  venues: Venue[];
};

export type Gem = {
  id: string;
  symbol: string;
  name: string;
  pair: string;
  iconUrl: string | null;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  fdv: number;
  liquidity: number;
  holders: number;
  circSupply: number;
  totalSupply: number;
  listingTime: number | null;
  listingAgeDays: number | null;
  listingCex: boolean;
  hotTag: boolean;
  alphaId: string | null;
  contractAddress: string | null;
  chainName: string | null;
  venues: Venue[];
  score: number;
  conviction: number;
  crimeRisk: number;
  status: GemStatus;
  reasons: string[];
  riskFlags: string[];
  fundingRate: number | null;
  perpVolume24h: number | null;
  spotVolume24h: number | null;
  high24h: number;
  low24h: number;
  turnover: number;
  floatRatio: number;
  firstSeenAt: string | null;
  firstPrice: number | null;
  highSinceDetect: number | null;
  tradeCount24h: number;
  volumeBurstUsd: number;
  tradeBurst: number;
  avgTradeUsd: number;
  burstRvol: number;
  spreadBps: number | null;
  markBasisBps: number | null;
  oiUsd: number | null;
  oiChange5m: number | null;
  takerBuyRatio: number | null;
  volSpike1m: number | null;
  whalePrints: number;
  whaleUsd: number;
  perpListedAgeHours: number | null;
  rangePosition: number | null;
  alertKinds: AlertKind[];
};

export type ScanStats = {
  universe: number;
  alphaLive: number;
  spotPairs: number;
  perpPairs: number;
  heating: number;
  launching: number;
  mooning: number;
  dumped: number;
  early: number;
  bursts: number;
};

export type ScanResult = {
  gems: Gem[];
  early: Gem[];
  crime: Gem[];
  caughtEarly: Gem[];
  bursts: Gem[];
  alerts: VolumeAlert[];
  stats: ScanStats;
  scannedAt: string;
  intervalMs: number;
  stale: boolean;
  error: string | null;
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type GemDetail = {
  gem: Gem | null;
  snapshots: Array<{
    price: number;
    quoteVolume: number;
    change24h: number;
    score: number;
    crimeRisk: number;
    capturedAt: string;
  }>;
  candles: Candle[];
  minuteCandles: Candle[];
  alerts: VolumeAlert[];
};
