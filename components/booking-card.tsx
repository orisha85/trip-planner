import Link from "next/link";
import type { Booking } from "@/db/schema";
import { formatInTz } from "@/lib/dates";
import { formatMoney, HOME_CURRENCY } from "@/lib/utils";

const TYPE_ICON: Record<string, string> = {
  flight: "✈",
  train: "🚆",
  hotel: "🏨",
  activity: "🎟",
};

export function BookingCard({ booking }: { booking: Booking }) {
  const time = formatInTz(booking.startAt, booking.timezone, "HH:mm");
  const zone = formatInTz(booking.startAt, booking.timezone, "zzz");

  const priceLine =
    booking.priceAmount && booking.priceCurrency
      ? booking.priceCurrency === HOME_CURRENCY
        ? formatMoney(booking.priceAmount, booking.priceCurrency)
        : `${formatMoney(booking.priceAmount, booking.priceCurrency)}${
            booking.priceCad
              ? ` · ${formatMoney(booking.priceCad, HOME_CURRENCY)}`
              : ""
          }`
      : null;

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="block rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] p-3 transition hover:border-[color:var(--color-accent)]"
    >
      <div className="flex items-start gap-3">
        <div className="w-14 shrink-0 text-center">
          <div className="text-lg">{TYPE_ICON[booking.type]}</div>
          <div className="font-mono text-sm">{time}</div>
          <div className="text-[10px] text-[color:var(--color-muted)]">{zone}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{booking.title}</div>
          {(booking.fromLocation || booking.toLocation) && (
            <div className="truncate text-sm text-[color:var(--color-muted)]">
              {booking.fromLocation}
              {booking.toLocation ? ` → ${booking.toLocation}` : ""}
            </div>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[color:var(--color-muted)]">
            {priceLine && <span>{priceLine}</span>}
            {booking.confirmationCode && (
              <span className="font-mono">{booking.confirmationCode}</span>
            )}
            {booking.receiptUrl && <span>📎 receipt</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
