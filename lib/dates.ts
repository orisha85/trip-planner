import { formatInTimeZone } from "date-fns-tz";

export function formatInTz(
  d: Date | string | null | undefined,
  tz: string,
  pattern = "EEE, MMM d · HH:mm zzz",
): string {
  if (!d) return "";
  return formatInTimeZone(new Date(d), tz, pattern);
}

export function dayKeyInTz(d: Date | string, tz: string): string {
  return formatInTimeZone(new Date(d), tz, "yyyy-MM-dd");
}

export function dayLabel(key: string): string {
  const [y, m, day] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day, 12));
  return dt.toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
