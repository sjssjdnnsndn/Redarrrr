import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/method")({
  component: MethodPage,
});

const BLOCKS = [
  {
    title: "What Scout watches",
    body: "Every eight seconds Scout pulls Binance Alpha, spot 24h tickers, and the full USDT-M perpetual board: premium index, book tickers, contract listing dates, then a deep pass on the hottest names — open interest, 5-minute OI history, taker buy/sell, 1-minute klines, and the last 80 aggregate trades.",
  },
  {
    title: "Sudden volume, as it opens",
    body: "Each sweep stores quote volume and trade count. The next sweep subtracts. That delta is new transacted notional — not a 24h average. If the pace is many times the coin’s own baseline, Scout prints a volume-burst alert. Outsized average tickets and ≥ $80k prints become whale alerts. A 5-minute open-interest jump is treated as new positions opening, not recycled volume.",
  },
  {
    title: "Early-edge conviction",
    body: "The board is no longer sorted by who already ran. Conviction rewards volume that is igniting now, price still mid-range, taker buys, rising OI, fresh Alpha or new perp listings, and funding that is not yet crowded. Names already +55–100% on the day are marked late. Wash-like turnover with no price change is sent to crime tape, not the early list.",
  },
  {
    title: "Why this is stricter",
    body: "Cheap sticker price is a weak signal. Scout prefers small cap with real bid, quiet 24h change plus a live burst, and futures confirmation. That is the shape of names caught before the crowd — and the filter that keeps success rate from being diluted by coins that already mooned.",
  },
  {
    title: "Progress, not a prediction",
    body: "When a name clears the bar it is saved. Later sweeps compare live price to the first print. The tape is shared. Your watchlist stays on this device. Scout cannot see wallets or insider supply. It can only read the public Binance tape, faster and deeper than a 24h leaderboard.",
  },
];

function MethodPage() {
  return (
    <AppShell>
      <h1 className="font-display text-3xl tracking-tight">Method</h1>
      <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
        Scout is a live radar, not a crystal ball. It is built to surface the
        setup early — and to show the risk that usually travels with it.
      </p>
      <div className="mt-10 space-y-8">
        {BLOCKS.map((b) => (
          <section key={b.title} className="max-w-2xl">
            <h2 className="text-lg tracking-tight">{b.title}</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">
              {b.body}
            </p>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
