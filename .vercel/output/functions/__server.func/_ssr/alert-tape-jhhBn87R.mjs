import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Radio, d as Activity, l as ArrowUpRight, n as Waves, s as Flame, t as Zap } from "../_libs/lucide-react.mjs";
import { n as cn } from "./app-shell-BBeVlXsZ.mjs";
import { c as formatUsd, l as timeAgo, o as formatPct, s as formatPrice } from "./skeleton-CY1_hF7Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/alert-tape-jhhBn87R.js
var import_jsx_runtime = require_jsx_runtime();
var KIND = {
	volume_burst: {
		label: "Volume",
		icon: Waves
	},
	whale_print: {
		label: "Whale",
		icon: Zap
	},
	oi_surge: {
		label: "Open interest",
		icon: Activity
	},
	taker_sweep: {
		label: "Taker buy",
		icon: Flame
	},
	new_perp: {
		label: "New perp",
		icon: Radio
	},
	short_cover: {
		label: "Shorts",
		icon: ArrowUpRight
	}
};
function AlertTape({ alerts, compact }) {
	if (alerts.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl bg-surface px-4 py-12 text-center shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Waiting on the next burst. The tape prints when USDT-M volume, open interest, or large tickets jump vs the live baseline."
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
		children: alerts.map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "border-t border-border first:border-t-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertRow, {
				alert,
				compact
			})
		}, alert.id))
	});
}
function AlertRow({ alert, compact }) {
	const meta = KIND[alert.kind] ?? KIND.volume_burst;
	const Icon = meta.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/gem/$symbol",
		params: { symbol: alert.symbol },
		className: "flex min-h-16 items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-elevated",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md", alert.severity === "critical" ? "bg-down/15 text-down" : alert.severity === "high" ? "bg-heat/15 text-heat" : "bg-elevated text-muted"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: "size-4",
				strokeWidth: 1.75
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium tracking-tight",
						children: [alert.symbol, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-xs font-normal text-muted",
							children: meta.label
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tabular-nums text-subtle",
						children: timeAgo(alert.ts)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-sm text-muted",
					children: alert.detail
				}),
				!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 font-mono text-xs tabular-nums text-subtle",
					children: [
						"$",
						formatPrice(alert.price),
						" · ",
						formatPct(alert.change24h),
						alert.quoteUsd > 0 ? ` · ${formatUsd(alert.quoteUsd)}` : ""
					]
				}) : null
			]
		})]
	});
}
//#endregion
export { AlertTape as t };
