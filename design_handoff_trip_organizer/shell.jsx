// shell.jsx — Header, nav, page container

function Header({ route, setRoute, trip }) {
  const totalC = totalCAD();
  const count = BOOKINGS.length;
  const dUntil = daysUntilTrip();

  const tabs = [
    { id: "itinerary", label: "Itinerary", count },
    { id: "categories", label: "Categories", count: 4 },
    { id: "map", label: "Map", count: "" },
  ];

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand">
          <div className="eyebrow">Trip Organizer · Private</div>
          <div className="title">
            {trip.title} <em>'{trip.year.slice(2)}</em>
          </div>
          <div className="dates">JUL 31, 2026 — AUG 24, 2026 · 25 DAYS</div>
        </div>
        <div className="header-stats">
          <div className="countdown-chip">
            <span className="dot" />
            IN {dUntil} DAYS
          </div>
          <div className="stat">
            <div className="label">Total</div>
            <div className="value accent">
              {fmtCAD(totalC)}<span className="unit">CAD</span>
            </div>
          </div>
          <div className="stat stat-count">
            <div className="label">Bookings</div>
            <div className="value">{count}</div>
          </div>
        </div>
      </div>
      <div className="header-tabs">
        <div className="tab-list">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`tab ${route.startsWith(t.id) ? "active" : ""}`}
              onClick={() => setRoute(t.id)}
            >
              {t.label}
              {t.count !== "" && <span className="count">({t.count})</span>}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setRoute("new")}>
          <span style={{fontSize: 14, marginTop: -1}}>+</span> New Booking
        </button>
      </div>
    </header>
  );
}

// Type icon rendered as SVG so it stays on-brand vs emoji
function TypeIcon({ type, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  if (type === "flight") return (
    <svg {...common}><path d="M2 16l20-7-7 13-3-6-10-0z"/></svg>
  );
  if (type === "train") return (
    <svg {...common}><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14"/><circle cx="9" cy="14" r="1" fill="currentColor"/><circle cx="15" cy="14" r="1" fill="currentColor"/><path d="M7 17l-2 4M17 17l2 4"/></svg>
  );
  if (type === "hotel") return (
    <svg {...common}><path d="M3 20V7h18v13"/><path d="M3 13h18"/><path d="M7 10h4"/><path d="M3 20h18"/></svg>
  );
  if (type === "activity") return (
    <svg {...common}><path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M12 3v18"/><path d="M3 8l9 5 9-5"/></svg>
  );
  return null;
}

Object.assign(window, { Header, TypeIcon });
