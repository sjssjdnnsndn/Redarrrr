import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { l as ArrowUpRight, u as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as cn, t as AppShell } from "./app-shell-BBeVlXsZ.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as getGemDetail, n as Route } from "./router-C0xayQo6.mjs";
import { a as formatMultiple, c as formatUsd, i as formatInt, l as timeAgo, n as formatAge, o as formatPct, r as formatHours, s as formatPrice, t as Skeleton } from "./skeleton-CY1_hF7Y.mjs";
import { t as AlertTape } from "./alert-tape-jhhBn87R.mjs";
import { a as WatchButton, i as TokenMark, n as ScoreBar, r as StatusPill, t as Button } from "./watch-button-VJKvO2Bz.mjs";
import { a as ResponsiveContainer, i as Area, n as YAxis, o as Tooltip, r as XAxis, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gem._symbol-Cwsr_kIK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PriceChart({ candles }) {
	const fillId = (0, import_react.useId)().replace(/:/g, "");
	if (candles.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-56 items-center justify-center rounded-lg bg-elevated text-sm text-muted",
		children: "Chart feed not available for this pair yet."
	});
	const data = candles.map((c) => ({
		time: c.time,
		price: c.close,
		label: new Date(c.time).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		})
	}));
	const up = data[data.length - 1].price >= data[0].price;
	const stroke = up ? "var(--color-up)" : "var(--color-down)";
	const fill = up ? "var(--color-up)" : "var(--color-down)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-56 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data,
				margin: {
					top: 8,
					right: 8,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: fillId,
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: fill,
							stopOpacity: .18
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: fill,
							stopOpacity: 0
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "label",
						hide: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						domain: ["auto", "auto"],
						tick: {
							fill: "var(--color-subtle)",
							fontSize: 11
						},
						tickFormatter: (v) => formatPrice(Number(v)),
						width: 64,
						axisLine: false,
						tickLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						contentStyle: {
							background: "var(--color-elevated)",
							border: "none",
							boxShadow: "var(--shadow-border)",
							borderRadius: 8,
							fontSize: 12,
							color: "var(--color-fg)"
						},
						formatter: (value) => [`$${formatPrice(Number(value ?? 0))}`, "Price"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey: "price",
						stroke,
						strokeWidth: 1.5,
						fill: `url(#${fillId})`,
						isAnimationActive: false
					})
				]
			})
		})
	});
}
function GemPage() {
	const { symbol } = Route.useParams();
	const query = useQuery({
		queryKey: ["gem", symbol],
		queryFn: () => getGemDetail({ data: { symbol } }),
		refetchInterval: 8e3
	});
	const gem = query.data?.gem ?? null;
	const candles = query.data?.candles ?? [];
	const minute = query.data?.minuteCandles ?? [];
	const alerts = query.data?.alerts ?? [];
	const binanceHref = gem?.venues.includes("perp") ? `https://www.binance.com/en/futures/${gem.pair}` : `https://www.binance.com/en/trade/${gem?.pair ?? ""}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		live: Boolean(gem),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/",
			className: "mb-6 inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Radar"]
		}), query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSkeleton, {}) : !gem ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-xl bg-surface px-5 py-12 text-center shadow-[var(--shadow-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"No live tape for ",
					symbol.toUpperCase(),
					"."
				]
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenMark, {
						symbol: gem.symbol,
						iconUrl: gem.iconUrl
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl tracking-tight",
							children: gem.symbol
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: gem.status })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							gem.name,
							gem.venues.includes("perp") ? " · USDT-M" : "",
							gem.venues.includes("alpha") ? " · Alpha" : ""
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchButton, { symbol: gem.symbol }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: binanceHref,
							target: "_blank",
							rel: "noreferrer",
							children: [gem.venues.includes("perp") ? "Futures" : "Binance", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Price",
						value: `$${formatPrice(gem.price)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "24h",
						value: formatPct(gem.change24h),
						tone: gem.change24h >= 0 ? "up" : "down"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Live burst",
						value: gem.volumeBurstUsd >= 1e3 ? formatUsd(gem.volumeBurstUsd) : "Quiet",
						tone: gem.burstRvol >= 4 ? "up" : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Market cap",
						value: formatUsd(gem.marketCap)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoonPath, {
				price: gem.price,
				firstPrice: gem.firstPrice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs uppercase tracking-wider text-subtle",
						children: "24h tape"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChart, { candles })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs uppercase tracking-wider text-subtle",
						children: "Last 60 minutes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChart, { candles: minute })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wider text-subtle",
							children: "Scores"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "Early-edge conviction"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreBar, {
										value: gem.conviction,
										tone: "up"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "Gem score"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreBar, { value: gem.score })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "Crime-pump risk"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreBar, {
										value: gem.crimeRisk,
										tone: "warn"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-5 space-y-2",
							children: gem.reasons.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "text-sm text-muted",
								children: r
							}, r))
						}),
						gem.riskFlags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-2",
							children: gem.riskFlags.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "text-sm text-heat",
								children: r
							}, r))
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-wider text-subtle",
						children: "USDT-M depth"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Open interest",
								value: formatUsd(gem.oiUsd ?? 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "OI 5m",
								value: gem.oiChange5m != null ? formatPct(gem.oiChange5m) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Taker buy",
								value: gem.takerBuyRatio != null ? `${Math.round(gem.takerBuyRatio * 100)}%` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Funding",
								value: gem.fundingRate != null ? `${(gem.fundingRate * 100).toFixed(4)}%` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Perp vol 24h",
								value: formatUsd(gem.perpVolume24h ?? 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "1m volume vs median",
								value: gem.volSpike1m != null ? `${gem.volSpike1m.toFixed(1)}x` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Spread",
								value: gem.spreadBps != null ? `${gem.spreadBps.toFixed(1)} bps` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Mark vs index",
								value: gem.markBasisBps != null ? `${gem.markBasisBps.toFixed(1)} bps` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Whale prints",
								value: formatInt(gem.whalePrints)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Perp age",
								value: formatHours(gem.perpListedAgeHours)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Burst pace",
								value: gem.burstRvol ? `${gem.burstRvol.toFixed(1)}x` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "New trades",
								value: formatInt(gem.tradeBurst)
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wider text-subtle",
					children: "Progress"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "First seen",
							value: timeAgo(gem.firstSeenAt)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Caught at",
							value: gem.firstPrice ? `$${formatPrice(gem.firstPrice)}` : "This sweep"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Since catch",
							value: gem.firstPrice ? formatMultiple(gem.price / gem.firstPrice) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Peak since catch",
							value: gem.highSinceDetect ? `$${formatPrice(gem.highSinceDetect)}` : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Alpha age",
							value: formatAge(gem.listingAgeDays)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Holders",
							value: formatInt(gem.holders)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Float",
							value: gem.floatRatio ? `${Math.round(gem.floatRatio * 100)}%` : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Turnover",
							value: gem.turnover ? `${gem.turnover.toFixed(2)}x` : "—"
						})
					]
				})]
			}),
			alerts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs uppercase tracking-wider text-subtle",
					children: "Alerts on this name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTape, { alerts })]
			}) : null
		] })]
	});
}
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-1 font-mono text-lg tabular-nums tracking-tight", tone === "up" && "text-up", tone === "down" && "text-down"),
			children: value
		})]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs text-subtle",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-0.5 font-mono text-sm tabular-nums",
		children: value
	})] });
}
function MoonPath({ price, firstPrice }) {
	const targets = [
		.01,
		.1,
		1,
		10
	];
	const start = firstPrice && firstPrice > 0 ? firstPrice : price;
	const logP = Math.log10(Math.max(price, 1e-4));
	const min = Math.log10(Math.min(start, .01));
	const max = Math.log10(10);
	const pct = Math.max(2, Math.min(98, (logP - min) / (max - min) * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wider text-subtle",
					children: "Moon path"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-xs tabular-nums text-muted",
					children: [
						formatMultiple(1 / price),
						" to $1 · ",
						formatMultiple(10 / price),
						" to $10"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative mt-6 h-2 rounded-full bg-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent",
					style: { left: `${pct}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex justify-between font-mono text-xs text-subtle",
				children: targets.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", t] }, t))
			})
		]
	});
}
function DetailSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-48" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-xl" }, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56 rounded-xl" })
		]
	});
}
//#endregion
export { GemPage as component };
