import Link from "next/link";
import { notFound } from "next/navigation";
import { getBooking } from "@/lib/bookings-repo";
import { formatMoney, HOME_CURRENCY } from "@/lib/utils";
import { formatInTz } from "@/lib/dates";
import { TypeIcon, TYPE_LABEL, TYPE_WATERMARK } from "@/components/type-icon";

function receiptHref(url: string) {
  if (url.includes("private.blob.vercel-storage.com")) {
    return `/api/blob-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
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

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const b = await getBooking(id);
  if (!b) notFound();

  const details = (b.details ?? {}) as Record<string, string | undefined>;
  const typeLabel = TYPE_LABEL[b.type] ?? b.type;
  const watermark = TYPE_WATERMARK[b.type] ?? "";

  const startFmt = formatInTz(b.startAt, b.timezone, "EEE, MMM d · HH:mm zzz");
  const endFmt = b.endAt ? formatInTz(b.endAt, b.timezone, "EEE, MMM d · HH:mm zzz") : null;

  return (
    <div className="page" style={{ maxWidth: 960 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Link href="/itinerary" className="btn btn-ghost">← Back</Link>
        <span className="page-sub" style={{ margin: 0 }}>/ bookings / {b.id}</span>
      </div>

      <div className="detail-hero">
        <div className="kind-badge">
          <TypeIcon type={b.type} size={12} /> {typeLabel}
        </div>
        <h1>{b.title}</h1>
        <div className="subtitle">
          {startFmt}{endFmt ? ` → ${endFmt}` : ""}
        </div>
        <div className="watermark">{watermark}</div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="field-grid">
            <div>
              <div className="field-label">{startLabel(b.type)}</div>
              <div className="field-value">{formatInTz(b.startAt, b.timezone)}</div>
            </div>
            {b.endAt && (
              <div>
                <div className="field-label">{endLabel(b.type)}</div>
                <div className="field-value">{formatInTz(b.endAt, b.timezone)}</div>
              </div>
            )}
            {b.fromLocation && (
              <div>
                <div className="field-label">{b.type === "hotel" || b.type === "activity" ? "Location" : "From"}</div>
                <div className="field-value">{b.fromLocation}</div>
              </div>
            )}
            {b.toLocation && (
              <div>
                <div className="field-label">To</div>
                <div className="field-value">{b.toLocation}</div>
              </div>
            )}
            {details.airline && (
              <div><div className="field-label">Airline</div><div className="field-value">{details.airline}</div></div>
            )}
            {details.flight_number && (
              <div><div className="field-label">Flight #</div><div className="field-value mono">{details.flight_number}</div></div>
            )}
            {details.operator && (
              <div><div className="field-label">Operator</div><div className="field-value">{details.operator}</div></div>
            )}
            {details.train_number && (
              <div><div className="field-label">Train #</div><div className="field-value mono">{details.train_number}</div></div>
            )}
            {details.coach && (
              <div><div className="field-label">Coach</div><div className="field-value mono">{details.coach}</div></div>
            )}
            {details.seat && (
              <div><div className="field-label">Seat</div><div className="field-value mono">{details.seat}</div></div>
            )}
            {details.terminal && (
              <div><div className="field-label">Terminal</div><div className="field-value mono">{details.terminal}</div></div>
            )}
            {details.room_type && (
              <div><div className="field-label">Room type</div><div className="field-value">{details.room_type}</div></div>
            )}
            {details.address && (
              <div className="span-2"><div className="field-label">Address</div><div className="field-value" style={{ fontSize: 15 }}>{details.address}</div></div>
            )}
            {details.venue && (
              <div><div className="field-label">Venue</div><div className="field-value">{details.venue}</div></div>
            )}
            {details.ticket_url && (
              <div className="span-2">
                <div className="field-label">Ticket URL</div>
                <div className="field-value mono" style={{ fontSize: 13 }}>
                  <a href={details.ticket_url} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>{details.ticket_url}</a>
                </div>
              </div>
            )}
            {b.notes && (
              <div className="span-2">
                <div className="field-label">Notes</div>
                <div className="field-value" style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{b.notes}</div>
              </div>
            )}
          </div>

          <div className="action-row" style={{ padding: "16px 28px", background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)" }}>
            <Link href={`/bookings/${b.id}/edit`} className="btn btn-primary">Edit</Link>
            <Link href="/itinerary" className="btn btn-ghost">Back</Link>
            <div className="spacer" />
          </div>
        </div>

        <div>
          {(b.priceAmount || b.priceCad) && (
            <div className="aside-card">
              <h4>Cost</h4>
              {b.priceAmount && b.priceCurrency && (
                <div style={{ marginBottom: 12 }}>
                  <div className="field-label" style={{ fontFamily: "var(--type-mono)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Original</div>
                  <div style={{ fontFamily: "var(--type-serif)", fontSize: 24, letterSpacing: "-.01em" }}>
                    {formatMoney(b.priceAmount, b.priceCurrency)}
                    <span style={{ fontFamily: "var(--type-mono)", fontSize: 11, color: "var(--muted)", marginLeft: 6 }}>{b.priceCurrency}</span>
                  </div>
                </div>
              )}
              {b.priceCad && b.priceCurrency !== HOME_CURRENCY && (
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                  <div className="field-label" style={{ fontFamily: "var(--type-mono)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>CAD equivalent</div>
                  <div style={{ fontFamily: "var(--type-serif)", fontSize: 24, color: "var(--accent)" }}>
                    {formatMoney(b.priceCad, HOME_CURRENCY)}
                  </div>
                </div>
              )}
              {b.fxRate && b.priceCurrency && b.priceCurrency !== HOME_CURRENCY && (
                <div style={{ marginTop: 10, fontFamily: "var(--type-mono)", fontSize: 11, color: "var(--muted)" }}>
                  FX snapshot: 1 {b.priceCurrency} = {Number(b.fxRate).toFixed(4)} {HOME_CURRENCY}
                </div>
              )}
            </div>
          )}

          {b.confirmationCode && (
            <div className="aside-card">
              <h4>Reference</h4>
              <div style={{ fontFamily: "var(--type-mono)", fontSize: 14, letterSpacing: ".04em", color: "var(--ink)" }}>{b.confirmationCode}</div>
            </div>
          )}

          <div className="aside-card">
            <h4>Receipt / Ticket</h4>
            {b.receiptUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 50, border: "1px solid var(--line)", borderRadius: 4, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--muted)" }}>📄</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a
                    href={receiptHref(b.receiptUrl)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontFamily: "var(--type-mono)", fontSize: 12, color: "var(--accent)", wordBreak: "break-all" }}
                  >
                    {b.receiptFilename ?? "View receipt"}
                  </a>
                </div>
              </div>
            ) : (
              <div className="empty-day" style={{ margin: 0, padding: 12, fontSize: 11 }}>— No receipt —</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
