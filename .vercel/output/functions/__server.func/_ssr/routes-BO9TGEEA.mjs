import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as Search } from "../_libs/lucide-react.mjs";
import { n as cn, t as AppShell } from "./app-shell-BBeVlXsZ.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Route$4, s as scanMarket } from "./router-C0xayQo6.mjs";
import { l as timeAgo, t as Skeleton } from "./skeleton-CY1_hF7Y.mjs";
import { t as AlertTape } from "./alert-tape-jhhBn87R.mjs";
import { t as GemList } from "./gem-list-mSnHt8eJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BO9TGEEA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)]", "placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
}
function Home() {
	const initial = Route$4.useLoaderData();
	const scan = useQuery({
		queryKey: ["scan"],
		queryFn: () => scanMarket(),
		initialData: initial,
		refetchInterval: 8e3,
		refetchIntervalInBackground: true
	});
	const [view, setView] = (0, import_react.useState)("early");
	const [q, setQ] = (0, import_react.useState)("");
	const seen = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const data = scan.data;
	(0, import_react.useEffect)(() => {
		if (!data?.alerts) return;
		const cutoff = Date.now() - 25e3;
		for (const alert of data.alerts) {
			if (seen.current.has(alert.id)) continue;
			if (new Date(alert.ts).getTime() < cutoff) {
				seen.current.add(alert.id);
				continue;
			}
			if (alert.severity === "info") {
				seen.current.add(alert.id);
				continue;
			}
			seen.current.add(alert.id);
			toast(alert.title, { description: alert.detail });
		}
	}, [data]);
	const list = (0, import_react.useMemo)(() => {
		let rows = data?.early ?? [];
		if (view === "gems") rows = data?.gems ?? [];
		if (view === "bursts") rows = data?.bursts ?? [];
		if (view === "crime") rows = data?.crime ?? [];
		if (view === "caught") rows = data?.caughtEarly ?? [];
		const query = q.trim().toLowerCase();
		if (query) rows = rows.filter((g) => g.symbol.toLowerCase().includes(query) || g.name.toLowerCase().includes(query));
		return rows;
	}, [
		data,
		view,
		q
	]);
	const liveAlerts = (data?.alerts ?? []).slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		live: Boolean(data) && !data.error,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-8 sm:mb-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs uppercase tracking-[0.18em] text-muted",
						children: "Binance gem radar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-display text-3xl leading-tight tracking-tight sm:text-5xl",
						children: [
							"Catch the move",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", { className: "hidden sm:block" }),
							" while it is still quiet."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted sm:text-base",
						children: "Scout now scores live USDT-M tape — open interest, taker buys, 1-minute volume spikes, and sudden tickets — not just 24h prints. Early-edge names are still mid-range. The tape fires the moment volume or positions open hard."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsBar, {
				loading: scan.isLoading && !data,
				universe: data?.stats.universe,
				early: data?.stats.early,
				bursts: data?.stats.bursts,
				perps: data?.stats.perpPairs,
				scannedAt: data?.scannedAt,
				stale: data?.stale,
				error: data?.error ?? (scan.isError ? "Radar feed paused" : null)
			}),
			liveAlerts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-wider text-subtle",
						children: "Live tape"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-subtle",
						children: [data?.stats.bursts ?? 0, " events in 5m"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTape, {
					alerts: liveAlerts,
					compact: true
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1 overflow-x-auto pb-1",
					children: [
						["early", "Early edge"],
						["bursts", "Live bursts"],
						["gems", "All setups"],
						["crime", "Crime tape"],
						["caught", "Caught early"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setView(id),
						className: cn("h-11 shrink-0 rounded-full px-4 text-sm transition-colors duration-150", view === id ? "bg-accent text-accent-fg" : "text-muted hover:bg-elevated hover:text-fg"),
						children: label
					}, id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "relative block w-full sm:max-w-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search symbol",
						className: "pl-9",
						"aria-label": "Search symbol"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: scan.isLoading && !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemList, { gems: list })
			})
		]
	});
}
function StatsBar({ loading, universe, early, bursts, perps, scannedAt, stale, error }) {
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
		children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-xl" }, i))
	});
	const items = [
		{
			label: "Universe",
			value: universe?.toLocaleString() ?? "—"
		},
		{
			label: "Early edge",
			value: String(early ?? 0)
		},
		{
			label: "Tape 5m",
			value: String(bursts ?? 0)
		},
		{
			label: "USDT-M perps",
			value: perps?.toLocaleString() ?? "—"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: item.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-xl tabular-nums tracking-tight",
				children: item.value
			})]
		}, item.label))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-xs text-subtle",
		children: error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-heat",
			children: [error, ". Showing last known tape."]
		}) : stale ? "Feed delayed — last snapshot held." : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			"Last sweep ",
			timeAgo(scannedAt ?? null),
			" · Alpha + spot + USDT-M depth"
		] })
	})] });
}
function ListSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-px overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
		children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 px-4 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-10 rounded-md" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-40" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-16" })
			]
		}, i))
	});
}
//#endregion
export { Home as component };
