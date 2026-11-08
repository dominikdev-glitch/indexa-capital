import { useId } from "react";
import { moneyCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

export const RANGES = ["1W", "1M", "3M", "1Y", "All"] as const;
export type Range = (typeof RANGES)[number];

const SPEC: Record<Range, { days: number; delta: number; points: number }> = {
  "1W": { days: 7, delta: 2140.22, points: 8 },
  "1M": { days: 29, delta: 6368.55, points: 30 },
  "3M": { days: 92, delta: 8780.51, points: 40 },
  "1Y": { days: 365, delta: 15240.18, points: 52 },
  All: { days: 900, delta: 22110.4, points: 60 },
};

const END = Date.parse("2026-11-07T15:00:00.000Z");

export function rangeMove(range: Range, end: number) {
  const delta = SPEC[range].delta;
  const start = end + delta;
  return { delta: -delta, percent: -delta / start };
}

function series(range: Range, end: number) {
  const { delta, points } = SPEC[range];
  const start = end + delta;
  return Array.from({ length: points }, (_, index) => {
    if (index === points - 1) return end;
    const t = index / (points - 1);
    const base = start + (end - start) * t;
    const wave = Math.sin(t * Math.PI * 3) * delta * 0.07 * (1 - t);
    return base + wave;
  });
}

function ticks(range: Range) {
  const { days } = SPEC[range];
  const start = END - days * 86400000;
  return [0, 0.25, 0.5, 0.75, 1].map((t) =>
    new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(
      new Date(start + t * (END - start)),
    ),
  );
}

export function PerformanceChart({
  value,
  range,
  onRange,
}: {
  value: number;
  range: Range;
  onRange: (range: Range) => void;
}) {
  const labelId = useId();
  const points = series(range, value);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const width = 640;
  const height = 220;
  const padX = 8;
  const padY = 16;
  const coords = points.map((point, index) => {
    const x = padX + (index / (points.length - 1)) * (width - padX * 2);
    const y = padY + (1 - (point - min) / span) * (height - padY * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)} ${height} L${coords[0][0].toFixed(1)} ${height} Z`;
  const levels = [max, min + span * 0.5, min];
  const dates = ticks(range);

  return (
    <section className="panel p-4 md:p-5" aria-labelledby={labelId}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={labelId} className="sr-only">
          Sample path
        </h2>
        <div className="flex gap-1" role="radiogroup" aria-label="Range">
          {RANGES.map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={item === range}
              onClick={() => onRange(item)}
              className={cn(
                "h-9 rounded-md px-3 text-sm text-muted",
                item === range && "bg-surface-2 text-fg line-ring",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="text-xs text-subtle">Sample path</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-52 w-full" role="img" aria-label={`Sample path, ${range}`}>
        <path d={area} fill="currentColor" opacity="0.08" />
        <path d={line} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <div className="mt-1 flex justify-between text-xs text-subtle tabular-nums">
        {dates.map((date, index) => (
          <span key={`${date}-${index}`}>{date}</span>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-subtle tabular-nums">
        {levels.map((level) => (
          <span key={level}>{moneyCompact(level)}</span>
        ))}
      </div>
    </section>
  );
}
