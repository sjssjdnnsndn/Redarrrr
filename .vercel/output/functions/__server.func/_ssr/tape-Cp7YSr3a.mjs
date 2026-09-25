import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn, t as AppShell } from "./app-shell-BBeVlXsZ.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as Route$2, s as scanMarket } from "./router-C0xayQo6.mjs";
import { t as Skeleton } from "./skeleton-CY1_hF7Y.mjs";
import { t as AlertTape } from "./alert-tape-jhhBn87R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tape-Cp7YSr3a.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FILTERS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "volume_burst",
		label: "Volume"
	},
	{
		id: "oi_surge",
		label: "Open interest"
	},
	{
		id: "whale_print",
		label: "Whales"
	},
	{
		id: "taker_sweep",
		label: "Taker buys"
	},
	{
		id: "new_perp",
		label: "New perps"
	}
];
function TapePage() {
	const initial = Route$2.useLoaderData();
	const scan = useQuery({
		queryKey: ["scan"],
		queryFn: () => scanMarket(),
		initialData: initial,
		refetchInterval: 8e3,
		refetchIntervalInBackground: true
	});
	const [filter, setFilter] = (0, import_react.useState)("all");
	const alerts = (0, import_react.useMemo)(() => {
		const rows = scan.data?.alerts ?? [];
		if (filter === "all") return rows;
		return rows.filter((a) => a.kind === filter);
	}, [scan.data, filter]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		live: Boolean(scan.data) && !scan.data.error,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl tracking-tight",
				children: "Live tape"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted sm:text-base",
				children: "Every sweep compares USDT-M 24h volume and trade count to the previous print, then deep-reads open interest, taker buy/sell, and recent aggregate trades on the hottest names. This is the burst log."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 flex gap-1 overflow-x-auto pb-1",
				children: FILTERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(item.id),
					className: cn("h-11 shrink-0 rounded-full px-4 text-sm transition-colors duration-150", filter === item.id ? "bg-accent text-accent-fg" : "text-muted hover:bg-elevated hover:text-fg"),
					children: item.label
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: scan.isLoading && !scan.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-xl" })
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTape, { alerts })
			})
		]
	});
}
//#endregion
export { TapePage as component };
