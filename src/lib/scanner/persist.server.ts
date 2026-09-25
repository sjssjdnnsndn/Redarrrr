import { getSql } from "@/lib/db";
import { shouldPersist } from "./score";
import type { Gem, VolumeAlert } from "./types";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

type GemRow = {
  symbol: string;
  name: string;
  pair: string;
  venue: string;
  first_seen_at: string;
  first_price: string | number;
  last_price: string | number;
  high_since_detect: string | number;
  last_score: number;
  last_crime_risk: number;
  last_change_24h: string | number;
  last_quote_volume: string | number;
  last_market_cap: string | number;
  last_status: string;
  reasons: string;
  updated_at: string;
  last_conviction?: number;
};

type SnapRow = {
  price: string | number;
  quote_volume: string | number;
  change_24h: string | number;
  score: number;
  crime_risk: number;
  captured_at: string;
};

type AlertRow = {
  id: string;
  symbol: string;
  pair: string;
  name: string;
  kind: string;
  severity: string;
  title: string;
  detail: string;
  quote_usd: string | number;
  price: string | number;
  change_24h: string | number;
  venues: string;
  created_at: string;
};

function applyTrack(gem: Gem, row: GemRow): Gem {
  const firstPrice = num(row.first_price);
  return {
    ...gem,
    firstSeenAt: row.first_seen_at,
    firstPrice,
    highSinceDetect: num(row.high_since_detect),
  };
}

function fallbackGem(row: GemRow): Gem {
  return {
    id: `db-${row.symbol}`,
    symbol: row.symbol,
    name: row.name,
    pair: row.pair,
    iconUrl: null,
    price: num(row.last_price),
    change24h: num(row.last_change_24h),
    volume24h: num(row.last_quote_volume),
    marketCap: num(row.last_market_cap),
    fdv: 0,
    liquidity: 0,
    holders: 0,
    circSupply: 0,
    totalSupply: 0,
    listingTime: null,
    listingAgeDays: null,
    listingCex: row.venue !== "alpha",
    hotTag: false,
    alphaId: null,
    contractAddress: null,
    chainName: null,
    venues: [row.venue === "spot" ? "spot" : row.venue === "perp" ? "perp" : "alpha"],
    score: num(row.last_score),
    conviction: num(row.last_conviction),
    crimeRisk: num(row.last_crime_risk),
    status: (row.last_status as Gem["status"]) || "heating",
    reasons: row.reasons ? row.reasons.split(" · ") : [],
    riskFlags: [],
    fundingRate: null,
    perpVolume24h: null,
    spotVolume24h: null,
    high24h: 0,
    low24h: 0,
    turnover: 0,
    floatRatio: 0,
    firstSeenAt: row.first_seen_at,
    firstPrice: num(row.first_price),
    highSinceDetect: num(row.high_since_detect),
    tradeCount24h: 0,
    volumeBurstUsd: 0,
    tradeBurst: 0,
    avgTradeUsd: 0,
    burstRvol: 0,
    spreadBps: null,
    markBasisBps: null,
    oiUsd: null,
    oiChange5m: null,
    takerBuyRatio: null,
    volSpike1m: null,
    whalePrints: 0,
    whaleUsd: 0,
    perpListedAgeHours: null,
    rangePosition: null,
    alertKinds: [],
  };
}

export async function persistAndMerge(gems: Gem[]): Promise<Gem[]> {
  const sql = await getSql();
  const keep = gems.filter(shouldPersist).slice(0, 48);

  for (const gem of keep) {
    const venue = gem.venues.includes("alpha")
      ? "alpha"
      : gem.venues.includes("perp")
        ? "perp"
        : (gem.venues[0] ?? "spot");
    await sql`
      insert into gems (
        symbol, name, pair, venue, first_price, last_price, high_since_detect,
        last_score, last_crime_risk, last_change_24h, last_quote_volume,
        last_market_cap, last_status, reasons, updated_at,
        last_conviction, last_oi_usd, last_burst_usd
      ) values (
        ${gem.symbol}, ${gem.name}, ${gem.pair}, ${venue}, ${gem.price}, ${gem.price},
        ${gem.price}, ${gem.score}, ${gem.crimeRisk}, ${gem.change24h}, ${gem.volume24h},
        ${gem.marketCap}, ${gem.status}, ${gem.reasons.join(" · ")}, now(),
        ${gem.conviction}, ${gem.oiUsd ?? 0}, ${gem.volumeBurstUsd}
      )
      on conflict (symbol) do update set
        name = excluded.name,
        pair = excluded.pair,
        venue = excluded.venue,
        last_price = excluded.last_price,
        high_since_detect = greatest(gems.high_since_detect, excluded.last_price),
        last_score = excluded.last_score,
        last_crime_risk = excluded.last_crime_risk,
        last_change_24h = excluded.last_change_24h,
        last_quote_volume = excluded.last_quote_volume,
        last_market_cap = excluded.last_market_cap,
        last_status = excluded.last_status,
        reasons = excluded.reasons,
        last_conviction = excluded.last_conviction,
        last_oi_usd = excluded.last_oi_usd,
        last_burst_usd = excluded.last_burst_usd,
        updated_at = now()
    `;
  }

  if (keep.length > 0) {
    const latest = await sql.query<{ symbol: string; last_at: string }>(
      `select symbol, max(captured_at)::text as last_at from gem_snapshots group by symbol`,
    );
    const lastMap = new Map(latest.map((r) => [r.symbol, new Date(r.last_at).getTime()]));
    const cutoff = Date.now() - 90_000;
    for (const gem of keep) {
      const last = lastMap.get(gem.symbol) ?? 0;
      if (last > cutoff) continue;
      await sql`
        insert into gem_snapshots (symbol, price, quote_volume, change_24h, score, crime_risk)
        values (${gem.symbol}, ${gem.price}, ${gem.volume24h}, ${gem.change24h}, ${gem.score}, ${gem.crimeRisk})
      `;
    }
  }

  const tracked = await sql<GemRow>`
    select symbol, name, pair, venue, first_seen_at::text as first_seen_at,
           first_price, last_price, high_since_detect, last_score, last_crime_risk,
           last_change_24h, last_quote_volume, last_market_cap, last_status, reasons,
           updated_at::text as updated_at, last_conviction
    from gems
  `;
  const bySymbol = new Map(tracked.map((r) => [r.symbol, r]));
  return gems.map((gem) => {
    const row = bySymbol.get(gem.symbol);
    return row ? applyTrack(gem, row) : gem;
  });
}

export async function persistAlerts(alerts: VolumeAlert[]): Promise<void> {
  if (alerts.length === 0) return;
  const sql = await getSql();
  const fresh = alerts.slice(0, 24);
  for (const a of fresh) {
    await sql`
      insert into volume_alerts (
        id, symbol, pair, name, kind, severity, title, detail,
        quote_usd, price, change_24h, venues, created_at
      ) values (
        ${a.id}, ${a.symbol}, ${a.pair}, ${a.name}, ${a.kind}, ${a.severity},
        ${a.title}, ${a.detail}, ${a.quoteUsd}, ${a.price}, ${a.change24h},
        ${a.venues.join(",")}, ${a.ts}
      )
      on conflict (id) do nothing
    `;
  }
  await sql`delete from volume_alerts where created_at < now() - interval '36 hours'`;
}

export async function loadRecentAlerts(): Promise<VolumeAlert[]> {
  const sql = await getSql();
  const rows = await sql<AlertRow>`
    select id, symbol, pair, name, kind, severity, title, detail,
           quote_usd, price, change_24h, venues, created_at::text as created_at
    from volume_alerts
    where created_at > now() - interval '8 hours'
    order by created_at desc
    limit 80
  `;
  return rows.map((r) => ({
    id: r.id,
    symbol: r.symbol,
    pair: r.pair,
    name: r.name,
    kind: r.kind as VolumeAlert["kind"],
    severity: r.severity as VolumeAlert["severity"],
    title: r.title,
    detail: r.detail,
    quoteUsd: num(r.quote_usd),
    price: num(r.price),
    change24h: num(r.change_24h),
    ts: r.created_at,
    venues: (r.venues ? r.venues.split(",") : []) as VolumeAlert["venues"],
  }));
}

export async function loadCaughtEarly(live: Gem[]): Promise<Gem[]> {
  const sql = await getSql();
  const rows = await sql<GemRow>`
    select symbol, name, pair, venue, first_seen_at::text as first_seen_at,
           first_price, last_price, high_since_detect, last_score, last_crime_risk,
           last_change_24h, last_quote_volume, last_market_cap, last_status, reasons,
           updated_at::text as updated_at, last_conviction
    from gems
    order by first_seen_at desc
    limit 16
  `;
  const liveMap = new Map(live.map((g) => [g.symbol, g]));
  return rows.map((row) => {
    const liveGem = liveMap.get(row.symbol);
    if (liveGem) return applyTrack(liveGem, row);
    return fallbackGem(row);
  });
}

export async function loadSnapshots(symbol: string) {
  const sql = await getSql();
  const rows = await sql<SnapRow>`
    select price, quote_volume, change_24h, score, crime_risk,
           captured_at::text as captured_at
    from gem_snapshots
    where symbol = ${symbol.toUpperCase()}
    order by captured_at asc
    limit 240
  `;
  return rows.map((r) => ({
    price: num(r.price),
    quoteVolume: num(r.quote_volume),
    change24h: num(r.change_24h),
    score: num(r.score),
    crimeRisk: num(r.crime_risk),
    capturedAt: r.captured_at,
  }));
}

export async function loadGemRow(symbol: string): Promise<GemRow | null> {
  const sql = await getSql();
  const rows = await sql<GemRow>`
    select symbol, name, pair, venue, first_seen_at::text as first_seen_at,
           first_price, last_price, high_since_detect, last_score, last_crime_risk,
           last_change_24h, last_quote_volume, last_market_cap, last_status, reasons,
           updated_at::text as updated_at, last_conviction
    from gems
    where symbol = ${symbol.toUpperCase()}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function loadSymbolAlerts(symbol: string): Promise<VolumeAlert[]> {
  const sql = await getSql();
  const rows = await sql<AlertRow>`
    select id, symbol, pair, name, kind, severity, title, detail,
           quote_usd, price, change_24h, venues, created_at::text as created_at
    from volume_alerts
    where symbol = ${symbol.toUpperCase()}
    order by created_at desc
    limit 24
  `;
  return rows.map((r) => ({
    id: r.id,
    symbol: r.symbol,
    pair: r.pair,
    name: r.name,
    kind: r.kind as VolumeAlert["kind"],
    severity: r.severity as VolumeAlert["severity"],
    title: r.title,
    detail: r.detail,
    quoteUsd: num(r.quote_usd),
    price: num(r.price),
    change24h: num(r.change_24h),
    ts: r.created_at,
    venues: (r.venues ? r.venues.split(",") : []) as VolumeAlert["venues"],
  }));
}
