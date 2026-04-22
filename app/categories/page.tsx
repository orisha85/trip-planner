import Link from "next/link";
import { listBookings } from "@/lib/bookings-repo";
import { BOOKING_TYPES } from "@/lib/booking-schema";
import { formatInTz } from "@/lib/dates";
import { formatMoney, HOME_CURRENCY } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  flight: "Flights",
  train: "Trains",
  hotel: "Hotels",
  activity: "Activities",
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
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Categories</h1>

      <div className="flex flex-wrap gap-2 border-b border-[color:var(--color-border)]">
        {BOOKING_TYPES.map((t) => {
          const isActive = t === active;
          return (
            <Link
              key={t}
              href={`/categories?t=${t}`}
              className={`-mb-px border-b-2 px-3 py-2 text-sm ${
                isActive
                  ? "border-[color:var(--color-accent)] text-[color:var(--color-fg)]"
                  : "border-transparent text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
              }`}
            >
              {TYPE_LABEL[t]}{" "}
              <span className="text-xs text-[color:var(--color-muted)]">
                ({all.filter((b) => b.type === t).length})
              </span>
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-[color:var(--color-border)] p-8 text-center text-sm text-[color:var(--color-muted)]">
          No {TYPE_LABEL[active].toLowerCase()} yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[color:var(--color-border)]">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--color-bg-elev)] text-left text-xs uppercase tracking-wide text-[color:var(--color-muted)]">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Route / Location</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Confirm.</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => {
                const priceLabel =
                  b.priceAmount && b.priceCurrency
                    ? `${formatMoney(b.priceAmount, b.priceCurrency)}${
                        b.priceCad && b.priceCurrency !== HOME_CURRENCY
                          ? ` / ${formatMoney(b.priceCad, HOME_CURRENCY)}`
                          : ""
                      }`
                    : "—";
                return (
                  <tr
                    key={b.id}
                    className="border-t border-[color:var(--color-border)]"
                  >
                    <td className="whitespace-nowrap px-3 py-2">
                      {formatInTz(b.startAt, b.timezone, "MMM d, HH:mm")}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/bookings/${b.id}`}
                        className="text-[color:var(--color-accent)] underline"
                      >
                        {b.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[color:var(--color-muted)]">
                      {b.fromLocation ?? ""}
                      {b.toLocation ? ` → ${b.toLocation}` : ""}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">{priceLabel}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                      {b.confirmationCode ?? ""}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {b.receiptUrl && (
                        <a
                          href={b.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[color:var(--color-accent)] underline"
                        >
                          receipt
                        </a>
                      )}
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
