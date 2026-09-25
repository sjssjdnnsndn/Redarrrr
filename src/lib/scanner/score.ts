import type { AlertKind, Gem, GemStatus, Venue } from "./types";

export type RawMarket = {
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
  listingCex: boolean;
  hotTag: boolean;
  alphaId: string | null;
  contractAddress: string | null;
  chainName: string | null;
  venues: Venue[];
  fundingRate: number | null;
  perpVolume24h: number | null;
  spotVolume24h: number | null;
  high24h: number;
  low24h: number;
  tradeCount24h: number;
  volumeBurstUsd: number;
  tradeBurst: number;
  avgTradeUsd: number;
  burstRvol: number;
  spreadBps: number | null;
  markPrice: number | null;
  indexPrice: number | null;
  oiUsd: number | null;
  oiChange5m: number | null;
  takerBuyRatio: number | null;
  volSpike1m: number | null;
  whalePrints: number;
  whaleUsd: number;
  perpListedAt: number | null;
};

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round(n: number) {
  return Math.round(n);
}

function rangePosition(price: number, high: number, low: number): number | null {
  if (price <= 0 || high <= 0 || low <= 0 || high <= low) return null;
  return clamp((price - low) / (high - low), 0, 1);
}

export function scoreMarket(raw: RawMarket, now = Date.now()): Gem {
  const price = raw.price;
  const vol = raw.volume24h;
  const mcap = Math.max(raw.marketCap, 0);
  const liq = Math.max(raw.liquidity, 0);
  const change = raw.change24h;
  const turnover = mcap > 0 ? vol / mcap : vol > 0 ? 99 : 0;
  const floatRatio =
    raw.totalSupply > 0 ? clamp(raw.circSupply / raw.totalSupply, 0, 1) : 1;
  const listingAgeDays =
    raw.listingTime && raw.listingTime > 0
      ? (now - raw.listingTime) / 86_400_000
      : null;
  const perpAgeHours =
    raw.perpListedAt && raw.perpListedAt > 0
      ? (now - raw.perpListedAt) / 3_600_000
      : null;
  const pos = rangePosition(price, raw.high24h, raw.low24h);
  const burst = Math.max(0, raw.volumeBurstUsd);
  const rvol = Math.max(0, raw.burstRvol);
  const spike = raw.volSpike1m ?? 0;
  const taker = raw.takerBuyRatio;
  const oiChg = raw.oiChange5m;
  const funding = raw.fundingRate;

  const reasons: string[] = [];
  const riskFlags: string[] = [];
  const alertKinds: AlertKind[] = [];

  let gem = 0;
  let conviction = 36;
  let crime = 0;

  // --- Room to run (cap, not sticker price) ---
  if (mcap > 0 && mcap < 8_000_000) {
    gem += 14;
    conviction += 8;
    reasons.push("Micro cap with 10x room");
  } else if (mcap > 0 && mcap < 30_000_000) {
    gem += 16;
    conviction += 10;
    reasons.push("Small cap, still early");
  } else if (mcap > 0 && mcap < 90_000_000) {
    gem += 11;
    conviction += 5;
    reasons.push("Mid-small cap, room to expand");
  } else if (mcap > 0 && mcap < 250_000_000) {
    gem += 6;
  } else if (mcap > 800_000_000) {
    gem -= 4;
    conviction -= 8;
  } else if (mcap === 0 && price > 0 && price <= 1) {
    gem += 4;
  }

  const priceIllusion = price > 0 && price < 0.15 && mcap > 400_000_000;
  if (priceIllusion) {
    riskFlags.push("Cheap sticker price, large cap — supply illusion");
    conviction -= 14;
    crime += 10;
  } else if (price >= 0.003 && price <= 0.08) {
    gem += 10;
    reasons.push("Price still in the $0.01 zone");
  } else if (price > 0 && price <= 0.25) {
    gem += 8;
  } else if (price <= 1) {
    gem += 5;
  } else if (price > 25) {
    gem -= 10;
    conviction -= 16;
  }


  // --- Live ignition beats stale 24h volume ---
  if (rvol >= 18 && burst >= 80_000) {
    gem += 18;
    conviction += 16;
    reasons.push("Violent live volume burst");
    alertKinds.push("volume_burst");
  } else if (rvol >= 8 && burst >= 40_000) {
    gem += 14;
    conviction += 12;
    reasons.push("Sudden volume expansion right now");
    alertKinds.push("volume_burst");
  } else if (rvol >= 4 && burst >= 20_000) {
    gem += 9;
    conviction += 7;
    reasons.push("Volume accelerating vs its own tape");
  } else if (burst >= 250_000) {
    gem += 8;
    conviction += 5;
  }

  if (spike >= 6) {
    gem += 10;
    conviction += 8;
    reasons.push("1m volume many times the local median");
  } else if (spike >= 3) {
    gem += 6;
    conviction += 4;
  }

  if (vol >= 20_000_000) gem += 10;
  else if (vol >= 8_000_000) gem += 9;
  else if (vol >= 2_500_000) {
    gem += 8;
    reasons.push("Volume is waking up");
  } else if (vol >= 800_000) gem += 5;
  else if (vol >= 200_000) gem += 2;
  else if (vol < 80_000) {
    gem -= 4;
    conviction -= 6;
  }

  if (turnover >= 0.12 && turnover <= 1.8) {
    gem += 9;
    conviction += 4;
    reasons.push("Volume/cap turnover in the expansion band");
  } else if (turnover > 1.8 && turnover <= 5) {
    gem += 5;
    reasons.push("Very high turnover — fast move, crowded");
  } else if (turnover > 8) {
    gem += 1;
    crime += 8;
  }

  // --- Timing: early beats parabolic ---
  if (change >= 6 && change <= 28) {
    gem += 16;
    conviction += 14;
    reasons.push("Fresh expansion, not yet extended");
  } else if (change > 28 && change <= 55) {
    gem += 12;
    conviction += 8;
    reasons.push("Launching — still catchable");
  } else if (change >= 2 && change < 6 && (rvol >= 4 || spike >= 3)) {
    gem += 14;
    conviction += 15;
    reasons.push("Quiet tape igniting before the 24h print");
  } else if (change > 55 && change <= 110) {
    gem += 6;
    conviction -= 4;
    reasons.push("Already extended — late entry risk");
  } else if (change > 110 && change <= 220) {
    gem += 2;
    conviction -= 12;
    riskFlags.push("Parabolic 24h move — likely late");
  } else if (change > 220) {
    gem -= 4;
    conviction -= 18;
    riskFlags.push("Parabolic 24h move — likely late");
    crime += 12;
  } else if (change <= -28) {
    gem -= 10;
    conviction -= 10;
  } else if (change < -12) {
    gem -= 4;
    conviction -= 4;
  }

  if (pos != null) {
    if (pos < 0.55 && change >= 2) {
      conviction += 6;
      gem += 4;
      reasons.push("Price still mid-range, not chasing the high");
    } else if (pos > 0.92 && change > 20) {
      conviction -= 8;
      riskFlags.push("Pressed against the 24h high");
    }
  }

  // --- Listing freshness / new perp ---
  if (listingAgeDays != null) {
    if (listingAgeDays <= 3) {
      gem += 12;
      conviction += 8;
      reasons.push("Listed this week on Alpha");
    } else if (listingAgeDays <= 14) {
      gem += 10;
      conviction += 6;
      reasons.push("Recently listed");
    } else if (listingAgeDays <= 45) {
      gem += 5;
    } else if (listingAgeDays > 90 && vol >= 2_000_000 && change >= 8) {
      gem += 7;
      conviction += 4;
      reasons.push("Older Alpha name waking up — squeeze pattern");
    }
  }

  if (perpAgeHours != null) {
    if (perpAgeHours <= 6) {
      gem += 14;
      conviction += 12;
      reasons.push("Brand-new USDT-M perp");
      alertKinds.push("new_perp");
    } else if (perpAgeHours <= 72) {
      gem += 11;
      conviction += 9;
      reasons.push("Perp listed in the last 3 days");
    } else if (perpAgeHours <= 24 * 14) {
      gem += 5;
      conviction += 3;
    }
  }

  if (!raw.listingCex && raw.venues.includes("alpha")) {
    gem += 6;
    conviction += 5;
    reasons.push("Alpha-only — not on main Binance spot yet");
  } else if (raw.listingCex && raw.venues.includes("alpha")) {
    gem += 2;
  }

  if (raw.hotTag) {
    gem += 3;
    reasons.push("Binance hot tag");
  }

  if (floatRatio > 0 && floatRatio < 0.35) {
    gem += 5;
    reasons.push("Low circulating float");
  } else if (floatRatio < 0.55) {
    gem += 2;
  }

  // --- Deep futures: the squeeze fingerprint that actually works ---
  if (raw.perpVolume24h && raw.perpVolume24h > vol * 1.2 && raw.perpVolume24h > 3_000_000) {
    gem += 5;
    reasons.push("Perp volume dominating spot");
  }

  if (oiChg != null) {
    if (oiChg >= 12 && change >= 0) {
      gem += 12;
      conviction += 12;
      reasons.push("Open interest surging — new positions opening");
      alertKinds.push("oi_surge");
    } else if (oiChg >= 5 && change >= 0) {
      gem += 8;
      conviction += 8;
      reasons.push("Open interest rising with price");
    } else if (oiChg <= -8 && change > 8) {
      conviction -= 10;
      crime += 8;
      riskFlags.push("OI fading into the rally — distribution");
    } else if (oiChg <= -8 && change < -5) {
      gem -= 4;
    }
  }

  if (taker != null) {
    if (taker >= 0.68 && (rvol >= 3 || spike >= 2)) {
      gem += 11;
      conviction += 11;
      reasons.push("Aggressive taker buys lifting the book");
      alertKinds.push("taker_sweep");
    } else if (taker >= 0.58) {
      gem += 7;
      conviction += 6;
      reasons.push("Taker buy dominant on perps");
    } else if (taker <= 0.38 && change > 10) {
      conviction -= 8;
      riskFlags.push("Rally on taker sells — weak");
    } else if (taker <= 0.32 && oiChg != null && oiChg > 6) {
      reasons.push("New shorts opening into the tape");
      alertKinds.push("short_cover");
    }
  }

  if (funding != null) {
    const absF = Math.abs(funding);
    if (absF < 0.0003) {
      conviction += 4;
    } else if (absF > 0.01) {
      gem += 2;
      reasons.push("Extreme perp funding");
      crime += 8;
      conviction -= 6;
    }
    if (absF > 0.02) {
      crime += 10;
      conviction -= 8;
      riskFlags.push("Funding in squeeze territory");
    }
  }

  if (raw.spreadBps != null) {
    if (raw.spreadBps <= 8 && vol > 400_000) conviction += 3;
    else if (raw.spreadBps > 40) {
      conviction -= 5;
      riskFlags.push("Wide futures spread");
    }
  }

  if (raw.whalePrints >= 3 || raw.whaleUsd >= 250_000) {
    gem += 8;
    conviction += 7;
    reasons.push("Large prints hitting the tape");
    alertKinds.push("whale_print");
  } else if (raw.whalePrints >= 1 || (raw.avgTradeUsd >= 20_000 && burst >= 60_000)) {
    gem += 5;
    conviction += 4;
    reasons.push("Outsized tickets vs this book's norm");
    if (!alertKinds.includes("whale_print")) alertKinds.push("whale_print");
  }

  if (liq > 0 && vol > liq * 4 && vol > 500_000) {
    gem += 3;
    reasons.push("Volume multiple of liquidity — fast tape");
  }

  const markBasisBps =
    raw.markPrice && raw.indexPrice && raw.indexPrice > 0
      ? ((raw.markPrice - raw.indexPrice) / raw.indexPrice) * 10_000
      : null;
  if (markBasisBps != null && Math.abs(markBasisBps) > 25 && change > 5) {
    gem += 3;
    reasons.push("Perp marked rich vs index");
  }

  // --- Crime / wash / dump ---
  const absChange = Math.abs(change);
  if (turnover > 20 && absChange < 4) {
    crime += 40;
    riskFlags.push("Wash-like volume with almost no price change");
    gem -= 22;
    conviction -= 22;
  } else if (turnover > 8 && absChange < 6) {
    crime += 24;
    riskFlags.push("Volume far beyond cap without a move");
    gem -= 10;
    conviction -= 12;
  }

  if (turnover > 2) {
    crime += 14;
    riskFlags.push("Turnover above 2x market cap");
  } else if (turnover > 1) {
    crime += 8;
  }

  if (liq > 0 && vol > liq * 12) {
    crime += 14;
    riskFlags.push("Volume crushing liquidity");
  }

  if (floatRatio > 0 && floatRatio < 0.2) {
    crime += 12;
    riskFlags.push("Very low float — easy to squeeze");
  }

  if (change <= -30) {
    crime += 18;
    riskFlags.push("Sharp 24h dump");
  } else if (change >= 150) {
    crime += 12;
    riskFlags.push("Vertical pump — distribution risk");
  }

  if (raw.high24h > 0 && raw.low24h > 0) {
    const range = (raw.high24h - raw.low24h) / raw.low24h;
    if (range > 0.8) {
      crime += 10;
      riskFlags.push("Violent 24h range");
    }
  }

  if (raw.perpVolume24h && vol > 0 && raw.perpVolume24h > vol * 8) {
    crime += 6;
    riskFlags.push("Perps running the show");
  }

  // Quality filter: real bid + not late + not wash
  if (crime >= 70) conviction -= 10;
  if (raw.venues.includes("perp") && raw.venues.includes("alpha")) conviction += 3;
  if (raw.venues.includes("perp") && (oiChg == null || taker == null) && rvol < 3) {
    conviction -= 2;
  }

  gem = clamp(round(gem), 0, 100);
  crime = clamp(round(crime), 0, 100);
  conviction = clamp(round(conviction), 0, 100);

  const status = deriveStatus(gem, conviction, crime, change, vol, rvol);

  return {
    id: raw.id,
    symbol: raw.symbol,
    name: raw.name,
    pair: raw.pair,
    iconUrl: raw.iconUrl,
    price,
    change24h: change,
    volume24h: vol,
    marketCap: mcap,
    fdv: raw.fdv,
    liquidity: liq,
    holders: raw.holders,
    circSupply: raw.circSupply,
    totalSupply: raw.totalSupply,
    listingTime: raw.listingTime,
    listingAgeDays,
    listingCex: raw.listingCex,
    hotTag: raw.hotTag,
    alphaId: raw.alphaId,
    contractAddress: raw.contractAddress,
    chainName: raw.chainName,
    venues: raw.venues,
    score: gem,
    conviction,
    crimeRisk: crime,
    status,
    reasons: unique(reasons).slice(0, 6),
    riskFlags: unique(riskFlags).slice(0, 4),
    fundingRate: funding,
    perpVolume24h: raw.perpVolume24h,
    spotVolume24h: raw.spotVolume24h,
    high24h: raw.high24h,
    low24h: raw.low24h,
    turnover,
    floatRatio,
    firstSeenAt: null,
    firstPrice: null,
    highSinceDetect: null,
    tradeCount24h: raw.tradeCount24h,
    volumeBurstUsd: burst,
    tradeBurst: raw.tradeBurst,
    avgTradeUsd: raw.avgTradeUsd,
    burstRvol: rvol,
    spreadBps: raw.spreadBps,
    markBasisBps,
    oiUsd: raw.oiUsd,
    oiChange5m: oiChg,
    takerBuyRatio: taker,
    volSpike1m: raw.volSpike1m,
    whalePrints: raw.whalePrints,
    whaleUsd: raw.whaleUsd,
    perpListedAgeHours: perpAgeHours,
    rangePosition: pos,
    alertKinds: unique(alertKinds),
  };
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function deriveStatus(
  score: number,
  conviction: number,
  crime: number,
  change: number,
  vol: number,
  rvol: number,
): GemStatus {
  if (change <= -25 && vol >= 400_000) return "dumped";
  if (change >= 55 && score >= 62) return "mooning";
  if (
    conviction >= 68 ||
    (rvol >= 8 && change >= 4 && conviction >= 55) ||
    (change >= 12 && vol >= 5_000_000 && score >= 55)
  ) {
    return "launching";
  }
  if (change < -10 && score < 58) return "cooling";
  if (crime >= 70 && score < 50) return "cooling";
  return "heating";
}

const STABLES = new Set([
  "USDT",
  "USDC",
  "FDUSD",
  "BUSD",
  "TUSD",
  "DAI",
  "USDE",
  "USD1",
  "BFUSD",
  "USDP",
]);

export const MAJORS = new Set([
  "BTC",
  "ETH",
  "BNB",
  "XRP",
  "SOL",
  "DOGE",
  "ADA",
  "TRX",
  "TON",
  "AVAX",
  "LINK",
  "DOT",
  "BCH",
  "LTC",
  "SUI",
  "NEAR",
  "UNI",
  "AAVE",
  "SHIB",
]);

export function isMajor(symbol: string): boolean {
  return MAJORS.has(symbol.toUpperCase());
}

export function isTradableAlpha(row: {
  fullyDelisted?: boolean;
  offline?: boolean;
  offsell?: boolean;
  symbol?: string;
  price?: unknown;
}): boolean {
  if (row.fullyDelisted || row.offline || row.offsell) return false;
  const symbol = String(row.symbol ?? "").toUpperCase();
  if (!symbol || STABLES.has(symbol)) return false;
  return true;
}

export function isLeveragedSpot(symbol: string): boolean {
  const s = symbol.toUpperCase();
  return (
    s.endsWith("UPUSDT") ||
    s.endsWith("DOWNUSDT") ||
    s.endsWith("BULLUSDT") ||
    s.endsWith("BEARUSDT")
  );
}

export function isEarlyEdge(gem: Gem): boolean {
  if (/\(ondo\)/i.test(gem.name)) return false;
  if (gem.price > 8 && gem.marketCap > 20_000_000 && gem.burstRvol < 6) return false;
  if (gem.price > 25) return false;
  return (
    gem.conviction >= 52 &&
    gem.crimeRisk < 72 &&
    gem.change24h >= -8 &&
    gem.change24h <= 55 &&
    gem.status !== "dumped"
  );
}


export function shouldPersist(gem: Gem): boolean {
  return (
    gem.conviction >= 50 ||
    gem.score >= 48 ||
    gem.crimeRisk >= 62 ||
    gem.volumeBurstUsd >= 120_000 ||
    gem.volume24h >= 5_000_000
  );
}
