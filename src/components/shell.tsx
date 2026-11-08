import { Link, useRouterState } from "@tanstack/react-router";
import { Eye, EyeOff, LayoutDashboard, LineChart, ScrollText, Wallet } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { OrderTicket } from "@/components/order-ticket";
import { Button } from "@/components/ui/button";
import { loadStoredBook, useBook } from "@/lib/book";
import { shownMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/portfolio", label: "Portfolio", icon: Wallet, exact: false },
  { to: "/markets", label: "Markets", icon: LineChart, exact: false },
  { to: "/activity", label: "Activity", icon: ScrollText, exact: false },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const hidden = useBook((state) => state.hidden);
  const cash = useBook((state) => state.cash);
  const toggleHidden = useBook((state) => state.toggleHidden);
  const openTicket = useBook((state) => state.openTicket);
  const restore = useBook((state) => state.restore);

  useEffect(() => {
    loadStoredBook();
  }, []);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r border-border bg-bg px-4 py-6 lg:flex">
        <Link to="/" className="px-2">
          <span className="font-display text-3xl leading-none tracking-tight">Halden</span>
          <span className="mt-1 block text-xs text-muted">Private desk</span>
        </Link>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Primary">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm text-muted",
                  active && "bg-surface text-fg line-ring",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-2">
          <p className="text-xs text-subtle">Cash</p>
          <p className="mt-1 text-sm tabular-nums">{shownMoney(cash, hidden)}</p>
          <button
            type="button"
            onClick={restore}
            className="mt-4 text-left text-xs text-subtle underline-offset-2 hover:text-muted hover:underline"
          >
            Restore sample book
          </button>
          <p className="mt-4 text-xs leading-relaxed text-subtle">Marks are sample data, not live quotes.</p>
        </div>
      </aside>

      <div className="lg:pl-56">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-bg/95 px-4 backdrop-blur-sm md:px-8">
          <div className="min-w-0">
            <Link to="/" className="font-display text-2xl leading-none tracking-tight lg:hidden">
              Halden
            </Link>
            <p className="hidden text-sm text-muted lg:block">Sample book · USD</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-pressed={hidden}
              aria-label={hidden ? "Show balances" : "Hide balances"}
              onClick={toggleHidden}
            >
              {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
            <Button onClick={() => openTicket()}>Trade</Button>
          </div>
        </header>
        <main className="px-4 pt-6 pb-28 md:px-8 lg:pb-12">{children}</main>
      </div>

      <nav className="dock fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur-sm lg:hidden" aria-label="Primary">
        <ul className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-xs text-subtle",
                    active && "text-fg",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <OrderTicket />
    </div>
  );
}
