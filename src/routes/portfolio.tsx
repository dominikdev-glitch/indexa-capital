import { createFileRoute } from "@tanstack/react-router";
import { instrument, lineValue, marketValue, sortedPositions, useBook } from "@/lib/book";
import { pct, shares, shownMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portfolio")({ component: PortfolioPage });

function PortfolioPage() {
  const cash = useBook((state) => state.cash);
  const positions = useBook((state) => state.positions);
  const hidden = useBook((state) => state.hidden);
  const openTicket = useBook((state) => state.openTicket);
  const total = marketValue(positions) + cash;
  const rows = sortedPositions(positions);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Portfolio</h1>
        <p className="mt-2 text-sm text-muted">
          Book value <span className="tabular-nums text-fg">{shownMoney(total, hidden)}</span>
        </p>
      </div>
      <ul className="panel divide-y divide-border px-4">
        {rows.map((position) => {
          const mark = instrument(position.symbol);
          const move = (mark.price - mark.prev) / mark.prev;
          return (
            <li key={position.symbol}>
              <button
                type="button"
                onClick={() => openTicket(position.symbol)}
                className="flex w-full items-baseline justify-between gap-4 py-4 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-sm">
                    {position.symbol} <span className="text-muted">{mark.name}</span>
                  </span>
                  <span className="mt-1 block text-xs text-subtle">
                    {shares(position.shares)} · {shownMoney(mark.price, hidden)}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm tabular-nums">{shownMoney(lineValue(position), hidden)}</span>
                  <span className={cn("mt-1 block text-xs tabular-nums", move > 0 ? "text-up" : move < 0 ? "text-down" : "text-subtle")}>
                    {hidden ? "" : pct(move)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
