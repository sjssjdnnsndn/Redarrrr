import { create } from "zustand";
import { persist } from "zustand/middleware";

type WatchState = {
  symbols: string[];
  toggle: (symbol: string) => void;
  has: (symbol: string) => boolean;
};

export const useWatchlist = create<WatchState>()(
  persist(
    (set, get) => ({
      symbols: [],
      toggle: (symbol) => {
        const next = symbol.toUpperCase();
        const cur = get().symbols;
        set({
          symbols: cur.includes(next) ? cur.filter((s) => s !== next) : [next, ...cur],
        });
      },
      has: (symbol) => get().symbols.includes(symbol.toUpperCase()),
    }),
    { name: "scout-watchlist" },
  ),
);
