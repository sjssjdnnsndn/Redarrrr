import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/lib/watchlist";
import { cn } from "@/lib/utils";

export function WatchButton({
  symbol,
  className,
}: {
  symbol: string;
  className?: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const has = useWatchlist((s) => s.has(symbol));
  const toggle = useWatchlist((s) => s.toggle);
  const on = ready && has;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={on ? `Remove ${symbol} from watchlist` : `Watch ${symbol}`}
      className={cn("size-11 shrink-0", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(symbol);
        toast(on ? `${symbol} off watchlist` : `${symbol} on watchlist`);
      }}
    >
      <Bookmark
        className={cn("size-4", on && "fill-accent text-accent")}
        strokeWidth={1.75}
      />
    </Button>
  );
}
