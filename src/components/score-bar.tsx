import { cn } from "@/lib/utils";

export function ScoreBar({
  value,
  tone = "accent",
}: {
  value: number;
  tone?: "accent" | "warn" | "up";
}) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-elevated sm:w-20">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            tone === "warn" && "bg-heat",
            tone === "up" && "bg-up",
            tone === "accent" && "bg-accent",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-6 text-right font-mono text-xs tabular-nums text-muted">
        {Math.round(value)}
      </span>
    </div>
  );
}
