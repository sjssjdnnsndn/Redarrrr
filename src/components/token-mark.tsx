import { useState } from "react";
import { cn } from "@/lib/utils";

export function TokenMark({
  symbol,
  iconUrl,
  size = "md",
}: {
  symbol: string;
  iconUrl: string | null;
  size?: "sm" | "md";
}) {
  const [failed, setFailed] = useState(false);
  const dim = size === "sm" ? "size-8" : "size-10";
  const showImg = iconUrl && !failed;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-elevated",
        dim,
      )}
    >
      {showImg ? (
        <img
          src={iconUrl}
          alt=""
          className="size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-mono text-[0.65rem] text-muted">
          {symbol.slice(0, 3)}
        </span>
      )}
    </span>
  );
}
