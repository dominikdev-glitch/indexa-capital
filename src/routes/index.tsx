import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Change } from "@/components/change";
import { PerformanceChart, rangeMove, type Range } from "@/components/performance-chart";
import {
  dayPnl,
  instrument,
  lineValue,
  marketValue,
  sortedPositions,
  unrealized,
  useBook,
  type Fill,
} from "@/lib/book";
import { formatDay, pct, shares, shownMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Dashboard });

const SWATCH = ["#d7ddd8", "#8eae98", "#a3a099", "#c48982", "#f2f1ec", "#6f6d66", "#3c423e", "#8d8680"];

function Dashboard() {
  const cash = useBook((state) => state.cash);
  const positions = useBook((state) => state.positions);
  const fills = useBook((state) => state.fills);
  const hidden = useBook((state) => state.hidden);
  const openTicket = useBook((state) => state.openTicket);
  const [range, setRange] = useState<Range>("1M");
  const invested = marketValue(positions);
  const total = invested + cash;
  const today = dayPnl(positions);
  const gain = unrealized(positions);
  const move = rangeMove(range, total);
  const rows = sortedPositions(positions).slice(0, 6);
  const slices = [
    ...positions.map((position) => ({ label: position.symbol, value: lineValue(position) })),
    { label: "Cash", value: cash },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <section>
        <p className="text-sm text-muted">Portfolio value</p>
        <h1 className="mt-2 font-display text-5xl leading-none tracking-tight tabular-nums">{shownMoney(total, hidden)}</h1>
        <p className="mt-3 text-sm">
          <Change value={move.delta} percent={move.percent} hidden={hidden} />
          <span className="text-subtle"> · {range}</span>
        </p>
      </section>

      <PerformanceChart value={total} range={range} onRange={setRange} />

      <div className="grid grid-cols-2 gap-3">
        <section className="panel p-4">
          <p className="text-sm text-muted">Today</p>
          <p className="mt-2 text-lg">
            <Change value={today} percent={today / (total - today)} hidden={hidden} />
          </p>
        </section>
        <section className="panel p-4">
          <p className="text-sm text-muted">Unrealized</p>
          <p className="mt-2 text-lg">
            <Change value={gain} hidden={hidden} />
          </p>
        </section>
      </div>

      <section className="panel p-5 lg:hidden">
        <p className="text-sm text-muted">Cash</p>
        <p className="mt-2 text-lg tabular-nums">{shownMoney(cash, hidden)}</p>
      </section>

      <section className="panel p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">Positions</h2>
          <Link to="/portfolio" className="text-sm text-muted hover:text-fg">
            Full book
          </Link>
        </div>
        <ul className="mt-2 divide-y divide-border">
          {rows.map((position) => {
            const mark = instrument(position.symbol);
            const move = (mark.price - mark.prev) / mark.prev;
            return (
              <li key={position.symbol}>
                <button
                  type="button"
                  onClick={() => openTicket(position.symbol)}
                  className="flex w-full items-baseline justify-between gap-3 py-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="block text-sm">{position.symbol}</span>
                    <span className="block truncate text-xs text-subtle">{mark.name}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm tabular-nums">{shownMoney(lineValue(position), hidden)}</span>
                    <span className={cn("block text-xs tabular-nums", move > 0 ? "text-up" : move < 0 ? "text-down" : "text-subtle")}>
                      {hidden ? "" : pct(move)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-2xl tracking-tight">Allocation</h2>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-surface-2">
          {slices.map((slice, index) => (
            <div
              key={slice.label}
              style={{ width: `${(slice.value / total) * 100}%`, background: SWATCH[index % SWATCH.length] }}
              title={slice.label}
            />
          ))}
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
          {slices.slice(0, 6).map((slice, index) => (
            <li key={slice.label} className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ background: SWATCH[index % SWATCH.length] }} />
              {slice.label} {hidden ? "" : `${Math.round((slice.value / total) * 100)}%`}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">Activity</h2>
          <Link to="/activity" className="text-sm text-muted hover:text-fg">
            Ledger
          </Link>
        </div>
        <ul className="mt-2 divide-y divide-border">
          {fills.slice(0, 4).map((fill) => (
            <FillRow key={fill.id} fill={fill} hidden={hidden} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function fillLabel(fill: Fill) {
  if (fill.kind === "buy") return `Bought ${shares(fill.shares ?? 0)} ${fill.symbol}`;
  if (fill.kind === "sell") return `Sold ${shares(fill.shares ?? 0)} ${fill.symbol}`;
  if (fill.kind === "deposit") return "Deposited cash";
  return "Withdrew cash";
}

export function FillRow({ fill, hidden }: { fill: Fill; hidden: boolean }) {
  const outbound = fill.kind === "buy" || fill.kind === "withdraw";
  const detail = fill.price ? `${formatDay(fill.at)} · ${shownMoney(fill.price, false)}` : formatDay(fill.at);
  return (
    <li className="flex items-baseline justify-between gap-3 py-3 text-sm">
      <span className="min-w-0">
        <span className="block">{fillLabel(fill)}</span>
        <span className="block text-xs text-subtle">{detail}</span>
      </span>
      <span className={cn("shrink-0 tabular-nums", outbound ? "text-down" : "text-up")}>
        {outbound ? "−" : "+"}
        {shownMoney(fill.amount, hidden)}
      </span>
    </li>
  );
}
