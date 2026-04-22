import Link from "next/link";
import { listBookings } from "@/lib/bookings-repo";
import { BOOKING_TYPES } from "@/lib/booking-schema";
import { formatInTz } from "@/lib/dates";
import { formatMoney, HOME_CURRENCY } from "@/lib/utils";
import { TypeIcon } from "@/components/type-icon";

const TYPE_LABEL_PLURAL: Record<string, string> = {
  flight: "Flights",
  train: "Trains",
  hotel: "Hotels",
  activity: "Activities",
};

const COLUMNS: Record<string, string[]> = {
  flight: ["Date", "Flight", "Route", "Seat", "Conf.", "Price"],
  train: ["Date", "Train", "Route", "Seat", "Conf.", "Price"],
  hotel: ["Dates", "Hotel", "Location", "Room", "Conf.", "Price"],
  activity: ["Date", "Activity", "Venue", "Time", "Conf.", "Price"],
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const active = (BOOKING_TYPES as readonly string[]).includes(t ?? "")
    ? (t as (typeof BOOKING_TYPES)[number])
    : "flight";

  const all = await listBookings();
  const items = all.filter((b) => b.type === active);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">By <em>category</em></div>
          <div className="page-sub">Tables · Filter</div>
        </div>
      </div>

      <div className="cat-tabs">
        {BOOKING_TYPES.map((type) => {
          const count = all.filter((b) => b.type === type).length;
          return (
            <Link
              key={type}
              href={`/categories?t=${type}`}
              className={`cat-tab${type === active ? " active" : ""}`}
            >
              <TypeIcon type={type} size={14} />
              {TYPE_LABEL_PLURAL[type]}
              <span className="cat-count">{count}</span>
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="empty-day" style={{ justifyContent: "center", padding: "24px" }}>
          No {TYPE_LABEL_PLURAL[active].toLowerCase()} yet.
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "var(--r-md)" }}>
          <table className="data-table">
            <thead>
              <tr>
                {COLUMNS[active].map((col) => <th key={col}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map((b) => {
                const details = (b.details ?? {}) as Record<string, string | undefined>;
                const startFmt = formatInTz(b.startAt, b.timezone, "MMM d");
                const endFmt = b.endAt ? formatInTz(b.endAt, b.timezone, "MMM d") : null;
                const priceLabel = b.priceAmount && b.priceCurrency
                  ? formatMoney(b.priceAmount, b.priceCurrency)
                  : "—";
                const cadLabel = b.priceCad && b.priceCurrency !== HOME_CURRENCY
                  ? formatMoney(b.priceCad, HOME_CURRENCY)
                  : null;

                return (
                  <tr key={b.id}>
                    {/* Date */}
                    <td>
                      <span className="mono">
                        {b.type === "hotel" && endFmt
                          ? `${startFmt} – ${endFmt}`
                          : startFmt}
                      </span>
                    </td>
                    {/* Title */}
                    <td>
                      <Link href={`/bookings/${b.id}`} style={{ textDecoration: "none" }}>
                        <div className="primary">{b.title}</div>
                        {(b.type === "flight" || b.type === "train") && (
                          <div className="mono dim" style={{ fontSize: 10, marginTop: 2 }}>
                            {b.type === "flight" ? details.airline : details.operator}
                            {(details.flight_number || details.train_number)
                              ? ` · ${details.flight_number || details.train_number}`
                              : ""}
                          </div>
                        )}
                      </Link>
                    </td>
                    {/* Route / Location / Venue */}
                    <td>
                      {b.type === "flight" || b.type === "train" ? (
                        <span className="mono" style={{ fontSize: 12 }}>
                          {b.fromLocation ?? ""}{b.toLocation ? ` → ${b.toLocation}` : ""}
                        </span>
                      ) : b.type === "hotel" ? (
                        <span className="dim" style={{ fontSize: 12 }}>{b.fromLocation ?? ""}</span>
                      ) : (
                        <span className="dim" style={{ fontSize: 12 }}>{details.venue ?? ""}</span>
                      )}
                    </td>
                    {/* Seat / Room / Time */}
                    <td>
                      <span className="mono">
                        {b.type === "flight" || b.type === "train"
                          ? details.seat ?? "—"
                          : b.type === "hotel"
                          ? details.room_type ?? "—"
                          : formatInTz(b.startAt, b.timezone, "HH:mm")}
                      </span>
                    </td>
                    {/* Conf. */}
                    <td><span className="mono">{b.confirmationCode ?? "—"}</span></td>
                    {/* Price */}
                    <td>
                      <div className="primary" style={{ fontSize: 15 }}>{priceLabel}</div>
                      {cadLabel && <div className="mono dim" style={{ fontSize: 10 }}>{cadLabel}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
