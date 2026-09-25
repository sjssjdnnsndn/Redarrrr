import { Link, useRouterState } from "@tanstack/react-router";
import { Radar } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Radar" },
  { to: "/tape", label: "Tape" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/method", label: "Method" },
] as const;

export function AppShell({
  children,
  live,
}: {
  children: ReactNode;
  live?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/92 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-fg">
            <span className="flex size-8 items-center justify-center rounded-md bg-elevated shadow-[var(--shadow-border)]">
              <Radar className="size-4" strokeWidth={1.75} />
            </span>
            <span className="font-display text-lg tracking-tight">Scout</span>
          </Link>
          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-11 shrink-0 items-center px-2.5 text-sm transition-colors duration-150 sm:px-3",
                    active ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span
              className={cn(
                "size-1.5 rounded-full",
                live ? "bg-up animate-pulse" : "bg-subtle",
              )}
              aria-hidden
            />
            <span className="hidden tabular-nums sm:inline">
              {live ? "Live" : "Idle"}
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6">
        <p className="max-w-2xl text-pretty text-xs leading-relaxed text-subtle">
          Scout reads public Binance Alpha, spot, and USDT-M perpetual feeds
          every few seconds. Edge scores are setups, not promises. These tapes
          are often manipulated. Not financial advice.
        </p>
      </footer>
    </div>
  );
}
