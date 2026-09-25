import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as AppShell } from "./app-shell-BBeVlXsZ.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { o as getWatchGems, s as scanMarket } from "./router-C0xayQo6.mjs";
import { t as Skeleton } from "./skeleton-CY1_hF7Y.mjs";
import { o as useWatchlist } from "./watch-button-VJKvO2Bz.mjs";
import { t as GemList } from "./gem-list-mSnHt8eJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watchlist-XybhS_y7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WatchlistPage() {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	const symbols = useWatchlist((s) => s.symbols);
	const scan = useQuery({
		queryKey: ["scan"],
		queryFn: () => scanMarket(),
		refetchInterval: 8e3
	});
	const extra = useQuery({
		queryKey: ["watch", symbols],
		enabled: ready && symbols.length > 0,
		queryFn: () => getWatchGems({ data: { symbols } }),
		refetchInterval: 8e3
	});
	const bySym = new Map([
		...scan.data?.gems ?? [],
		...scan.data?.early ?? [],
		...scan.data?.bursts ?? [],
		...scan.data?.crime ?? [],
		...extra.data ?? []
	].map((g) => [g.symbol, g]));
	const gems = symbols.map((s) => bySym.get(s)).filter((g) => g != null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		live: Boolean(scan.data),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl tracking-tight",
				children: "Watchlist"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-lg text-sm text-muted",
				children: "Personal list, stored on this device. Scout keeps scoring them on every sweep."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: !ready || symbols.length > 0 && extra.isLoading && gems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-xl" })]
				}) : symbols.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl bg-surface px-5 py-12 text-center shadow-[var(--shadow-border)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Bookmark a name on the radar to follow its path from first print."
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemList, { gems })
			})
		]
	});
}
//#endregion
export { WatchlistPage as component };
