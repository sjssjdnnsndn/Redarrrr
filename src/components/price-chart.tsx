import { useId } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/format";
import type { Candle } from "@/lib/scanner/types";

export function PriceChart({ candles }: { candles: Candle[] }) {
  const fillId = useId().replace(/:/g, "");
  if (candles.length < 2) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg bg-elevated text-sm text-muted">
        Chart feed not available for this pair yet.
      </div>
    );
  }

  const data = candles.map((c) => ({
    time: c.time,
    price: c.close,
    label: new Date(c.time).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
  const up = data[data.length - 1].price >= data[0].price;
  const stroke = up ? "var(--color-up)" : "var(--color-down)";
  const fill = up ? "var(--color-up)" : "var(--color-down)";

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fill} stopOpacity={0.18} />
              <stop offset="100%" stopColor={fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
            tickFormatter={(v: number) => formatPrice(Number(v))}
            width={64}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-elevated)",
              border: "none",
              boxShadow: "var(--shadow-border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--color-fg)",
            }}
            formatter={(value) => [`$${formatPrice(Number(value ?? 0))}`, "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={stroke}
            strokeWidth={1.5}
            fill={`url(#${fillId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
