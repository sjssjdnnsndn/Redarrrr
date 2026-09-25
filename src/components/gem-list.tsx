import { Link } from "@tanstack/react-router";
import { formatAge, formatPct, formatPrice, formatUsd } from "@/lib/format";
import type { Gem } from "@/lib/scanner/types";
import { cn } from "@/lib/utils";
import { ScoreBar } from "./score-bar";
import { StatusPill } from "./status-pill";
import { TokenMark } from "./token-mark";
import { WatchButton } from "./watch-button";

export function GemList({ gems }: { gems: Gem[] }) {
  if (gems.length === 0) {
    return (
      <div className="rounded-xl bg-surface px-4 py-12 text-center shadow-[var(--shadow-border)]">
        <p className="text-sm text-muted">No names match this filter right now.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      <div className="hidden grid-cols-[1.5fr_0.85fr_0.7fr_0.75fr_0.7fr_0.75fr_0.75fr_0.7fr_44px] gap-2 px-4 py-3 text-[0.6875rem] uppercase tracking-wider text-subtle lg:grid">
        <span>Token</span>
        <span className="text-right">Price</span>
        <span className="text-right">24h</span>
        <span className="text-right">Live burst</span>
        <span className="text-right">Cap</span>
        <span>Edge</span>
        <span>Risk</span>
        <span>Status</span>
        <span />
      </div>
      <ul>
        {gems.map((gem) => (
          <li key={gem.id} className="border-t border-border">
            <GemRow gem={gem} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function GemRow({ gem }: { gem: Gem }) {
  const up = gem.change24h >= 0;
  const multiple =
    gem.firstPrice && gem.firstPrice > 0 ? gem.price / gem.firstPrice : null;
  const isNew =
    gem.firstSeenAt &&
    Date.now() - new Date(gem.firstSeenAt).getTime() < 15 * 60_000;
  const bursting = gem.burstRvol >= 4 && gem.volumeBurstUsd >= 20_000;

  return (
    <div className="group relative flex items-stretch">
      <Link
        to="/gem/$symbol"
        params={{ symbol: gem.symbol }}
        className="grid min-h-16 flex-1 grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 lg:grid-cols-[1.5fr_0.85fr_0.7fr_0.75fr_0.7fr_0.75fr_0.75fr_0.7fr] lg:gap-2"
      >
        <div className="flex items-center gap-3">
          <TokenMark symbol={gem.symbol} iconUrl={gem.iconUrl} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium tracking-tight">{gem.symbol}</span>
              {isNew ? (
                <span className="text-[0.65rem] uppercase tracking-wider text-accent">
                  New
                </span>
              ) : null}
              {bursting ? (
                <span className="text-[0.65rem] uppercase tracking-wider text-heat">
                  Burst
                </span>
              ) : null}
            </div>
            <p className="truncate text-xs text-muted">
              {gem.name}
              {gem.venues.includes("perp") ? " · Perp" : ""}
              {gem.venues.includes("alpha") ? " · Alpha" : ""}
              {gem.listingAgeDays != null ? ` · ${formatAge(gem.listingAgeDays)}` : ""}
            </p>
          </div>
        </div>

        <div className="text-right lg:contents">
          <div className="lg:text-right">
            <p className="font-mono text-sm tabular-nums">${formatPrice(gem.price)}</p>
            <p className="text-xs text-muted lg:hidden">
              {formatUsd(gem.volume24h)} vol
            </p>
          </div>
          <p
            className={cn(
              "hidden font-mono text-sm tabular-nums lg:block lg:text-right",
              up ? "text-up" : "text-down",
            )}
          >
            {formatPct(gem.change24h)}
          </p>
          <p className="hidden font-mono text-sm tabular-nums text-fg lg:block lg:text-right">
            {gem.volumeBurstUsd >= 10_000 ? formatUsd(gem.volumeBurstUsd) : "—"}
          </p>
          <p className="hidden font-mono text-sm tabular-nums text-muted lg:block lg:text-right">
            {formatUsd(gem.marketCap)}
          </p>
          <div className="hidden lg:block">
            <ScoreBar value={gem.conviction} tone="up" />
          </div>
          <div className="hidden lg:block">
            <ScoreBar value={gem.crimeRisk} tone="warn" />
          </div>
          <div className="hidden lg:flex lg:justify-start">
            <StatusPill status={gem.status} />
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-between gap-3 lg:hidden">
          <p className={cn("font-mono text-xs tabular-nums", up ? "text-up" : "text-down")}>
            {formatPct(gem.change24h)}
            {bursting ? ` · ${formatUsd(gem.volumeBurstUsd)} burst` : ""}
            {multiple && multiple >= 1.04 ? ` · ${multiple.toFixed(2)}x since catch` : ""}
          </p>
          <StatusPill status={gem.status} />
        </div>
      </Link>
      <div className="flex items-center pr-1">
        <WatchButton symbol={gem.symbol} />
      </div>
    </div>
  );
}
