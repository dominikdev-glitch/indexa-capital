import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as earningsTotal, i as shownMoney, n as formatDay, o as useBook, s as cn } from "./router-BAwppPAb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CHyOYR1-.js
var import_jsx_runtime = require_jsx_runtime();
var KIND = {
	deposit: "Deposit",
	withdraw: "Withdrawal",
	credit: "Credit"
};
function Dashboard() {
	const balance = useBook((state) => state.balance);
	const txs = useBook((state) => state.txs);
	const hidden = useBook((state) => state.hidden);
	const openSheet = useBook((state) => state.openSheet);
	const earned = earningsTotal(txs);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Sample balance"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-5xl leading-none tracking-tight tabular-nums",
						children: shownMoney(balance, hidden)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-subtle",
						children: "Private demo. No funds move."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => openSheet("deposit"),
							className: "press h-11 rounded-md bg-accent text-sm font-medium text-accent-fg",
							children: "Deposit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => openSheet("withdraw"),
							className: "press h-11 rounded-md bg-surface-2 text-sm font-medium text-fg line-ring",
							children: "Withdraw"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Recorded credits"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-4xl leading-none tracking-tight tabular-nums text-up",
						children: shownMoney(earned, hidden)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-subtle",
						children: "Past sample credits only. Not a forecast."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl tracking-tight",
						children: "Transactions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/activity",
						className: "text-sm text-muted hover:text-fg",
						children: "All"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 divide-y divide-border",
					children: txs.slice(0, 4).map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-baseline justify-between gap-3 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block",
								children: KIND[tx.kind]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block truncate text-xs text-subtle",
								children: [
									formatDay(tx.at),
									" · ",
									tx.note
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("shrink-0 tabular-nums", tx.kind === "withdraw" ? "text-fg" : "text-up"),
							children: [tx.kind === "withdraw" ? "−" : "+", shownMoney(tx.amount, hidden)]
						})]
					}, tx.id))
				})]
			})
		]
	});
}
//#endregion
export { Dashboard as component };
