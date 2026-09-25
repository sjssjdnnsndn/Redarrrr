import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GemList } from "@/components/gem-list";
import { Skeleton } from "@/components/ui/skeleton";
import { getWatchGems, scanMarket } from "@/lib/scanner/actions";
import type { Gem } from "@/lib/scanner/types";
import { useWatchlist } from "@/lib/watchlist";

export const Route = createFileRoute("/watchlist")({
  component: WatchlistPage,
});

function WatchlistPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const symbols = useWatchlist((s) => s.symbols);

  const scan = useQuery({
    queryKey: ["scan"],
    queryFn: () => scanMarket(),
    refetchInterval: 8_000,
  });

  const extra = useQuery({
    queryKey: ["watch", symbols],
    enabled: ready && symbols.length > 0,
    queryFn: () => getWatchGems({ data: { symbols } }),
    refetchInterval: 8_000,
  });

  const bySym = new Map(
    [
      ...(scan.data?.gems ?? []),
      ...(scan.data?.early ?? []),
      ...(scan.data?.bursts ?? []),
      ...(scan.data?.crime ?? []),
      ...(extra.data ?? []),
    ].map((g) => [g.symbol, g]),
  );
  const gems: Gem[] = symbols
    .map((s) => bySym.get(s))
    .filter((g): g is Gem => g != null);

  return (
    <AppShell live={Boolean(scan.data)}>
      <h1 className="font-display text-3xl tracking-tight">Watchlist</h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Personal list, stored on this device. Scout keeps scoring them on every sweep.
      </p>
      <div className="mt-8">
        {!ready || (symbols.length > 0 && extra.isLoading && gems.length === 0) ? (
          <div className="space-y-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : symbols.length === 0 ? (
          <div className="rounded-xl bg-surface px-5 py-12 text-center shadow-[var(--shadow-border)]">
            <p className="text-sm text-muted">
              Bookmark a name on the radar to follow its path from first print.
            </p>
          </div>
        ) : (
          <GemList gems={gems} />
        )}
      </div>
    </AppShell>
  );
}
