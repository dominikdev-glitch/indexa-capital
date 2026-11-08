const MASK = "••••••";

export function mask() {
  return MASK;
}

export function money(value: number, sign = false) {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  if (value < 0) return `−${formatted}`;
  if (sign && value > 0) return `+${formatted}`;
  return formatted;
}

export function moneyCompact(value: number) {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: abs >= 100000 ? 0 : 1,
  }).format(abs);
  return value < 0 ? `−${formatted}` : formatted;
}

export function shownMoney(value: number, hidden: boolean, sign = false) {
  return hidden ? MASK : money(value, sign);
}

export function pct(value: number, sign = true) {
  const body = `${Math.abs(value * 100).toFixed(2)}%`;
  if (!sign) return body;
  if (value < 0) return `−${body}`;
  if (value > 0) return `+${body}`;
  return body;
}

export function shares(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

export function formatDay(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function formatStamp(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "UTC",
  }).format(new Date(iso));
}
