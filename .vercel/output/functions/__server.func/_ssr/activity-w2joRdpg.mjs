import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as shownMoney, o as useBook, r as formatStamp, s as cn } from "./router-BAwppPAb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activity-w2joRdpg.js
var import_jsx_runtime = require_jsx_runtime();
var KIND = {
	deposit: "Deposit",
	withdraw: "Withdrawal",
	credit: "Credit"
};
function ActivityPage() {
	const txs = useBook((state) => state.txs);
	const hidden = useBook((state) => state.hidden);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl tracking-tight",
			children: "Activity"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Sample ledger. Nothing here is a payment."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "panel divide-y divide-border px-4",
			children: txs.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-start justify-between gap-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: KIND[tx.kind]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-subtle",
						children: [
							formatStamp(tx.at),
							" UTC · ",
							tx.note
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("shrink-0 text-sm tabular-nums", tx.kind === "withdraw" ? "text-fg" : "text-up"),
					children: [tx.kind === "withdraw" ? "−" : "+", shownMoney(tx.amount, hidden)]
				})]
			}, tx.id))
		})]
	});
}
//#endregion
export { ActivityPage as component };
