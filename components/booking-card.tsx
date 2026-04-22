import Link from "next/link";
import type { Booking } from "@/db/schema";
import { formatInTz } from "@/lib/dates";
import { formatMoney, HOME_CURRENCY } from "@/lib/utils";
import { TypeIcon, TYPE_LABEL } from "@/components/type-icon";

export function BookingCard({ booking }: { booking: Booking }) {
  const time = formatInTz(booking.startAt, booking.timezone, "HH:mm");
  const tz = formatInTz(booking.startAt, booking.timezone, "zzz");

  const route =
    booking.type === "flight" || booking.type === "train"
      ? [booking.fromLocation, booking.toLocation].filter(Boolean).join("  →  ")
      : booking.fromLocation ?? "";

  const hasPrice = booking.priceAmount && booking.priceCurrency;
  const showCad =
    hasPrice && booking.priceCad && booking.priceCurrency !== HOME_CURRENCY;

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className={`booking-row type-${booking.type}`}
    >
      <div className="booking-time">
        <div className="t">{time}</div>
        <div className="tz">{tz}</div>
      </div>

      <div className="booking-icon">
        <TypeIcon type={booking.type} size={18} />
      </div>

      <div className="booking-body">
        <div className="booking-title-row">
          <span className="booking-title">{booking.title}</span>
          <span className="booking-kind">{TYPE_LABEL[booking.type]}</span>
        </div>
        {route && <div className="booking-route">{route}</div>}
      </div>

      <div className="booking-meta">
        <div className="booking-price">
          {hasPrice
            ? formatMoney(booking.priceAmount!, booking.priceCurrency!)
            : <span style={{ color: "var(--muted)" }}>—</span>}
        </div>
        {showCad && (
          <div className="booking-price-cad">
            ≈ {formatMoney(booking.priceCad!, HOME_CURRENCY)}
          </div>
        )}
        <div className="booking-conf">
          {booking.receiptUrl && <span className="receipt">📎</span>}
          {booking.confirmationCode ?? "—"}
        </div>
      </div>
    </Link>
  );
}
