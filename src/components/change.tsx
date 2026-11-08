import { pct, shownMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Change({
  value,
  percent,
  hidden = false,
}: {
  value: number;
  percent?: number;
  hidden?: boolean;
}) {
  const tone = value > 0 ? "text-up" : value < 0 ? "text-down" : "text-muted";
  return (
    <span className={cn("tabular-nums", tone)}>
      {shownMoney(value, hidden, true)}
      {percent !== undefined ? <span> {hidden ? "" : pct(percent)}</span> : null}
    </span>
  );
}
