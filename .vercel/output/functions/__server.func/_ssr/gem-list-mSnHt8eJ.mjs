import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn } from "./app-shell-BBeVlXsZ.mjs";
import { c as formatUsd, n as formatAge, o as formatPct, s as formatPrice } from "./skeleton-CY1_hF7Y.mjs";
import { a as WatchButton, i as TokenMark, n as ScoreBar, r as StatusPill } from "./watch-button-VJKvO2Bz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gem-list-mSnHt8eJ.js
var import_jsx_runtime = require_jsx_runtime();
function GemList({ gems }) {
	if (gems.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl bg-surface px-4 py-12 text-center shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "No names match this filter right now."
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden grid-cols-[1.5fr_0.85fr_0.7fr_0.75fr_0.7fr_0.75fr_0.75fr_0.7fr_44px] gap-2 px-4 py-3 text-[0.6875rem] uppercase tracking-wider text-subtle lg:grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Token" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-right",
					children: "Price"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-right",
					children: "24h"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-right",
					children: "Live burst"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-right",
					children: "Cap"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edge" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Risk" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: gems.map((gem) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "border-t border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemRow, { gem })
		}, gem.id)) })]
	});
}
function GemRow({ gem }) {
	const up = gem.change24h >= 0;
	const multiple = gem.firstPrice && gem.firstPrice > 0 ? gem.price / gem.firstPrice : null;
	const isNew = gem.firstSeenAt && Date.now() - new Date(gem.firstSeenAt).getTime() < 9e5;
	const bursting = gem.burstRvol >= 4 && gem.volumeBurstUsd >= 2e4;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group relative flex items-stretch",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/gem/$symbol",
			params: { symbol: gem.symbol },
			className: "grid min-h-16 flex-1 grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 lg:grid-cols-[1.5fr_0.85fr_0.7fr_0.75fr_0.7fr_0.75fr_0.75fr_0.7fr] lg:gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenMark, {
						symbol: gem.symbol,
						iconUrl: gem.iconUrl
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium tracking-tight",
									children: gem.symbol
								}),
								isNew ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[0.65rem] uppercase tracking-wider text-accent",
									children: "New"
								}) : null,
								bursting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[0.65rem] uppercase tracking-wider text-heat",
									children: "Burst"
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-muted",
							children: [
								gem.name,
								gem.venues.includes("perp") ? " · Perp" : "",
								gem.venues.includes("alpha") ? " · Alpha" : "",
								gem.listingAgeDays != null ? ` · ${formatAge(gem.listingAgeDays)}` : ""
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right lg:contents",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "lg:text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-sm tabular-nums",
								children: ["$", formatPrice(gem.price)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted lg:hidden",
								children: [formatUsd(gem.volume24h), " vol"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("hidden font-mono text-sm tabular-nums lg:block lg:text-right", up ? "text-up" : "text-down"),
							children: formatPct(gem.change24h)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "hidden font-mono text-sm tabular-nums text-fg lg:block lg:text-right",
							children: gem.volumeBurstUsd >= 1e4 ? formatUsd(gem.volumeBurstUsd) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "hidden font-mono text-sm tabular-nums text-muted lg:block lg:text-right",
							children: formatUsd(gem.marketCap)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden lg:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreBar, {
								value: gem.conviction,
								tone: "up"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden lg:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreBar, {
								value: gem.crimeRisk,
								tone: "warn"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden lg:flex lg:justify-start",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: gem.status })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-2 flex items-center justify-between gap-3 lg:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: cn("font-mono text-xs tabular-nums", up ? "text-up" : "text-down"),
						children: [
							formatPct(gem.change24h),
							bursting ? ` · ${formatUsd(gem.volumeBurstUsd)} burst` : "",
							multiple && multiple >= 1.04 ? ` · ${multiple.toFixed(2)}x since catch` : ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: gem.status })]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center pr-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchButton, { symbol: gem.symbol })
		})]
	});
}
//#endregion
export { GemList as t };
