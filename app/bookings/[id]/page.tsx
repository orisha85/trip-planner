import Link from "next/link";
import { notFound } from "next/navigation";
import { getBooking } from "@/lib/bookings-repo";
import { formatMoney, HOME_CURRENCY } from "@/lib/utils";
import { buttonClass, buttonGhostClass } from "@/components/ui/field";
import { formatInTz } from "@/lib/dates";

function receiptHref(url: string) {
  if (url.includes("private.blob.vercel-storage.com")) {
    return `/api/blob-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const b = await getBooking(id);
  if (!b) notFound();

  const typeLabel = b.type[0].toUpperCase() + b.type.slice(1);
  const details = (b.details ?? {}) as Record<string, string | undefined>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-[color:var(--color-muted)]">
            {typeLabel}
          </div>
          <h1 className="text-2xl font-semibold">{b.title}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/bookings/${b.id}/edit`} className={buttonClass}>
            Edit
          </Link>
          <Link href="/itinerary" className={buttonGhostClass}>
            Back
          </Link>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
        <Row label={startLabel(b.type)} value={formatInTz(b.startAt, b.timezone)} />
        {b.endAt && (
          <Row label={endLabel(b.type)} value={formatInTz(b.endAt, b.timezone)} />
        )}
        {b.fromLocation && (
          <Row
            label={b.type === "hotel" || b.type === "activity" ? "Location" : "From"}
            value={b.fromLocation}
          />
        )}
        {b.toLocation && <Row label="To" value={b.toLocation} />}
        {b.confirmationCode && (
          <Row label="Confirmation" value={b.confirmationCode} mono />
        )}
        {details.airline && <Row label="Airline" value={details.airline} />}
        {details.flight_number && (
          <Row label="Flight #" value={details.flight_number} mono />
        )}
        {details.operator && <Row label="Operator" value={details.operator} />}
        {details.train_number && (
          <Row label="Train #" value={details.train_number} mono />
        )}
        {details.coach && <Row label="Coach" value={details.coach} />}
        {details.seat && <Row label="Seat" value={details.seat} />}
        {details.terminal && <Row label="Terminal" value={details.terminal} />}
        {details.address && <Row label="Address" value={details.address} />}
        {details.venue && <Row label="Venue" value={details.venue} />}
        {details.room_type && <Row label="Room" value={details.room_type} />}
        {b.priceAmount && b.priceCurrency && (
          <Row
            label="Price"
            value={`${formatMoney(b.priceAmount, b.priceCurrency)}${
              b.priceCad && b.priceCurrency !== HOME_CURRENCY
                ? `  (${formatMoney(b.priceCad, HOME_CURRENCY)})`
                : ""
            }`}
          />
        )}
      </dl>

      {b.notes && (
        <div>
          <div className="mb-1 text-sm text-[color:var(--color-muted)]">Notes</div>
          <p className="whitespace-pre-wrap rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] p-3 text-sm">
            {b.notes}
          </p>
        </div>
      )}

      {b.receiptUrl && (
        <div>
          <div className="mb-1 text-sm text-[color:var(--color-muted)]">Receipt / Ticket</div>
          <a
            href={receiptHref(b.receiptUrl)}
            target="_blank"
            rel="noreferrer"
            className="text-[color:var(--color-accent)] underline"
          >
            {b.receiptFilename || "View receipt"}
          </a>
        </div>
      )}

      {details.ticket_url && (
        <div>
          <div className="mb-1 text-sm text-[color:var(--color-muted)]">Ticket link</div>
          <a
            href={details.ticket_url}
            target="_blank"
            rel="noreferrer"
            className="text-[color:var(--color-accent)] underline"
          >
            {details.ticket_url}
          </a>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-[color:var(--color-muted)]">{label}</dt>
      <dd className={mono ? "font-mono text-sm" : "text-sm"}>{value}</dd>
    </div>
  );
}

function startLabel(t: string) {
  if (t === "hotel") return "Check-in";
  if (t === "activity") return "Starts";
  return "Departure";
}

function endLabel(t: string) {
  if (t === "hotel") return "Check-out";
  if (t === "activity") return "Ends";
  return "Arrival";
}
