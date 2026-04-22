// booking-card.jsx — Compact booking row for itinerary / lists

function BookingCard({ booking, onClick }) {
  const meta = TYPE_META[booking.type];
  const t = fmtTime(booking.start);
  const tz = tzAbbr(booking.tz);
  const route = (booking.type === "flight" || booking.type === "train")
    ? `${booking.from?.label || ""}  →  ${booking.to?.label || ""}`
    : booking.from?.label || "";

  return (
    <a className={`booking-row type-${booking.type}`} onClick={onClick}>
      <div className="booking-time">
        <div className="t">{t}</div>
        <div className="tz">{tz}</div>
      </div>
      <div className="booking-icon">
        <TypeIcon type={booking.type} size={18} />
      </div>
      <div className="booking-body">
        <div className="booking-title-row">
          <span className="booking-title">{booking.title}</span>
          <span className="booking-kind">{meta.label}</span>
        </div>
        <div className="booking-route">
          <span>{route}</span>
        </div>
      </div>
      <div className="booking-meta">
        <div className="booking-price">
          {booking.price.amount
            ? fmtPrice(booking.price.amount, booking.price.currency)
            : <span style={{color:"var(--muted)"}}>—</span>}
        </div>
        {booking.cad > 0 && booking.price.currency !== "CAD" && (
          <div className="booking-price-cad">≈ {fmtCAD(booking.cad)}</div>
        )}
        <div className="booking-conf">
          {booking.receipt && <span className="receipt">📎</span>}
          {booking.confirmation || "—"}
        </div>
      </div>
    </a>
  );
}

Object.assign(window, { BookingCard });
