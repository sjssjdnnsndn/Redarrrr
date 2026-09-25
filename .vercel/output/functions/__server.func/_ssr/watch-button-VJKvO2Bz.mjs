import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as Bookmark } from "../_libs/lucide-react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./app-shell-BBeVlXsZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watch-button-VJKvO2Bz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ScoreBar({ value, tone = "accent" }) {
	const width = Math.max(0, Math.min(100, value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1.5 w-16 overflow-hidden rounded-full bg-elevated sm:w-20",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("h-full rounded-full transition-[width] duration-300", tone === "warn" && "bg-heat", tone === "up" && "bg-up", tone === "accent" && "bg-accent"),
				style: { width: `${width}%` }
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "w-6 text-right font-mono text-xs tabular-nums text-muted",
			children: Math.round(value)
		})]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide", {
	variants: { variant: {
		default: "bg-elevated text-muted",
		heat: "bg-accent/12 text-accent",
		up: "bg-up/15 text-up",
		down: "bg-down/15 text-down",
		warn: "bg-heat/15 text-heat"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var MAP = {
	heating: {
		label: "Heating",
		variant: "heat"
	},
	launching: {
		label: "Launching",
		variant: "up"
	},
	mooning: {
		label: "Mooning",
		variant: "up"
	},
	cooling: {
		label: "Cooling",
		variant: "default"
	},
	dumped: {
		label: "Dumped",
		variant: "down"
	}
};
function StatusPill({ status }) {
	const m = MAP[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: m.variant,
		children: m.label
	});
}
function TokenMark({ symbol, iconUrl, size = "md" }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	const dim = size === "sm" ? "size-8" : "size-10";
	const showImg = iconUrl && !failed;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-elevated", dim),
		children: showImg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: iconUrl,
			alt: "",
			className: "size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10",
			onError: () => setFailed(true)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[0.65rem] text-muted",
			children: symbol.slice(0, 3)
		})
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,box-shadow,opacity,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-4", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-elevated text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			ghost: "text-muted hover:bg-elevated hover:text-fg",
			outline: "bg-transparent text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var useWatchlist = create()(persist((set, get) => ({
	symbols: [],
	toggle: (symbol) => {
		const next = symbol.toUpperCase();
		const cur = get().symbols;
		set({ symbols: cur.includes(next) ? cur.filter((s) => s !== next) : [next, ...cur] });
	},
	has: (symbol) => get().symbols.includes(symbol.toUpperCase())
}), { name: "scout-watchlist" }));
function WatchButton({ symbol, className }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	const has = useWatchlist((s) => s.has(symbol));
	const toggle = useWatchlist((s) => s.toggle);
	const on = ready && has;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "ghost",
		size: "icon",
		"aria-label": on ? `Remove ${symbol} from watchlist` : `Watch ${symbol}`,
		className: cn("size-11 shrink-0", className),
		onClick: (e) => {
			e.preventDefault();
			e.stopPropagation();
			toggle(symbol);
			toast(on ? `${symbol} off watchlist` : `${symbol} on watchlist`);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, {
			className: cn("size-4", on && "fill-accent text-accent"),
			strokeWidth: 1.75
		})
	});
}
//#endregion
export { WatchButton as a, TokenMark as i, ScoreBar as n, useWatchlist as o, StatusPill as r, Button as t };
