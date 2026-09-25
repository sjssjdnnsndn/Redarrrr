import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTape } from "@/components/alert-tape";
import { AppShell } from "@/components/app-shell";
import { GemList } from "@/components/gem-list";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/format";
import { scanMarket } from "@/lib/scanner/actions";
import type { Gem } from "@/lib/scanner/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: () => scanMarket(),
  component: Home,
});

type View = "early" | "gems" | "bursts" | "crime" | "caught";

function Home() {
  const initial = Route.useLoaderData();
  const scan = useQuery({
    queryKey: ["scan"],
    queryFn: () => scanMarket(),
    initialData: initial,
    refetchInterval: 8_000,
    refetchIntervalInBackground: true,
  });
  const [view, setView] = useState<View>("early");
  const [q, setQ] = useState("");
  const seen = useRef(new Set<string>());

  const data = scan.data;
  useEffect(() => {
    if (!data?.alerts) return;
    const cutoff = Date.now() - 25_000;
    for (const alert of data.alerts) {
      if (seen.current.has(alert.id)) continue;
      if (new Date(alert.ts).getTime() < cutoff) {
        seen.current.add(alert.id);
        continue;
      }
      if (alert.severity === "info") {
        seen.current.add(alert.id);
        continue;
      }
      seen.current.add(alert.id);
      toast(alert.title, { description: alert.detail });
    }
  }, [data]);

  const list = useMemo(() => {
    let rows: Gem[] = data?.early ?? [];
    if (view === "gems") rows = data?.gems ?? [];
    if (view === "bursts") rows = data?.bursts ?? [];
    if (view === "crime") rows = data?.crime ?? [];
    if (view === "caught") rows = data?.caughtEarly ?? [];
    const query = q.trim().toLowerCase();
    if (query) {
      rows = rows.filter(
        (g) =>
          g.symbol.toLowerCase().includes(query) ||
          g.name.toLowerCase().includes(query),
      );
    }
    return rows;
  }, [data, view, q]);

  const liveAlerts = (data?.alerts ?? []).slice(0, 5);

  return (
    <AppShell live={Boolean(data) && !data.error}>
      <section className="mb-8 sm:mb-10">
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted">
          Binance gem radar
        </p>
        <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-5xl">
          Catch the move
          <br className="hidden sm:block" /> while it is still quiet.
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
          Scout now scores live USDT-M tape — open interest, taker buys, 1-minute
          volume spikes, and sudden tickets — not just 24h prints. Early-edge
          names are still mid-range. The tape fires the moment volume or
          positions open hard.
        </p>
      </section>

      <StatsBar
        loading={scan.isLoading && !data}
        universe={data?.stats.universe}
        early={data?.stats.early}
        bursts={data?.stats.bursts}
        perps={data?.stats.perpPairs}
        scannedAt={data?.scannedAt}
        stale={data?.stale}
        error={data?.error ?? (scan.isError ? "Radar feed paused" : null)}
      />

      {liveAlerts.length > 0 ? (
        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="text-xs uppercase tracking-wider text-subtle">Live tape</p>
            <p className="text-xs text-subtle">{data?.stats.bursts ?? 0} events in 5m</p>
          </div>
          <AlertTape alerts={liveAlerts} compact />
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {(
            [
              ["early", "Early edge"],
              ["bursts", "Live bursts"],
              ["gems", "All setups"],
              ["crime", "Crime tape"],
              ["caught", "Caught early"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={cn(
                "h-11 shrink-0 rounded-full px-4 text-sm transition-colors duration-150",
                view === id
                  ? "bg-accent text-accent-fg"
                  : "text-muted hover:bg-elevated hover:text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search symbol"
            className="pl-9"
            aria-label="Search symbol"
          />
        </label>
      </div>

      <div className="mt-4">
        {scan.isLoading && !data ? <ListSkeleton /> : <GemList gems={list} />}
      </div>
    </AppShell>
  );
}

function StatsBar({
  loading,
  universe,
  early,
  bursts,
  perps,
  scannedAt,
  stale,
  error,
}: {
  loading: boolean;
  universe?: number;
  early?: number;
  bursts?: number;
  perps?: number;
  scannedAt?: string;
  stale?: boolean;
  error?: string | null;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  const items = [
    { label: "Universe", value: universe?.toLocaleString() ?? "—" },
    { label: "Early edge", value: String(early ?? 0) },
    { label: "Tape 5m", value: String(bursts ?? 0) },
    { label: "USDT-M perps", value: perps?.toLocaleString() ?? "—" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]"
          >
            <p className="text-xs text-muted">{item.label}</p>
            <p className="mt-1 font-mono text-xl tabular-nums tracking-tight">
              {item.value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-subtle">
        {error ? (
          <span className="text-heat">{error}. Showing last known tape.</span>
        ) : stale ? (
          "Feed delayed — last snapshot held."
        ) : (
          <>Last sweep {timeAgo(scannedAt ?? null)} · Alpha + spot + USDT-M depth</>
        )}
      </p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-px overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-4">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
