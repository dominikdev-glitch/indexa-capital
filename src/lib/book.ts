import { create } from "zustand";
import { z } from "zod";

export type Instrument = {
  symbol: string;
  name: string;
  price: number;
  prev: number;
};

function listed(symbol: string, name: string, price: number, day: number): Instrument {
  return { symbol, name, price, prev: price / (1 + day) };
}

export const INSTRUMENTS: Instrument[] = [
  listed("VOO", "Vanguard S&P 500", 612.4, 0.0042),
  listed("TLT", "20+ Year Treasury", 91.25, -0.0055),
  listed("AAPL", "Apple", 228.15, 0.0118),
  listed("MSFT", "Microsoft", 428.9, -0.0034),
  listed("NVDA", "NVIDIA", 138.42, 0.0211),
  listed("BRK.B", "Berkshire Hathaway", 478.3, 0.0016),
  listed("MTN", "MTN Group", 4.85, 0.0062),
  listed("DANGCEM", "Dangote Cement", 92.45, -0.0031),
  listed("GTCO", "Guaranty Trust", 0.95, 0.0071),
  listed("BTC", "Bitcoin", 79560, -0.0124),
  listed("ETH", "Ether", 3105, 0.01393714071836562),
];

const BY_SYMBOL = new Map(INSTRUMENTS.map((item) => [item.symbol, item]));

export function instrument(symbol: string) {
  const found = BY_SYMBOL.get(symbol);
  if (!found) throw new Error(`Unknown symbol ${symbol}`);
  return found;
}

export type Side = "buy" | "sell";
export type FillKind = Side | "deposit" | "withdraw";

export type Position = {
  symbol: string;
  shares: number;
  avg: number;
};

export type Fill = {
  id: string;
  at: string;
  kind: FillKind;
  symbol?: string;
  shares?: number;
  price?: number;
  amount: number;
};

const STORAGE_KEY = "halden-book-v1";

const PositionSchema = z.object({
  symbol: z.string(),
  shares: z.number().positive().finite(),
  avg: z.number().positive().finite(),
});

const FillSchema = z.object({
  id: z.string(),
  at: z.string(),
  kind: z.enum(["buy", "sell", "deposit", "withdraw"]),
  symbol: z.string().optional(),
  shares: z.number().positive().finite().optional(),
  price: z.number().positive().finite().optional(),
  amount: z.number().positive().finite(),
});

const StoredSchema = z.object({
  cash: z.number().nonnegative().finite(),
  positions: z.array(PositionSchema),
  fills: z.array(FillSchema),
  hidden: z.boolean().optional(),
});

function roundCash(value: number) {
  return Math.round(value * 100) / 100;
}

function roundQty(value: number) {
  return Math.round(value * 10000) / 10000;
}

export function lineValue(position: Position) {
  return position.shares * instrument(position.symbol).price;
}

export function dayChange(position: Position) {
  const mark = instrument(position.symbol);
  return (mark.price - mark.prev) * position.shares;
}

export function marketValue(positions: Position[]) {
  return positions.reduce((sum, position) => sum + lineValue(position), 0);
}

export function dayPnl(positions: Position[]) {
  return positions.reduce((sum, position) => sum + dayChange(position), 0);
}

export function unrealized(positions: Position[]) {
  return positions.reduce((sum, position) => sum + (instrument(position.symbol).price - position.avg) * position.shares, 0);
}

export function heldShares(positions: Position[], symbol: string) {
  return positions.find((position) => position.symbol === symbol)?.shares ?? 0;
}

function seedPositions(): Position[] {
  return [
    { symbol: "VOO", shares: 48, avg: 548.2 },
    { symbol: "AAPL", shares: 90, avg: 196.4 },
    { symbol: "BTC", shares: 0.22, avg: 68400 },
    { symbol: "MSFT", shares: 40, avg: 402.15 },
    { symbol: "BRK.B", shares: 16, avg: 451.2 },
    { symbol: "NVDA", shares: 55, avg: 112.8 },
    { symbol: "TLT", shares: 48, avg: 98.4 },
    { symbol: "ETH", shares: 1.6, avg: 2740 },
    { symbol: "MTN", shares: 220, avg: 4.62 },
    { symbol: "DANGCEM", shares: 4, avg: 101.1 },
    { symbol: "GTCO", shares: 100, avg: 1.18 },
  ];
}

function seedFills(): Fill[] {
  return [
    { id: "f1", at: "2026-11-07T15:42:00.000Z", kind: "buy", symbol: "VOO", shares: 4, price: 612.4, amount: 2449.6 },
    { id: "f2", at: "2026-11-04T15:18:00.000Z", kind: "sell", symbol: "AAPL", shares: 12, price: 224.9, amount: 2698.8 },
    { id: "f3", at: "2026-11-01T11:05:00.000Z", kind: "deposit", amount: 5000 },
    { id: "f4", at: "2026-10-28T16:40:00.000Z", kind: "buy", symbol: "BTC", shares: 0.05, price: 78200, amount: 3910 },
    { id: "f5", at: "2026-10-21T09:12:00.000Z", kind: "withdraw", amount: 1200 },
    { id: "f6", at: "2026-10-14T14:22:00.000Z", kind: "buy", symbol: "NVDA", shares: 20, price: 131.1, amount: 2622 },
    { id: "f7", at: "2026-10-02T10:15:00.000Z", kind: "buy", symbol: "MTN", shares: 80, price: 4.62, amount: 369.6 },
  ];
}

function fresh() {
  return { cash: 24068.02, positions: seedPositions(), fills: seedFills(), hidden: false };
}

export type TicketKind = "buy" | "sell" | "deposit";

type Ticket = { kind: TicketKind; symbol: string; withdraw: boolean };

type Result = { ok: true } | { ok: false; error: string };

type State = {
  cash: number;
  positions: Position[];
  fills: Fill[];
  hidden: boolean;
  ready: boolean;
  ticket: Ticket | null;
  toggleHidden: () => void;
  openTicket: (symbol?: string, kind?: TicketKind) => void;
  closeTicket: () => void;
  setTicketKind: (kind: TicketKind) => void;
  setTicketSymbol: (symbol: string) => void;
  setWithdraw: (withdraw: boolean) => void;
  trade: (quantity: number) => Result;
  moveCash: (amount: number, withdraw: boolean) => Result;
  restore: () => void;
};

function persist(state: State) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      cash: state.cash,
      positions: state.positions,
      fills: state.fills,
      hidden: state.hidden,
    }),
  );
}

function commit(set: (partial: Partial<State>) => void, get: () => State, partial: Partial<State>) {
  set(partial);
  if (get().ready) persist(get());
}

export const useBook = create<State>((set, get) => ({
  ...fresh(),
  ready: false,
  ticket: null,
  toggleHidden: () => {
    set({ hidden: !get().hidden });
    if (get().ready) persist(get());
  },
  openTicket: (symbol = "VOO", kind = "buy") => set({ ticket: { kind, symbol, withdraw: false } }),
  closeTicket: () => set({ ticket: null }),
  setTicketKind: (kind) => {
    const ticket = get().ticket;
    if (ticket) set({ ticket: { ...ticket, kind } });
  },
  setTicketSymbol: (symbol) => {
    const ticket = get().ticket;
    if (ticket) set({ ticket: { ...ticket, symbol } });
  },
  setWithdraw: (withdraw) => {
    const ticket = get().ticket;
    if (ticket) set({ ticket: { ...ticket, withdraw } });
  },
  trade: (quantity) => {
    const ticket = get().ticket;
    if (!ticket || ticket.kind === "deposit") return { ok: false, error: "Choose buy or sell." };
    const qty = roundQty(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return { ok: false, error: "Enter a quantity above zero." };
    const mark = instrument(ticket.symbol);
    const cost = roundCash(qty * mark.price);
    if (cost <= 0) return { ok: false, error: "That quantity is too small." };
    if (cost > 1_000_000) return { ok: false, error: "Sample trades stop at $1,000,000." };
    const state = get();
    const current = state.positions.find((position) => position.symbol === ticket.symbol);
    const held = current?.shares ?? 0;
    if (ticket.kind === "buy" && cost > state.cash + 0.001) {
      return { ok: false, error: "Not enough sample cash." };
    }
    if (ticket.kind === "sell" && qty > held + 0.00001) {
      return { ok: false, error: "That is more than you hold." };
    }
    let positions = state.positions;
    if (ticket.kind === "buy") {
      const nextShares = roundQty(held + qty);
      const avg = current ? (current.shares * current.avg + cost) / nextShares : mark.price;
      const next = { symbol: ticket.symbol, shares: nextShares, avg };
      positions = current
        ? state.positions.map((position) => (position.symbol === ticket.symbol ? next : position))
        : [...state.positions, next];
    } else {
      const nextShares = roundQty(held - qty);
      positions =
        nextShares <= 0
          ? state.positions.filter((position) => position.symbol !== ticket.symbol)
          : state.positions.map((position) =>
              position.symbol === ticket.symbol ? { ...position, shares: nextShares } : position,
            );
    }
    const fill: Fill = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      kind: ticket.kind,
      symbol: ticket.symbol,
      shares: qty,
      price: mark.price,
      amount: cost,
    };
    commit(set, get, {
      cash: roundCash(ticket.kind === "buy" ? state.cash - cost : state.cash + cost),
      positions,
      fills: [fill, ...state.fills],
      ticket: null,
    });
    return { ok: true };
  },
  moveCash: (amount, withdraw) => {
    const value = roundCash(amount);
    if (!Number.isFinite(value) || value <= 0) return { ok: false, error: "Enter an amount above zero." };
    if (value > 1_000_000) return { ok: false, error: "Sample moves stop at $1,000,000." };
    const state = get();
    if (withdraw && value > state.cash + 0.001) return { ok: false, error: "Not enough sample cash." };
    const fill: Fill = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      kind: withdraw ? "withdraw" : "deposit",
      amount: value,
    };
    commit(set, get, {
      cash: roundCash(withdraw ? state.cash - value : state.cash + value),
      fills: [fill, ...state.fills],
      ticket: null,
    });
    return { ok: true };
  },
  restore: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ ...fresh(), ready: true, ticket: null });
  },
}));

export function loadStoredBook() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      useBook.setState({ ready: true });
      return;
    }
    const parsed = StoredSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      useBook.setState({ ready: true });
      return;
    }
    const known = new Set(INSTRUMENTS.map((item) => item.symbol));
    const positions = parsed.data.positions.filter((position) => known.has(position.symbol));
    useBook.setState({
      cash: parsed.data.cash,
      positions,
      fills: parsed.data.fills,
      hidden: parsed.data.hidden ?? false,
      ready: true,
    });
  } catch {
    useBook.setState({ ready: true });
  }
}

export function sortedPositions(positions: Position[]) {
  return [...positions].sort((a, b) => lineValue(b) - lineValue(a));
}
