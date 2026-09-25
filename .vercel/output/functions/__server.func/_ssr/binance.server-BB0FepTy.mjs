import { a as scoreMarket, i as isTradableAlpha, n as isLeveragedSpot, r as isMajor, t as isEarlyEdge } from "./score-CIeaah4v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/binance.server-BB0FepTy.js
var ALPHA_LIST = "https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/cex/alpha/all/token/list";
var ALPHA_KLINES = "https://www.binance.com/bapi/defi/v1/public/alpha-trade/klines";
var SPOT_TICKER = "https://api.binance.com/api/v3/ticker/24hr";
var SPOT_KLINES = "https://api.binance.com/api/v3/klines";
var FUT_TICKER = "https://fapi.binance.com/fapi/v1/ticker/24hr";
var FUT_PREMIUM = "https://fapi.binance.com/fapi/v1/premiumIndex";
var FUT_BOOK = "https://fapi.binance.com/fapi/v1/ticker/bookTicker";
var FUT_EXCHANGE = "https://fapi.binance.com/fapi/v1/exchangeInfo";
var FUT_OI = "https://fapi.binance.com/fapi/v1/openInterest";
var FUT_KLINES = "https://fapi.binance.com/fapi/v1/klines";
var FUT_TAKER = "https://fapi.binance.com/futures/data/takerlongshortRatio";
var FUT_OI_HIST = "https://fapi.binance.com/futures/data/openInterestHist";
var FUT_AGG = "https://fapi.binance.com/fapi/v1/aggTrades";
var SCAN_TTL_MS = 8e3;
var EXCHANGE_TTL_MS = 6e5;
var DEEP_TTL_MS = 18e3;
var DEEP_BUDGET_MS = 7200;
var DEEP_LIMIT = 16;
var DEEP_CONCURRENCY = 5;
var ALERT_RING = 120;
var BROWSER_HEADERS = {
	Accept: "application/json,text/plain,*/*",
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
	Origin: "https://www.binance.com",
	Referer: "https://www.binance.com/"
};
var g = globalThis;
function num(v) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : 0;
}
async function fetchJson(url, timeout = 1e4) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeout);
	try {
		const res = await fetch(url, {
			signal: ctrl.signal,
			headers: BROWSER_HEADERS
		});
		if (!res.ok) throw new Error(`Feed ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}
async function loadAlpha() {
	const hit = g.__scoutAlpha__;
	if (hit && Date.now() - hit.at < SCAN_TTL_MS) return hit.value;
	const body = await fetchJson(ALPHA_LIST);
	const rows = Array.isArray(body.data) ? body.data : [];
	g.__scoutAlpha__ = {
		at: Date.now(),
		value: rows
	};
	return rows;
}
async function loadPerpListings() {
	const hit = g.__scoutEx__;
	if (hit && Date.now() - hit.at < EXCHANGE_TTL_MS) return hit.value;
	try {
		const body = await fetchJson(FUT_EXCHANGE, 14e3);
		const map = /* @__PURE__ */ new Map();
		for (const s of body.symbols ?? []) {
			if (s.contractType !== "PERPETUAL") continue;
			if (s.quoteAsset !== "USDT") continue;
			if (s.status && s.status !== "TRADING") continue;
			if (s.onboardDate) map.set(s.symbol, s.onboardDate);
		}
		g.__scoutEx__ = {
			at: Date.now(),
			value: map
		};
		return map;
	} catch {
		return hit?.value ?? /* @__PURE__ */ new Map();
	}
}
function burstFromPrev(key, quoteVolume, count, price, now) {
	const prev = g.__scoutPrev__?.get(key);
	if (!prev || now - prev.ts < 2e3 || now - prev.ts > 18e4) return {
		volumeBurstUsd: 0,
		tradeBurst: 0,
		avgTradeUsd: 0,
		burstRvol: 0,
		dt: 0
	};
	const dt = Math.max(1, (now - prev.ts) / 1e3);
	const volumeBurstUsd = Math.max(0, quoteVolume - prev.quoteVolume);
	const tradeBurst = Math.max(0, count - prev.count);
	const avgTradeUsd = tradeBurst > 0 ? volumeBurstUsd / tradeBurst : 0;
	const typicalPerSec = quoteVolume / 86400;
	const burstPerSec = volumeBurstUsd / dt;
	return {
		volumeBurstUsd,
		tradeBurst,
		avgTradeUsd,
		burstRvol: typicalPerSec > 1 ? burstPerSec / typicalPerSec : 0,
		dt
	};
}
function rememberTick(key, quoteVolume, count, price, now) {
	if (!g.__scoutPrev__) g.__scoutPrev__ = /* @__PURE__ */ new Map();
	g.__scoutPrev__.set(key, {
		quoteVolume,
		count,
		price,
		ts: now
	});
}
function resolvePerp(symbol, map) {
	const keys = [
		`${symbol}USDT`,
		`1000${symbol}USDT`,
		`1000000${symbol}USDT`
	];
	for (const key of keys) {
		const row = map.get(key);
		if (row) return {
			pair: key,
			row
		};
	}
}
function spreadBps(book) {
	if (!book || book.bid <= 0 || book.ask <= 0 || book.ask < book.bid) return null;
	const mid = (book.bid + book.ask) / 2;
	if (mid <= 0) return null;
	return (book.ask - book.bid) / mid * 1e4;
}
function emptyDeep() {
	return {
		oiUsd: null,
		oiChange5m: null,
		takerBuyRatio: null,
		volSpike1m: null,
		whalePrints: 0,
		whaleUsd: 0
	};
}
async function loadDeep(pair, markPrice) {
	if (!g.__scoutDeep__) g.__scoutDeep__ = /* @__PURE__ */ new Map();
	const hit = g.__scoutDeep__.get(pair);
	if (hit && Date.now() - hit.at < DEEP_TTL_MS) return hit.value;
	const out = emptyDeep();
	const jobs = [
		fetchJson(`${FUT_OI}?symbol=${pair}`, 5e3).then((row) => {
			const oi = num(row.openInterest);
			if (oi > 0 && markPrice > 0) out.oiUsd = oi * markPrice;
		}).catch(() => void 0),
		fetchJson(`${FUT_OI_HIST}?symbol=${pair}&period=5m&limit=3`, 5e3).then((rows) => {
			if (!Array.isArray(rows) || rows.length < 2) return;
			const latest = num(rows[rows.length - 1]?.sumOpenInterestValue);
			const prev = num(rows[0]?.sumOpenInterestValue);
			if (latest > 0) out.oiUsd = out.oiUsd ?? latest;
			if (prev > 0 && latest > 0) out.oiChange5m = (latest - prev) / prev * 100;
		}).catch(() => void 0),
		fetchJson(`${FUT_TAKER}?symbol=${pair}&period=5m&limit=4`, 5e3).then((rows) => {
			if (!Array.isArray(rows) || rows.length === 0) return;
			let buy = 0;
			let sell = 0;
			for (const row of rows) {
				buy += num(row.buyVol);
				sell += num(row.sellVol);
			}
			const tot = buy + sell;
			if (tot > 0) out.takerBuyRatio = buy / tot;
		}).catch(() => void 0),
		fetchJson(`${FUT_KLINES}?symbol=${pair}&interval=1m&limit=30`, 5e3).then((rows) => {
			const vols = [];
			if (!Array.isArray(rows)) return;
			for (const row of rows) if (Array.isArray(row) && row.length >= 8) vols.push(num(row[7]) || num(row[5]));
			if (vols.length < 6) return;
			const last = vols[vols.length - 1];
			const body = vols.slice(0, -1).sort((a, b) => a - b);
			const median = body[Math.floor(body.length / 2)] || 1;
			out.volSpike1m = median > 0 ? last / median : 0;
		}).catch(() => void 0),
		fetchJson(`${FUT_AGG}?symbol=${pair}&limit=80`, 5e3).then((rows) => {
			if (!Array.isArray(rows)) return;
			const cutoff = Date.now() - 9e4;
			let whaleUsd = 0;
			let prints = 0;
			for (const t of rows) {
				if (num(t.T) < cutoff) continue;
				const usd = num(t.p) * num(t.q);
				if (usd >= 8e4) {
					prints += 1;
					whaleUsd += usd;
				}
			}
			out.whalePrints = prints;
			out.whaleUsd = whaleUsd;
		}).catch(() => void 0)
	];
	await Promise.all(jobs);
	g.__scoutDeep__.set(pair, {
		at: Date.now(),
		value: out
	});
	return out;
}
async function mapPool(items, limit, deadline, fn) {
	let i = 0;
	async function worker() {
		while (i < items.length && Date.now() < deadline) {
			const idx = i++;
			try {
				await fn(items[idx]);
			} catch {}
		}
	}
	const n = Math.min(limit, items.length);
	await Promise.all(Array.from({ length: n }, () => worker()));
}
function pushAlert(alert) {
	if (!g.__scoutAlerts__) g.__scoutAlerts__ = [];
	if (g.__scoutAlerts__.find((a) => a.symbol === alert.symbol && a.kind === alert.kind && Date.now() - new Date(a.ts).getTime() < 9e4)) return;
	g.__scoutAlerts__.unshift(alert);
	if (g.__scoutAlerts__.length > ALERT_RING) g.__scoutAlerts__.length = ALERT_RING;
}
function alertsFromRaw(raw, nowIso) {
	const burst = raw.volumeBurstUsd;
	const rvol = raw.burstRvol;
	if (rvol >= 8 && burst >= 4e4) {
		const severity = rvol >= 22 && burst >= 2e5 ? "critical" : rvol >= 12 || burst >= 25e4 ? "high" : "info";
		pushAlert({
			id: `${raw.symbol}-burst-${Math.floor(Date.now() / 3e4)}`,
			symbol: raw.symbol,
			pair: raw.pair,
			name: raw.name,
			kind: "volume_burst",
			severity,
			title: `${raw.symbol} volume burst`,
			detail: `$${Math.round(burst).toLocaleString()} hit in the last sweep · ${rvol >= 99 ? "99×+" : `${rvol.toFixed(1)}×`} normal pace`,
			quoteUsd: burst,
			price: raw.price,
			change24h: raw.change24h,
			ts: nowIso,
			venues: raw.venues
		});
	}
	if (raw.avgTradeUsd >= 25e3 && burst >= 6e4) pushAlert({
		id: `${raw.symbol}-whale-${Math.floor(Date.now() / 3e4)}`,
		symbol: raw.symbol,
		pair: raw.pair,
		name: raw.name,
		kind: "whale_print",
		severity: raw.avgTradeUsd >= 8e4 ? "high" : "info",
		title: `${raw.symbol} large prints`,
		detail: `Avg ticket $${Math.round(raw.avgTradeUsd).toLocaleString()} · ${raw.tradeBurst} new trades`,
		quoteUsd: burst,
		price: raw.price,
		change24h: raw.change24h,
		ts: nowIso,
		venues: raw.venues
	});
	if ((raw.oiChange5m ?? 0) >= 10 && (raw.oiUsd ?? 0) > 2e5) pushAlert({
		id: `${raw.symbol}-oi-${Math.floor(Date.now() / 6e4)}`,
		symbol: raw.symbol,
		pair: raw.pair,
		name: raw.name,
		kind: "oi_surge",
		severity: (raw.oiChange5m ?? 0) >= 18 ? "critical" : "high",
		title: `${raw.symbol} open interest surge`,
		detail: `OI ${raw.oiChange5m.toFixed(1)}% in 5m · $${Math.round(raw.oiUsd ?? 0).toLocaleString()} notional`,
		quoteUsd: raw.oiUsd ?? 0,
		price: raw.price,
		change24h: raw.change24h,
		ts: nowIso,
		venues: raw.venues
	});
	if ((raw.takerBuyRatio ?? 0) >= .68 && (rvol >= 3 || (raw.volSpike1m ?? 0) >= 2.5)) pushAlert({
		id: `${raw.symbol}-taker-${Math.floor(Date.now() / 6e4)}`,
		symbol: raw.symbol,
		pair: raw.pair,
		name: raw.name,
		kind: "taker_sweep",
		severity: "high",
		title: `${raw.symbol} taker buy sweep`,
		detail: `${Math.round((raw.takerBuyRatio ?? 0) * 100)}% aggressive buys on USDT-M`,
		quoteUsd: burst,
		price: raw.price,
		change24h: raw.change24h,
		ts: nowIso,
		venues: raw.venues
	});
	if (raw.whalePrints >= 2 || raw.whaleUsd >= 2e5) pushAlert({
		id: `${raw.symbol}-agg-${Math.floor(Date.now() / 45e3)}`,
		symbol: raw.symbol,
		pair: raw.pair,
		name: raw.name,
		kind: "whale_print",
		severity: raw.whaleUsd >= 5e5 ? "critical" : "high",
		title: `${raw.symbol} whale tape`,
		detail: `${raw.whalePrints} prints ≥ $80k in 90s · $${Math.round(raw.whaleUsd).toLocaleString()}`,
		quoteUsd: raw.whaleUsd,
		price: raw.price,
		change24h: raw.change24h,
		ts: nowIso,
		venues: raw.venues
	});
	if (raw.perpListedAt && Date.now() - raw.perpListedAt < 216e5) pushAlert({
		id: `${raw.symbol}-newperp-${raw.perpListedAt}`,
		symbol: raw.symbol,
		pair: raw.pair,
		name: raw.name,
		kind: "new_perp",
		severity: "info",
		title: `${raw.symbol} new USDT-M listing`,
		detail: "Perpetual listed in the last 6 hours — first-hours tape is live",
		quoteUsd: raw.perpVolume24h ?? 0,
		price: raw.price,
		change24h: raw.change24h,
		ts: nowIso,
		venues: raw.venues
	});
}
function withBurst(base, extra) {
	return {
		...base,
		...extra,
		oiUsd: null,
		oiChange5m: null,
		takerBuyRatio: null,
		volSpike1m: null,
		whalePrints: 0,
		whaleUsd: 0
	};
}
function alphaToRaw(t, now, perps, spot, funding, books, listings) {
	if (!isTradableAlpha(t)) return null;
	const symbol = String(t.symbol ?? "").trim();
	if (!symbol) return null;
	const price = num(t.price);
	if (price <= 0) return null;
	const key = symbol.toUpperCase();
	const spotRow = spot.get(`${key}USDT`) ?? (t.cexCoinName ? spot.get(`${t.cexCoinName.toUpperCase()}USDT`) : void 0);
	const futHit = resolvePerp(key, perps);
	const pair = futHit?.pair ?? `${key}USDT`;
	const fut = futHit?.row;
	const prem = funding.get(pair);
	const venues = ["alpha"];
	if (spotRow) venues.push("spot");
	if (fut && num(fut.quoteVolume) > 0) venues.push("perp");
	const quote = num(t.volume24h) || (spotRow ? num(spotRow.quoteVolume) : 0);
	const count = fut ? num(fut.count) : spotRow ? num(spotRow.count) : 0;
	const burst = burstFromPrev(`a:${key}`, quote, count, price, now);
	const book = books.get(pair);
	return withBurst({
		id: String(t.tokenId || `${key}-${t.chainId || "alpha"}`),
		symbol: key,
		name: String(t.name || symbol),
		pair,
		iconUrl: t.iconUrl || null,
		price,
		change24h: num(t.percentChange24h),
		volume24h: quote,
		marketCap: num(t.marketCap),
		fdv: num(t.fdv),
		liquidity: num(t.liquidity),
		holders: num(t.holders),
		circSupply: num(t.circulatingSupply),
		totalSupply: num(t.totalSupply),
		listingTime: num(t.listingTime) || null,
		listingCex: Boolean(t.listingCex),
		hotTag: Boolean(t.hotTag),
		alphaId: t.alphaId ? String(t.alphaId) : null,
		contractAddress: t.contractAddress || null,
		chainName: t.chainName || null,
		venues,
		fundingRate: prem ? num(prem.lastFundingRate) : null,
		perpVolume24h: fut ? num(fut.quoteVolume) : null,
		spotVolume24h: spotRow ? num(spotRow.quoteVolume) : null,
		high24h: num(t.priceHigh24h) || num(spotRow?.highPrice) || num(fut?.highPrice),
		low24h: num(t.priceLow24h) || num(spotRow?.lowPrice) || num(fut?.lowPrice)
	}, {
		tradeCount24h: count,
		volumeBurstUsd: burst.volumeBurstUsd,
		tradeBurst: burst.tradeBurst,
		avgTradeUsd: burst.avgTradeUsd,
		burstRvol: burst.burstRvol,
		spreadBps: spreadBps(book),
		markPrice: prem ? num(prem.markPrice) : null,
		indexPrice: prem ? num(prem.indexPrice) : null,
		perpListedAt: listings.get(pair) ?? null
	});
}
function spotOnlyRaw(t, now, perps, funding, books, listings, already) {
	if (!t.symbol.endsWith("USDT")) return null;
	if (isLeveragedSpot(t.symbol)) return null;
	const base = t.symbol.slice(0, -4);
	if (already.has(base) || isMajor(base)) return null;
	const price = num(t.lastPrice);
	const vol = num(t.quoteVolume);
	if (price <= 0 || price > 12) return null;
	if (vol < 12e5 && num(t.priceChangePercent) < 8) return null;
	const futHit = resolvePerp(base, perps);
	const fut = futHit?.row;
	const perpPair = futHit?.pair ?? t.symbol;
	const prem = funding.get(perpPair);
	const venues = ["spot"];
	if (fut && num(fut.quoteVolume) > 0) venues.push("perp");
	const count = num(t.count);
	const burst = burstFromPrev(`s:${base}`, vol, count, price, now);
	return withBurst({
		id: `spot-${t.symbol}`,
		symbol: base,
		name: base,
		pair: perpPair,
		iconUrl: null,
		price,
		change24h: num(t.priceChangePercent),
		volume24h: vol,
		marketCap: 0,
		fdv: 0,
		liquidity: 0,
		holders: 0,
		circSupply: 0,
		totalSupply: 0,
		listingTime: null,
		listingCex: true,
		hotTag: false,
		alphaId: null,
		contractAddress: null,
		chainName: null,
		venues,
		fundingRate: prem ? num(prem.lastFundingRate) : null,
		perpVolume24h: fut ? num(fut.quoteVolume) : null,
		spotVolume24h: vol,
		high24h: num(t.highPrice),
		low24h: num(t.lowPrice)
	}, {
		tradeCount24h: count,
		volumeBurstUsd: burst.volumeBurstUsd,
		tradeBurst: burst.tradeBurst,
		avgTradeUsd: burst.avgTradeUsd,
		burstRvol: burst.burstRvol,
		spreadBps: spreadBps(books.get(perpPair)),
		markPrice: prem ? num(prem.markPrice) : null,
		indexPrice: prem ? num(prem.indexPrice) : null,
		perpListedAt: listings.get(perpPair) ?? null
	});
}
function perpOnlyRaw(t, now, funding, books, listings, already) {
	if (!t.symbol.endsWith("USDT")) return null;
	if (t.symbol.includes("_")) return null;
	const base = t.symbol.slice(0, -4);
	if (!base || already.has(base) || isMajor(base) || isLeveragedSpot(t.symbol)) return null;
	const price = num(t.lastPrice);
	const vol = num(t.quoteVolume);
	const listedAt = listings.get(t.symbol) ?? null;
	const ageH = listedAt ? (now - listedAt) / 36e5 : 9999;
	const burst = burstFromPrev(`f:${base}`, vol, num(t.count), price, now);
	const fresh = ageH <= 336;
	const heating = burst.burstRvol >= 5 && burst.volumeBurstUsd >= 4e4;
	if (price <= 0 || vol < 2e5) return null;
	if (!fresh && !heating) return null;
	if (!fresh && vol < 2e6) return null;
	const prem = funding.get(t.symbol);
	return withBurst({
		id: `perp-${t.symbol}`,
		symbol: base,
		name: base,
		pair: t.symbol,
		iconUrl: null,
		price,
		change24h: num(t.priceChangePercent),
		volume24h: vol,
		marketCap: 0,
		fdv: 0,
		liquidity: 0,
		holders: 0,
		circSupply: 0,
		totalSupply: 0,
		listingTime: listedAt,
		listingCex: true,
		hotTag: false,
		alphaId: null,
		contractAddress: null,
		chainName: null,
		venues: ["perp"],
		fundingRate: prem ? num(prem.lastFundingRate) : null,
		perpVolume24h: vol,
		spotVolume24h: null,
		high24h: num(t.highPrice),
		low24h: num(t.lowPrice)
	}, {
		tradeCount24h: num(t.count),
		volumeBurstUsd: burst.volumeBurstUsd,
		tradeBurst: burst.tradeBurst,
		avgTradeUsd: burst.avgTradeUsd,
		burstRvol: burst.burstRvol,
		spreadBps: spreadBps(books.get(t.symbol)),
		markPrice: prem ? num(prem.markPrice) : null,
		indexPrice: prem ? num(prem.indexPrice) : null,
		perpListedAt: listedAt
	});
}
function pickDeepTargets(raws) {
	const withPerp = raws.filter((r) => r.venues.includes("perp") && !isMajor(r.symbol));
	const byBurst = [...withPerp].sort((a, b) => b.volumeBurstUsd - a.volumeBurstUsd).slice(0, 10);
	const byScoreSeed = [...withPerp].sort((a, b) => b.burstRvol - a.burstRvol || b.volume24h - a.volume24h).slice(0, 8);
	const fresh = withPerp.filter((r) => {
		if (!r.perpListedAt) return false;
		return Date.now() - r.perpListedAt < 432e6 && r.volume24h >= 25e4;
	});
	const map = /* @__PURE__ */ new Map();
	for (const row of [
		...byBurst,
		...byScoreSeed,
		...fresh
	]) map.set(row.pair, row);
	return [...map.values()].slice(0, DEEP_LIMIT);
}
async function runScan() {
	const hit = g.__scoutScan__;
	if (hit && Date.now() - hit.at < SCAN_TTL_MS) return hit.value;
	const now = Date.now();
	try {
		const [alpha, spot, fut, prem, book, listings] = await Promise.all([
			loadAlpha(),
			fetchJson(SPOT_TICKER).catch(() => []),
			fetchJson(FUT_TICKER).catch(() => []),
			fetchJson(FUT_PREMIUM).catch(() => []),
			fetchJson(FUT_BOOK).catch(() => []),
			loadPerpListings()
		]);
		const spotMap = /* @__PURE__ */ new Map();
		for (const s of spot) spotMap.set(s.symbol, s);
		const futMap = /* @__PURE__ */ new Map();
		for (const f of fut) futMap.set(f.symbol, f);
		const premMap = /* @__PURE__ */ new Map();
		for (const p of prem) premMap.set(p.symbol, p);
		const bookMap = /* @__PURE__ */ new Map();
		for (const b of book) bookMap.set(b.symbol, {
			bid: num(b.bidPrice),
			ask: num(b.askPrice),
			bidQty: num(b.bidQty),
			askQty: num(b.askQty)
		});
		const raws = [];
		const seen = /* @__PURE__ */ new Set();
		for (const t of alpha) {
			const raw = alphaToRaw(t, now, futMap, spotMap, premMap, bookMap, listings);
			if (!raw) continue;
			seen.add(raw.symbol);
			raws.push(raw);
		}
		for (const s of spot) {
			const raw = spotOnlyRaw(s, now, futMap, premMap, bookMap, listings, seen);
			if (!raw) continue;
			seen.add(raw.symbol);
			raws.push(raw);
		}
		for (const f of fut) {
			const raw = perpOnlyRaw(f, now, premMap, bookMap, listings, seen);
			if (!raw) continue;
			seen.add(raw.symbol);
			raws.push(raw);
		}
		const deepHits = pickDeepTargets(raws);
		const deepMap = /* @__PURE__ */ new Map();
		await mapPool(deepHits, DEEP_CONCURRENCY, now + DEEP_BUDGET_MS, async (row) => {
			const mark = row.markPrice || row.price;
			const deep = await loadDeep(row.pair, mark);
			deepMap.set(row.pair, deep);
		});
		const nowIso = (/* @__PURE__ */ new Date()).toISOString();
		for (const raw of raws) {
			const deep = deepMap.get(raw.pair);
			if (deep) {
				raw.oiUsd = deep.oiUsd;
				raw.oiChange5m = deep.oiChange5m;
				raw.takerBuyRatio = deep.takerBuyRatio;
				raw.volSpike1m = deep.volSpike1m;
				raw.whalePrints = deep.whalePrints;
				raw.whaleUsd = deep.whaleUsd;
			}
			alertsFromRaw(raw, nowIso);
			rememberTick(raw.venues.includes("alpha") ? `a:${raw.symbol}` : raw.venues[0] === "spot" ? `s:${raw.symbol}` : `f:${raw.symbol}`, raw.volume24h, raw.tradeCount24h, raw.price, now);
			if (raw.venues.includes("perp")) rememberTick(`f:${raw.symbol}`, raw.perpVolume24h ?? raw.volume24h, raw.tradeCount24h, raw.price, now);
		}
		for (const f of fut) {
			if (!f.symbol.endsWith("USDT") || f.symbol.includes("_")) continue;
			const base = f.symbol.slice(0, -4);
			if (!isMajor(base)) continue;
			const quote = num(f.quoteVolume);
			const count = num(f.count);
			const price = num(f.lastPrice);
			const burst = burstFromPrev(`maj:${base}`, quote, count, price, now);
			rememberTick(`maj:${base}`, quote, count, price, now);
			if (burst.burstRvol >= 6 && burst.volumeBurstUsd >= 15e5) pushAlert({
				id: `${base}-maj-${Math.floor(now / 3e4)}`,
				symbol: base,
				pair: f.symbol,
				name: base,
				kind: "volume_burst",
				severity: burst.volumeBurstUsd >= 12e6 ? "critical" : "high",
				title: `${base} futures volume spike`,
				detail: `$${Math.round(burst.volumeBurstUsd).toLocaleString()} on USDT-M in the last sweep · ${burst.burstRvol >= 99 ? "99×+" : `${burst.burstRvol.toFixed(1)}×`} pace`,
				quoteUsd: burst.volumeBurstUsd,
				price,
				change24h: num(f.priceChangePercent),
				ts: nowIso,
				venues: ["perp"]
			});
		}
		const scored = raws.map((r) => scoreMarket(r, now)).filter((row) => row.volume24h >= 8e4 || row.score >= 40 || row.volumeBurstUsd >= 4e4);
		const bySymbol = /* @__PURE__ */ new Map();
		for (const row of scored) {
			const prev = bySymbol.get(row.symbol);
			if (!prev || row.conviction > prev.conviction || row.conviction === prev.conviction && row.score > prev.score) bySymbol.set(row.symbol, row);
		}
		const unique = [...bySymbol.values()];
		unique.sort((a, b) => b.conviction - a.conviction || b.score - a.score || b.volumeBurstUsd - a.volumeBurstUsd);
		const early = unique.filter(isEarlyEdge).slice(0, 40);
		const gems = unique.filter((row) => row.score >= 42 || row.conviction >= 50).slice(0, 60);
		const gemSet = new Set(gems.map((row) => row.symbol));
		const crime = unique.filter((row) => row.crimeRisk >= 55 && !gemSet.has(row.symbol)).sort((a, b) => b.crimeRisk - a.crimeRisk).slice(0, 24);
		const bursts = unique.filter((row) => row.volumeBurstUsd >= 4e4 && row.burstRvol >= 3.5).sort((a, b) => b.volumeBurstUsd - a.volumeBurstUsd).slice(0, 32);
		const alerts = (g.__scoutAlerts__ ?? []).slice(0, 80);
		const result = {
			gems,
			early,
			crime,
			caughtEarly: [],
			bursts,
			alerts,
			stats: {
				universe: raws.length,
				alphaLive: alpha.filter((t) => isTradableAlpha(t)).length,
				spotPairs: spot.filter((s) => s.symbol.endsWith("USDT")).length,
				perpPairs: fut.filter((s) => s.symbol.endsWith("USDT") && !s.symbol.includes("_")).length,
				heating: gems.filter((row) => row.status === "heating").length,
				launching: gems.filter((row) => row.status === "launching").length,
				mooning: gems.filter((row) => row.status === "mooning").length,
				dumped: unique.filter((row) => row.status === "dumped").length,
				early: early.length,
				bursts: alerts.filter((a) => Date.now() - new Date(a.ts).getTime() < 3e5).length
			},
			scannedAt: nowIso,
			intervalMs: SCAN_TTL_MS,
			stale: false,
			error: null
		};
		g.__scoutScan__ = {
			at: Date.now(),
			value: result
		};
		return result;
	} catch (err) {
		if (hit) return {
			...hit.value,
			stale: true,
			error: err instanceof Error ? err.message : "Feed error"
		};
		return {
			gems: [],
			early: [],
			crime: [],
			caughtEarly: [],
			bursts: [],
			alerts: g.__scoutAlerts__ ?? [],
			stats: {
				universe: 0,
				alphaLive: 0,
				spotPairs: 0,
				perpPairs: 0,
				heating: 0,
				launching: 0,
				mooning: 0,
				dumped: 0,
				early: 0,
				bursts: 0
			},
			scannedAt: (/* @__PURE__ */ new Date()).toISOString(),
			intervalMs: SCAN_TTL_MS,
			stale: true,
			error: err instanceof Error ? err.message : "Binance feed unreachable"
		};
	}
}
function liveAlerts() {
	return (g.__scoutAlerts__ ?? []).slice(0, 80);
}
async function findRawSymbol(symbol) {
	const scan = await runScan();
	const key = symbol.toUpperCase();
	const fromScan = scan.gems.find((row) => row.symbol === key) || scan.early.find((row) => row.symbol === key) || scan.crime.find((row) => row.symbol === key) || scan.bursts.find((row) => row.symbol === key) || scan.caughtEarly.find((row) => row.symbol === key);
	if (fromScan) return fromScan;
	const row = (await loadAlpha()).find((t) => String(t.symbol).toUpperCase() === key);
	if (row) {
		const raw = alphaToRaw(row, Date.now(), /* @__PURE__ */ new Map(), /* @__PURE__ */ new Map(), /* @__PURE__ */ new Map(), /* @__PURE__ */ new Map(), /* @__PURE__ */ new Map());
		return raw ? scoreMarket(raw) : null;
	}
	return null;
}
function parseCandles(input) {
	if (!Array.isArray(input)) return [];
	const out = [];
	for (const row of input) {
		if (Array.isArray(row) && row.length >= 6) {
			out.push({
				time: num(row[0]),
				open: num(row[1]),
				high: num(row[2]),
				low: num(row[3]),
				close: num(row[4]),
				volume: num(row[7]) || num(row[5])
			});
			continue;
		}
		if (row && typeof row === "object") {
			const o = row;
			const time = num(o.openTime ?? o.t ?? o.time);
			const close = num(o.close ?? o.c);
			if (time && close) out.push({
				time,
				open: num(o.open ?? o.o),
				high: num(o.high ?? o.h),
				low: num(o.low ?? o.l),
				close,
				volume: num(o.volume ?? o.v)
			});
		}
	}
	return out.filter((c) => c.close > 0);
}
async function loadCandles(gem) {
	try {
		if (gem.venues.includes("perp")) {
			const candles = parseCandles(await fetchJson(`${FUT_KLINES}?symbol=${encodeURIComponent(gem.pair)}&interval=15m&limit=96`));
			if (candles.length > 2) return candles;
		}
		if (gem.alphaId) {
			const body = await fetchJson(`${ALPHA_KLINES}?symbol=${encodeURIComponent(`${gem.alphaId}USDT`)}&interval=1h&limit=72`);
			const candles = parseCandles(body && typeof body === "object" && "data" in body ? body.data : body);
			if (candles.length > 2) return candles;
		}
		return parseCandles(await fetchJson(`${SPOT_KLINES}?symbol=${encodeURIComponent(gem.pair)}&interval=1h&limit=72`));
	} catch {
		return [];
	}
}
async function loadMinuteCandles(gem) {
	try {
		if (gem.venues.includes("perp")) {
			const candles = parseCandles(await fetchJson(`${FUT_KLINES}?symbol=${encodeURIComponent(gem.pair)}&interval=1m&limit=60`));
			if (candles.length > 2) return candles;
		}
		return parseCandles(await fetchJson(`${SPOT_KLINES}?symbol=${encodeURIComponent(gem.pair)}&interval=1m&limit=60`));
	} catch {
		return [];
	}
}
//#endregion
export { findRawSymbol, liveAlerts, loadCandles, loadMinuteCandles, runScan };
