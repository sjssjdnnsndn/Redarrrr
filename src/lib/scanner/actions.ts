import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { GemDetail, ScanResult, VolumeAlert } from "./types";

function mergeAlerts(live: VolumeAlert[], stored: VolumeAlert[]): VolumeAlert[] {
  const map = new Map<string, VolumeAlert>();
  for (const a of [...live, ...stored]) {
    if (!map.has(a.id)) map.set(a.id, a);
  }
  return [...map.values()]
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 80);
}

export const scanMarket = createServerFn({ method: "GET" }).handler(
  async (): Promise<ScanResult> => {
    const { runScan } = await import("./binance.server");
    const { persistAndMerge, loadCaughtEarly, persistAlerts, loadRecentAlerts } =
      await import("./persist.server");
    const scan = await runScan();
    try {
      const pool = [...scan.gems, ...scan.early, ...scan.crime, ...scan.bursts];
      const merged = await persistAndMerge(pool);
      const bySym = new Map(merged.map((g) => [g.symbol, g]));
      const gems = scan.gems.map((g) => bySym.get(g.symbol) ?? g);
      const early = scan.early.map((g) => bySym.get(g.symbol) ?? g);
      const crime = scan.crime.map((g) => bySym.get(g.symbol) ?? g);
      const bursts = scan.bursts.map((g) => bySym.get(g.symbol) ?? g);
      const caughtEarly = await loadCaughtEarly([...gems, ...early, ...crime, ...bursts]);
      await persistAlerts(scan.alerts);
      const stored = await loadRecentAlerts();
      const alerts = mergeAlerts(scan.alerts, stored);
      return { ...scan, gems, early, crime, bursts, caughtEarly, alerts };
    } catch {
      return scan;
    }
  },
);

export const getGemDetail = createServerFn({ method: "POST" })
  .validator(z.object({ symbol: z.string().min(1).max(24) }))
  .handler(async ({ data }): Promise<GemDetail> => {
    const { findRawSymbol, loadCandles, loadMinuteCandles, liveAlerts } = await import(
      "./binance.server"
    );
    const { loadGemRow, loadSnapshots, loadSymbolAlerts } = await import("./persist.server");
    const symbol = data.symbol.toUpperCase();
    let gem = await findRawSymbol(symbol);
    try {
      const row = await loadGemRow(symbol);
      if (gem && row) {
        gem = {
          ...gem,
          firstSeenAt: row.first_seen_at,
          firstPrice: Number(row.first_price),
          highSinceDetect: Number(row.high_since_detect),
        };
      }
      const snapshots = await loadSnapshots(symbol);
      const [candles, minuteCandles] = gem
        ? await Promise.all([loadCandles(gem), loadMinuteCandles(gem)])
        : [[], []];
      const mem = liveAlerts().filter((a) => a.symbol === symbol);
      const stored = await loadSymbolAlerts(symbol);
      return {
        gem,
        snapshots,
        candles,
        minuteCandles,
        alerts: mergeAlerts(mem, stored).slice(0, 24),
      };
    } catch {
      const [candles, minuteCandles] = gem
        ? await Promise.all([loadCandles(gem), loadMinuteCandles(gem)])
        : [[], []];
      return { gem, snapshots: [], candles, minuteCandles, alerts: [] };
    }
  });

export const getWatchGems = createServerFn({ method: "POST" })
  .validator(z.object({ symbols: z.array(z.string().min(1).max(24)).max(40) }))
  .handler(async ({ data }) => {
    const { findRawSymbol } = await import("./binance.server");
    const { loadGemRow } = await import("./persist.server");
    const gems = [];
    for (const raw of data.symbols) {
      const symbol = raw.toUpperCase();
      let gem = await findRawSymbol(symbol);
      if (!gem) continue;
      try {
        const row = await loadGemRow(symbol);
        if (row) {
          gem = {
            ...gem,
            firstSeenAt: row.first_seen_at,
            firstPrice: Number(row.first_price),
            highSinceDetect: Number(row.high_since_detect),
          };
        }
      } catch {
        /* still return live */
      }
      gems.push(gem);
    }
    return gems;
  });
