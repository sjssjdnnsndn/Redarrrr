import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AlertTape } from "@/components/alert-tape";
import { AppShell } from "@/components/app-shell";
import { PriceChart } from "@/components/price-chart";
import { ScoreBar } from "@/components/score-bar";
import { StatusPill } from "@/components/status-pill";
import { TokenMark } from "@/components/token-mark";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WatchButton } from "@/components/watch-button";
import {
  formatAge,
  formatHours,
  formatInt,
  formatMultiple,
  formatPct,
  formatPrice,
  formatUsd,
  timeAgo,
} from "@/lib/format";
import { getGemDetail } from "@/lib/scanner/actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gem/$symbol")({
  component: GemPage,
});

function GemPage() {
  const { symbol } = Route.useParams();
  const query = useQuery({
    queryKey: ["gem", symbol],
    queryFn: () => getGemDetail({ data: { symbol } }),
    refetchInterval: 8_000,
  });

  const gem = query.data?.gem ?? null;
  const candles = query.data?.candles ?? [];
  const minute = query.data?.minuteCandles ?? [];
  const alerts = query.data?.alerts ?? [];

  const binanceHref = gem?.venues.includes("perp")
    ? `https://www.binance.com/en/futures/${gem.pair}`
    : `https://www.binance.com/en/trade/${gem?.pair ?? ""}`;

  return (
    <AppShell live={Boolean(gem)}>
      <Link
        to="/"
        className="mb-6 inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        Radar
      </Link>

      {query.isLoading ? (
        <DetailSkeleton />
      ) : !gem ? (
        <div className="rounded-xl bg-surface px-5 py-12 text-center shadow-[var(--shadow-border)]">
          <p className="text-sm text-muted">No live tape for {symbol.toUpperCase()}.</p>
        </div>
      ) : (
        <article>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <TokenMark symbol={gem.symbol} iconUrl={gem.iconUrl} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl tracking-tight">{gem.symbol}</h1>
                  <StatusPill status={gem.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {gem.name}
                  {gem.venues.includes("perp") ? " · USDT-M" : ""}
                  {gem.venues.includes("alpha") ? " · Alpha" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WatchButton symbol={gem.symbol} />
              <Button variant="secondary" asChild>
                <a href={binanceHref} target="_blank" rel="noreferrer">
                  {gem.venues.includes("perp") ? "Futures" : "Binance"}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            </div>
          </header>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <Stat label="Price" value={`$${formatPrice(gem.price)}`} />
            <Stat
              label="24h"
              value={formatPct(gem.change24h)}
              tone={gem.change24h >= 0 ? "up" : "down"}
            />
            <Stat
              label="Live burst"
              value={gem.volumeBurstUsd >= 1000 ? formatUsd(gem.volumeBurstUsd) : "Quiet"}
              tone={gem.burstRvol >= 4 ? "up" : undefined}
            />
            <Stat label="Market cap" value={formatUsd(gem.marketCap)} />
          </div>

          <MoonPath price={gem.price} firstPrice={gem.firstPrice} />

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
              <p className="mb-3 text-xs uppercase tracking-wider text-subtle">
                24h tape
              </p>
              <PriceChart candles={candles} />
            </div>
            <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
              <p className="mb-3 text-xs uppercase tracking-wider text-subtle">
                Last 60 minutes
              </p>
              <PriceChart candles={minute} />
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
              <p className="text-xs uppercase tracking-wider text-subtle">Scores</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Early-edge conviction</span>
                  <ScoreBar value={gem.conviction} tone="up" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Gem score</span>
                  <ScoreBar value={gem.score} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Crime-pump risk</span>
                  <ScoreBar value={gem.crimeRisk} tone="warn" />
                </div>
              </div>
              <ul className="mt-5 space-y-2">
                {gem.reasons.map((r) => (
                  <li key={r} className="text-sm text-muted">
                    {r}
                  </li>
                ))}
              </ul>
              {gem.riskFlags.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {gem.riskFlags.map((r) => (
                    <li key={r} className="text-sm text-heat">
                      {r}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
              <p className="text-xs uppercase tracking-wider text-subtle">USDT-M depth</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Row label="Open interest" value={formatUsd(gem.oiUsd ?? 0)} />
                <Row
                  label="OI 5m"
                  value={
                    gem.oiChange5m != null ? formatPct(gem.oiChange5m) : "—"
                  }
                />
                <Row
                  label="Taker buy"
                  value={
                    gem.takerBuyRatio != null
                      ? `${Math.round(gem.takerBuyRatio * 100)}%`
                      : "—"
                  }
                />
                <Row
                  label="Funding"
                  value={
                    gem.fundingRate != null
                      ? `${(gem.fundingRate * 100).toFixed(4)}%`
                      : "—"
                  }
                />
                <Row label="Perp vol 24h" value={formatUsd(gem.perpVolume24h ?? 0)} />
                <Row
                  label="1m volume vs median"
                  value={gem.volSpike1m != null ? `${gem.volSpike1m.toFixed(1)}x` : "—"}
                />
                <Row
                  label="Spread"
                  value={gem.spreadBps != null ? `${gem.spreadBps.toFixed(1)} bps` : "—"}
                />
                <Row
                  label="Mark vs index"
                  value={
                    gem.markBasisBps != null ? `${gem.markBasisBps.toFixed(1)} bps` : "—"
                  }
                />
                <Row label="Whale prints" value={formatInt(gem.whalePrints)} />
                <Row
                  label="Perp age"
                  value={formatHours(gem.perpListedAgeHours)}
                />
                <Row
                  label="Burst pace"
                  value={gem.burstRvol ? `${gem.burstRvol.toFixed(1)}x` : "—"}
                />
                <Row label="New trades" value={formatInt(gem.tradeBurst)} />
              </dl>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
            <p className="text-xs uppercase tracking-wider text-subtle">Progress</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
              <Row label="First seen" value={timeAgo(gem.firstSeenAt)} />
              <Row
                label="Caught at"
                value={gem.firstPrice ? `$${formatPrice(gem.firstPrice)}` : "This sweep"}
              />
              <Row
                label="Since catch"
                value={
                  gem.firstPrice ? formatMultiple(gem.price / gem.firstPrice) : "—"
                }
              />
              <Row
                label="Peak since catch"
                value={
                  gem.highSinceDetect ? `$${formatPrice(gem.highSinceDetect)}` : "—"
                }
              />
              <Row label="Alpha age" value={formatAge(gem.listingAgeDays)} />
              <Row label="Holders" value={formatInt(gem.holders)} />
              <Row
                label="Float"
                value={gem.floatRatio ? `${Math.round(gem.floatRatio * 100)}%` : "—"}
              />
              <Row
                label="Turnover"
                value={gem.turnover ? `${gem.turnover.toFixed(2)}x` : "—"}
              />
            </dl>
          </div>

          {alerts.length > 0 ? (
            <div className="mt-6">
              <p className="mb-3 text-xs uppercase tracking-wider text-subtle">
                Alerts on this name
              </p>
              <AlertTape alerts={alerts} />
            </div>
          ) : null}
        </article>
      )}
    </AppShell>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-lg tabular-nums tracking-tight",
          tone === "up" && "text-up",
          tone === "down" && "text-down",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-subtle">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm tabular-nums">{value}</dd>
    </div>
  );
}

function MoonPath({
  price,
  firstPrice,
}: {
  price: number;
  firstPrice: number | null;
}) {
  const targets = [0.01, 0.1, 1, 10];
  const start = firstPrice && firstPrice > 0 ? firstPrice : price;
  const logP = Math.log10(Math.max(price, 0.0001));
  const min = Math.log10(Math.min(start, 0.01));
  const max = Math.log10(10);
  const pct = Math.max(2, Math.min(98, ((logP - min) / (max - min)) * 100));

  return (
    <div className="mt-6 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs uppercase tracking-wider text-subtle">Moon path</p>
        <p className="font-mono text-xs tabular-nums text-muted">
          {formatMultiple(1 / price)} to $1 · {formatMultiple(10 / price)} to $10
        </p>
      </div>
      <div className="relative mt-6 h-2 rounded-full bg-elevated">
        <div
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between font-mono text-xs text-subtle">
        {targets.map((t) => (
          <span key={t}>${t}</span>
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-48" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-56 rounded-xl" />
    </div>
  );
}
