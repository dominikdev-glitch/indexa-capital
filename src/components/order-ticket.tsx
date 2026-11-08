import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { INSTRUMENTS, heldShares, instrument, useBook, type TicketKind } from "@/lib/book";
import { money, shares } from "@/lib/format";
import { cn } from "@/lib/utils";

const TABS: { id: TicketKind; label: string }[] = [
  { id: "buy", label: "Buy" },
  { id: "sell", label: "Sell" },
  { id: "deposit", label: "Deposit" },
];

function maxBuy(cash: number, price: number) {
  let qty = Math.floor((cash / price) * 10000) / 10000;
  while (qty > 0 && Math.round(qty * price * 100) / 100 > cash + 0.001) qty = Math.round((qty - 0.0001) * 10000) / 10000;
  return Math.max(0, qty);
}

export function OrderTicket() {
  const ticket = useBook((state) => state.ticket);
  const closeTicket = useBook((state) => state.closeTicket);
  const setTicketKind = useBook((state) => state.setTicketKind);
  const setTicketSymbol = useBook((state) => state.setTicketSymbol);
  const setWithdraw = useBook((state) => state.setWithdraw);
  const trade = useBook((state) => state.trade);
  const moveCash = useBook((state) => state.moveCash);
  const cash = useBook((state) => state.cash);
  const positions = useBook((state) => state.positions);
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticket) return;
    setQuantity(ticket.kind === "deposit" ? "1000" : "1");
    setError(null);
  }, [ticket?.kind, ticket?.symbol, ticket?.withdraw]);

  if (!ticket) return null;

  const mark = instrument(ticket.symbol);
  const held = heldShares(positions, ticket.symbol);
  const qty = Number(quantity);
  const estimated = Number.isFinite(qty) && qty > 0 ? Math.round(qty * mark.price * 100) / 100 : 0;
  const cashAfter =
    ticket.kind === "deposit"
      ? cash + (ticket.withdraw ? -estimated : estimated)
      : ticket.kind === "buy"
        ? cash - estimated
        : cash + estimated;
  const unit = qty === 1 ? "share" : "shares";

  function submit() {
    const result = ticket && ticket.kind === "deposit" ? moveCash(Number(quantity), ticket.withdraw) : trade(Number(quantity));
    if (result && !result.ok) setError(result.error);
  }

  return (
    <Dialog.Root open onOpenChange={(next) => !next && closeTicket()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-bg/80" />
        <div className="pointer-events-none fixed inset-0 z-50 grid place-items-end p-4 sm:place-items-center">
          <Dialog.Content className="dialog-pop panel pointer-events-auto relative w-full max-w-md p-5">
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title className="font-display text-3xl leading-none tracking-tight">Trade</Dialog.Title>
              <Dialog.Close className="press grid size-11 place-items-center rounded-md text-muted hover:text-fg" aria-label="Close">
                <X className="size-4" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="mt-2 text-sm text-muted">
              Sample book only. Marks are not live quotes, and no money moves.
            </Dialog.Description>
            <div className="mt-4 grid grid-cols-3 gap-1" role="tablist" aria-label="Trade type">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={ticket.kind === tab.id}
                  onClick={() => setTicketKind(tab.id)}
                  className={cn(
                    "h-10 rounded-md text-sm text-muted",
                    ticket.kind === tab.id && "bg-surface-2 text-fg line-ring",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <form
              className="mt-4 flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              {ticket.kind === "deposit" ? (
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-muted">Amount</span>
                  <input
                    className="field tabular-nums"
                    inputMode="decimal"
                    value={quantity}
                    onChange={(event) => {
                      setQuantity(event.target.value);
                      setError(null);
                    }}
                  />
                </label>
              ) : (
                <>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="text-muted">
                      Instrument {money(mark.price)} · You hold {shares(held)}
                    </span>
                    <select
                      className="field"
                      value={ticket.symbol}
                      onChange={(event) => setTicketSymbol(event.target.value)}
                    >
                      {INSTRUMENTS.map((item) => (
                        <option key={item.symbol} value={item.symbol}>
                          {item.symbol} · {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="text-muted">Quantity</span>
                    <div className="flex gap-2">
                      <input
                        className="field tabular-nums"
                        inputMode="decimal"
                        value={quantity}
                        onChange={(event) => {
                          setQuantity(event.target.value);
                          setError(null);
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          const next = ticket.kind === "sell" ? held : maxBuy(cash, mark.price);
                          setQuantity(String(next));
                          setError(null);
                        }}
                      >
                        Max
                      </Button>
                    </div>
                  </label>
                </>
              )}
              <div className="text-sm text-muted">
                {ticket.kind === "deposit" ? (
                  <p>{ticket.withdraw ? "Withdraw cash" : "Deposit cash"}</p>
                ) : (
                  <>
                    <p className="text-fg">{mark.symbol}</p>
                    <p className="mt-1">
                      {ticket.kind === "buy" ? "Buy" : "Sell"} {Number.isFinite(qty) ? shares(qty) : "0"} {unit}
                    </p>
                    <p className="mt-1">{money(mark.price)} mark</p>
                  </>
                )}
                <p className="mt-2">
                  Estimated <span className="tabular-nums text-fg">{money(estimated || 0)}</span>
                </p>
                <p className="mt-1">
                  Cash after <span className="tabular-nums text-fg">{money(Number.isFinite(cashAfter) ? cashAfter : cash)}</span>
                </p>
              </div>
              {ticket.kind === "deposit" ? (
                <button
                  type="button"
                  className="text-left text-sm text-muted underline-offset-2 hover:text-fg hover:underline"
                  onClick={() => setWithdraw(!ticket.withdraw)}
                >
                  {ticket.withdraw ? "Deposit instead" : "Withdraw instead"}
                </button>
              ) : null}
              {error ? (
                <p role="alert" className="text-sm text-down">
                  {error}
                </p>
              ) : null}
              <Button type="submit">
                {ticket.kind === "deposit" ? (ticket.withdraw ? "Withdraw" : "Deposit") : ticket.kind === "buy" ? "Buy" : "Sell"}
              </Button>
            </form>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
