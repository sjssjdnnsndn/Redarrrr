import { o as shouldPersist } from "./score-CIeaah4v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/persist.server-yy7VG2vz.js
var _0002_gems_default = "-- Shared market detections (unowned — no user accounts).\ncreate table if not exists gems (\n  symbol              text primary key,\n  name                text not null default '',\n  pair                text not null default '',\n  venue               text not null default 'alpha',\n  first_seen_at       timestamptz not null default now(),\n  first_price         numeric not null,\n  last_price          numeric not null,\n  high_since_detect   numeric not null,\n  last_score          integer not null default 0,\n  last_crime_risk     integer not null default 0,\n  last_change_24h     numeric not null default 0,\n  last_quote_volume   numeric not null default 0,\n  last_market_cap     numeric not null default 0,\n  last_status         text not null default 'heating',\n  reasons             text not null default '',\n  updated_at          timestamptz not null default now()\n);\n\ncreate index if not exists gems_updated_at_idx on gems (updated_at desc);\ncreate index if not exists gems_first_seen_at_idx on gems (first_seen_at desc);\ncreate index if not exists gems_last_score_idx on gems (last_score desc);\n\ncreate table if not exists gem_snapshots (\n  id             serial primary key,\n  symbol         text not null,\n  price          numeric not null,\n  quote_volume   numeric not null,\n  change_24h     numeric not null,\n  score          integer not null,\n  crime_risk     integer not null default 0,\n  captured_at    timestamptz not null default now()\n);\n\ncreate index if not exists gem_snapshots_symbol_time_idx\n  on gem_snapshots (symbol, captured_at desc);\n";
var _0003_volume_alerts_default = "-- Live tape of sudden volume / open-interest events (unowned).\nalter table gems add column if not exists last_conviction integer not null default 0;\nalter table gems add column if not exists last_oi_usd numeric not null default 0;\nalter table gems add column if not exists last_burst_usd numeric not null default 0;\n\ncreate table if not exists volume_alerts (\n  id           text primary key,\n  symbol       text not null,\n  pair         text not null default '',\n  name         text not null default '',\n  kind         text not null,\n  severity     text not null default 'info',\n  title        text not null,\n  detail       text not null default '',\n  quote_usd    numeric not null default 0,\n  price        numeric not null default 0,\n  change_24h   numeric not null default 0,\n  venues       text not null default '',\n  created_at   timestamptz not null default now()\n);\n\ncreate index if not exists volume_alerts_created_at_idx\n  on volume_alerts (created_at desc);\n\ncreate index if not exists volume_alerts_symbol_time_idx\n  on volume_alerts (symbol, created_at desc);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_gems.sql": _0002_gems_default,
			"/migrations/0003_volume_alerts.sql": _0003_volume_alerts_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
function num(v) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : 0;
}
function applyTrack(gem, row) {
	const firstPrice = num(row.first_price);
	return {
		...gem,
		firstSeenAt: row.first_seen_at,
		firstPrice,
		highSinceDetect: num(row.high_since_detect)
	};
}
function fallbackGem(row) {
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
		status: row.last_status || "heating",
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
		alertKinds: []
	};
}
async function persistAndMerge(gems) {
	const sql = await getSql();
	const keep = gems.filter(shouldPersist).slice(0, 48);
	for (const gem of keep) {
		const venue = gem.venues.includes("alpha") ? "alpha" : gem.venues.includes("perp") ? "perp" : gem.venues[0] ?? "spot";
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
		const latest = await sql.query(`select symbol, max(captured_at)::text as last_at from gem_snapshots group by symbol`);
		const lastMap = new Map(latest.map((r) => [r.symbol, new Date(r.last_at).getTime()]));
		const cutoff = Date.now() - 9e4;
		for (const gem of keep) {
			if ((lastMap.get(gem.symbol) ?? 0) > cutoff) continue;
			await sql`
        insert into gem_snapshots (symbol, price, quote_volume, change_24h, score, crime_risk)
        values (${gem.symbol}, ${gem.price}, ${gem.volume24h}, ${gem.change24h}, ${gem.score}, ${gem.crimeRisk})
      `;
		}
	}
	const tracked = await sql`
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
async function persistAlerts(alerts) {
	if (alerts.length === 0) return;
	const sql = await getSql();
	const fresh = alerts.slice(0, 24);
	for (const a of fresh) await sql`
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
	await sql`delete from volume_alerts where created_at < now() - interval '36 hours'`;
}
async function loadRecentAlerts() {
	return (await (await getSql())`
    select id, symbol, pair, name, kind, severity, title, detail,
           quote_usd, price, change_24h, venues, created_at::text as created_at
    from volume_alerts
    where created_at > now() - interval '8 hours'
    order by created_at desc
    limit 80
  `).map((r) => ({
		id: r.id,
		symbol: r.symbol,
		pair: r.pair,
		name: r.name,
		kind: r.kind,
		severity: r.severity,
		title: r.title,
		detail: r.detail,
		quoteUsd: num(r.quote_usd),
		price: num(r.price),
		change24h: num(r.change_24h),
		ts: r.created_at,
		venues: r.venues ? r.venues.split(",") : []
	}));
}
async function loadCaughtEarly(live) {
	const rows = await (await getSql())`
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
async function loadSnapshots(symbol) {
	return (await (await getSql())`
    select price, quote_volume, change_24h, score, crime_risk,
           captured_at::text as captured_at
    from gem_snapshots
    where symbol = ${symbol.toUpperCase()}
    order by captured_at asc
    limit 240
  `).map((r) => ({
		price: num(r.price),
		quoteVolume: num(r.quote_volume),
		change24h: num(r.change_24h),
		score: num(r.score),
		crimeRisk: num(r.crime_risk),
		capturedAt: r.captured_at
	}));
}
async function loadGemRow(symbol) {
	return (await (await getSql())`
    select symbol, name, pair, venue, first_seen_at::text as first_seen_at,
           first_price, last_price, high_since_detect, last_score, last_crime_risk,
           last_change_24h, last_quote_volume, last_market_cap, last_status, reasons,
           updated_at::text as updated_at, last_conviction
    from gems
    where symbol = ${symbol.toUpperCase()}
    limit 1
  `)[0] ?? null;
}
async function loadSymbolAlerts(symbol) {
	return (await (await getSql())`
    select id, symbol, pair, name, kind, severity, title, detail,
           quote_usd, price, change_24h, venues, created_at::text as created_at
    from volume_alerts
    where symbol = ${symbol.toUpperCase()}
    order by created_at desc
    limit 24
  `).map((r) => ({
		id: r.id,
		symbol: r.symbol,
		pair: r.pair,
		name: r.name,
		kind: r.kind,
		severity: r.severity,
		title: r.title,
		detail: r.detail,
		quoteUsd: num(r.quote_usd),
		price: num(r.price),
		change24h: num(r.change_24h),
		ts: r.created_at,
		venues: r.venues ? r.venues.split(",") : []
	}));
}
//#endregion
export { loadCaughtEarly, loadGemRow, loadRecentAlerts, loadSnapshots, loadSymbolAlerts, persistAlerts, persistAndMerge };
