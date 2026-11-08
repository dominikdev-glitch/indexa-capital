import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { INSTRUMENTS, useBook } from "@/lib/book";
import { pct, shownMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/markets")({ component: MarketsPage });

function MarketsPage() {
  const openTicket = useBook((state) => state.openTicket);
  const hidden = useBook((state) => state.hidden);
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const rows = INSTRUMENTS.filter(
    (item) => item.symbol.toLowerCase().includes(needle) || item.name.toLowerCase().includes(needle),
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Markets</h1>
        <p className="mt-2 text-sm text-muted">Sample marks. Not live quotes.</p>
      </div>
      <input
        className="field"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
        aria-label="Search instruments"
      />
      <ul className="panel divide-y divide-border px-4">
        {rows.map((item) => {
          const move = (item.price - item.prev) / item.prev;
          return (
            <li key={item.symbol} className="flex items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="text-sm">
                  {item.symbol} <span className="text-muted">{item.name}</span>
                </p>
                <p className={cn("mt-1 text-xs tabular-nums", move > 0 ? "text-up" : move < 0 ? "text-down" : "text-subtle")}>
                  {shownMoney(item.price, hidden)} · {hidden ? "" : pct(move)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openTicket(item.symbol, "buy")}
                className="press h-10 rounded-md bg-surface-2 px-3 text-sm line-ring"
              >
                Buy
              </button>
            </li>
          );
        })}
        {rows.length === 0 ? <li className="py-6 text-sm text-muted">No match.</li> : null}
      </ul>
    </div>
  );
}
