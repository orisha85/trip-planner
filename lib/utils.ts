import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TRIP_TITLE = process.env.TRIP_TITLE ?? "Trip";
export const TRIP_START = process.env.TRIP_START ?? "2026-07-31";
export const TRIP_END = process.env.TRIP_END ?? "2026-08-24";
export const HOME_CURRENCY = (process.env.HOME_CURRENCY ?? "CAD").toUpperCase();

export function formatMoney(
  amount: number | string,
  currency: string,
  opts: Intl.NumberFormatOptions = {},
) {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
    ...opts,
  }).format(n);
}
