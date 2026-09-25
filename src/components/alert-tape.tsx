import { Link } from "@tanstack/react-router";
import { Activity, ArrowUpRight, Flame, Radio, Waves, Zap } from "lucide-react";
import { formatPct, formatPrice, formatUsd, timeAgo } from "@/lib/format";
import type { AlertKind, VolumeAlert } from "@/lib/scanner/types";
import { cn } from "@/lib/utils";

const KIND: Record<
  AlertKind,
  { label: string; icon: typeof Zap }
> = {
  volume_burst: { label: "Volume", icon: Waves },
  whale_print: { label: "Whale", icon: Zap },
  oi_surge: { label: "Open interest", icon: Activity },
  taker_sweep: { label: "Taker buy", icon: Flame },
  new_perp: { label: "New perp", icon: Radio },
  short_cover: { label: "Shorts", icon: ArrowUpRight },
};

export function AlertTape({
  alerts,
  compact,
}: {
  alerts: VolumeAlert[];
  compact?: boolean;
}) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl bg-surface px-4 py-12 text-center shadow-[var(--shadow-border)]">
        <p className="text-sm text-muted">
          Waiting on the next burst. The tape prints when USDT-M volume, open
          interest, or large tickets jump vs the live baseline.
        </p>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      {alerts.map((alert) => (
        <li key={alert.id} className="border-t border-border first:border-t-0">
          <AlertRow alert={alert} compact={compact} />
        </li>
      ))}
    </ul>
  );
}

function AlertRow({ alert, compact }: { alert: VolumeAlert; compact?: boolean }) {
  const meta = KIND[alert.kind] ?? KIND.volume_burst;
  const Icon = meta.icon;
  return (
    <Link
      to="/gem/$symbol"
      params={{ symbol: alert.symbol }}
      className="flex min-h-16 items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-elevated"
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md",
          alert.severity === "critical"
            ? "bg-down/15 text-down"
            : alert.severity === "high"
              ? "bg-heat/15 text-heat"
              : "bg-elevated text-muted",
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="font-medium tracking-tight">
            {alert.symbol}
            <span className="ml-2 text-xs font-normal text-muted">{meta.label}</span>
          </p>
          <p className="font-mono text-xs tabular-nums text-subtle">{timeAgo(alert.ts)}</p>
        </div>
        <p className="mt-0.5 text-sm text-muted">{alert.detail}</p>
        {!compact ? (
          <p className="mt-1 font-mono text-xs tabular-nums text-subtle">
            ${formatPrice(alert.price)} · {formatPct(alert.change24h)}
            {alert.quoteUsd > 0 ? ` · ${formatUsd(alert.quoteUsd)}` : ""}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
