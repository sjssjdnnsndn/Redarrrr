import { Badge } from "@/components/ui/badge";
import type { GemStatus } from "@/lib/scanner/types";

const MAP: Record<GemStatus, { label: string; variant: "heat" | "up" | "down" | "warn" | "default" }> = {
  heating: { label: "Heating", variant: "heat" },
  launching: { label: "Launching", variant: "up" },
  mooning: { label: "Mooning", variant: "up" },
  cooling: { label: "Cooling", variant: "default" },
  dumped: { label: "Dumped", variant: "down" },
};

export function StatusPill({ status }: { status: GemStatus }) {
  const m = MAP[status];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
