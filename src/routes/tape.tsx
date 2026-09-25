import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTape } from "@/components/alert-tape";
import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { scanMarket } from "@/lib/scanner/actions";
import type { AlertKind } from "@/lib/scanner/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tape")({
  loader: () => scanMarket(),
  component: TapePage,
});

const FILTERS: Array<{ id: "all" | AlertKind; label: string }> = [
  { id: "all", label: "All" },
  { id: "volume_burst", label: "Volume" },
  { id: "oi_surge", label: "Open interest" },
  { id: "whale_print", label: "Whales" },
  { id: "taker_sweep", label: "Taker buys" },
  { id: "new_perp", label: "New perps" },
];

function TapePage() {
  const initial = Route.useLoaderData();
  const scan = useQuery({
    queryKey: ["scan"],
    queryFn: () => scanMarket(),
    initialData: initial,
    refetchInterval: 8_000,
    refetchIntervalInBackground: true,
  });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const alerts = useMemo(() => {
    const rows = scan.data?.alerts ?? [];
    if (filter === "all") return rows;
    return rows.filter((a) => a.kind === filter);
  }, [scan.data, filter]);

  return (
    <AppShell live={Boolean(scan.data) && !scan.data.error}>
      <h1 className="font-display text-3xl tracking-tight">Live tape</h1>
      <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
        Every sweep compares USDT-M 24h volume and trade count to the previous
        print, then deep-reads open interest, taker buy/sell, and recent
        aggregate trades on the hottest names. This is the burst log.
      </p>

      <div className="mt-8 flex gap-1 overflow-x-auto pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "h-11 shrink-0 rounded-full px-4 text-sm transition-colors duration-150",
              filter === item.id
                ? "bg-accent text-accent-fg"
                : "text-muted hover:bg-elevated hover:text-fg",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {scan.isLoading && !scan.data ? (
          <div className="space-y-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : (
          <AlertTape alerts={alerts} />
        )}
      </div>
    </AppShell>
  );
}
