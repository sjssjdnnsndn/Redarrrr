import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn } from "./app-shell-BBeVlXsZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/skeleton-CY1_hF7Y.js
var import_jsx_runtime = require_jsx_runtime();
function formatPrice(value) {
	if (!Number.isFinite(value) || value <= 0) return "—";
	if (value >= 1e3) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
	if (value >= 1) return value.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 4
	});
	if (value >= .1) return value.toFixed(4);
	if (value >= .01) return value.toFixed(5);
	if (value >= 1e-4) return value.toFixed(6);
	return value.toPrecision(3);
}
function formatUsd(value) {
	if (!Number.isFinite(value) || value <= 0) return "—";
	const abs = Math.abs(value);
	if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
	if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
	if (abs >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
	return `$${value.toFixed(0)}`;
}
function formatPct(value) {
	if (!Number.isFinite(value)) return "—";
	return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}
function formatMultiple(value) {
	if (!Number.isFinite(value) || value <= 0) return "—";
	if (value >= 100) return `${value.toFixed(0)}x`;
	if (value >= 10) return `${value.toFixed(1)}x`;
	return `${value.toFixed(2)}x`;
}
function formatAge(days) {
	if (days == null || !Number.isFinite(days)) return "—";
	if (days < 1) return `${Math.max(1, Math.round(days * 24))}h`;
	if (days < 14) return `${days.toFixed(0)}d`;
	if (days < 60) return `${Math.round(days / 7)}w`;
	return `${(days / 30).toFixed(0)}mo`;
}
function formatInt(value) {
	if (!Number.isFinite(value)) return "—";
	return Math.round(value).toLocaleString("en-US");
}
function formatHours(hours) {
	if (hours == null || !Number.isFinite(hours)) return "—";
	if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
	if (hours < 48) return `${hours.toFixed(0)}h`;
	return `${(hours / 24).toFixed(0)}d`;
}
function timeAgo(iso) {
	if (!iso) return "—";
	const then = new Date(iso).getTime();
	if (!Number.isFinite(then)) return "—";
	const sec = Math.max(0, Math.round((Date.now() - then) / 1e3));
	if (sec < 45) return "just now";
	if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
	if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
	return `${Math.round(sec / 86400)}d ago`;
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-elevated", className),
		...props
	});
}
//#endregion
export { formatMultiple as a, formatUsd as c, formatInt as i, timeAgo as l, formatAge as n, formatPct as o, formatHours as r, formatPrice as s, Skeleton as t };
