// views.jsx — Itinerary, Categories, Map, Detail, Form, Unlock

// City-specific suggestion library (static — no external call for prototype)
const SUGGESTIONS_BY_CITY = {
  "Paris": [
    { kind: "activity", icon: "🎟", title: "Sainte-Chapelle", detail: "15 min walk · €13 · opens 9:00", tag: "underrated" },
    { kind: "activity", icon: "🥐", title: "Du Pain et des Idées", detail: "Classic boulangerie · 2.1 km", tag: "local pick" },
    { kind: "activity", icon: "🎨", title: "Musée de l'Orangerie", detail: "Monet's Water Lilies · €12.50", tag: "nearby" },
    { kind: "activity", icon: "🌳", title: "Coulée verte René-Dumont", detail: "Elevated walk · free", tag: "quiet" },
    { kind: "activity", icon: "🍷", title: "Le Verre Volé", detail: "Natural-wine bistro · book ahead", tag: "dinner" },
  ],
  "Barcelona": [
    { kind: "activity", icon: "🎟", title: "Palau de la Música", detail: "Guided tour · €22", tag: "stunning" },
    { kind: "activity", icon: "🍤", title: "Bar Cañete", detail: "Classic tapas · La Rambla", tag: "local pick" },
    { kind: "activity", icon: "🌊", title: "Barceloneta beach walk", detail: "2 km promenade · free", tag: "chill" },
    { kind: "activity", icon: "🎨", title: "Fundació Joan Miró", detail: "On Montjuïc · €14", tag: "nearby" },
    { kind: "activity", icon: "🥘", title: "Quimet & Quimet", detail: "Iconic montaditos · ~€20", tag: "lunch" },
  ],
  "Madrid": [
    { kind: "activity", icon: "🎟", title: "Reina Sofía", detail: "Guernica · €12 · 20 min walk", tag: "essential" },
    { kind: "activity", icon: "🍷", title: "Casa Alberto", detail: "Historic tavern, 1827 · dinner", tag: "local pick" },
    { kind: "activity", icon: "🌳", title: "Retiro Park", detail: "Crystal Palace · 5 min walk", tag: "nearby" },
    { kind: "activity", icon: "🥐", title: "San Ginés chocolatería", detail: "Churros since 1894 · late-night", tag: "tradition" },
    { kind: "activity", icon: "🎨", title: "Thyssen-Bornemisza", detail: "Cross the street from Prado · €13", tag: "nearby" },
  ],
  "Seville": [
    { kind: "activity", icon: "🎟", title: "Real Alcázar", detail: "Book online · €14.50", tag: "essential" },
    { kind: "activity", icon: "💃", title: "Casa de la Memoria flamenco", detail: "Intimate 60-seat venue · €22", tag: "evening" },
    { kind: "activity", icon: "🥘", title: "Eslava (tapas)", detail: "Go for honey-glazed ribs · no res", tag: "local pick" },
    { kind: "activity", icon: "🌳", title: "Plaza de España", detail: "Sunset stroll · free", tag: "photogenic" },
  ],
};

function getSuggestions(city) {
  if (!city) return [];
  // Match by last word (Paris/Barcelona/Madrid/Seville)
  for (const key of Object.keys(SUGGESTIONS_BY_CITY)) {
    if (city.toLowerCase().includes(key.toLowerCase())) return SUGGESTIONS_BY_CITY[key];
  }
  return [];
}

// ─── ITINERARY ──────────────────────────────────────────────
function ItineraryView({ openBooking, startNewOnDate }) {
  const days = dayList();
  const byDay = bookingsByDay();
  const [suggestOpen, setSuggestOpen] = React.useState(null); // iso date

  // Close on outside click
  React.useEffect(() => {
    if (!suggestOpen) return;
    function onDoc(e) {
      if (!e.target.closest(".suggest-popover") && !e.target.closest(".suggest-trigger")) {
        setSuggestOpen(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [suggestOpen]);

  // Find which city you're in on each day via most recent hotel
  const cityForDay = React.useMemo(() => {
    const map = {};
    let current = null;
    for (const d of days) {
      for (const b of BOOKINGS) {
        if (b.type === "hotel" && b.start.slice(0,10) <= d.iso && b.end?.slice(0,10) > d.iso) {
          current = b.from?.label?.split(",").pop()?.trim() || b.title;
        }
      }
      map[d.iso] = current;
    }
    return map;
  }, [days]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">
            The <em>itinerary</em>
          </div>
          <div className="page-sub">Day by Day · 25 Days · 14 Bookings</div>
        </div>
        <button className="btn btn-ghost">
          Export / Print
        </button>
      </div>

      {days.map(d => {
        const list = byDay[d.iso] || [];
        const { wk, mo, day } = fmtDateLong(d.date);
        const city = cityForDay[d.iso];
        return (
          <section key={d.iso} className="day-section">
            <div className="day-header">
              <div className="day-marker">
                <span className="day-num">Day {String(d.idx).padStart(2,"0")} / 25</span>
                <span className="day-date">
                  <span className="weekday">{wk}</span>
                  {mo} {day}
                </span>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:10, position:"relative"}}>
                {city && <span className="day-meta">in {city}</span>}
                {city && getSuggestions(city).length > 0 && (
                  <button
                    className="btn btn-ghost btn-icon suggest-trigger"
                    onClick={() => setSuggestOpen(suggestOpen === d.iso ? null : d.iso)}
                    title={`Suggestions near ${city}`}
                    style={{
                      padding: 7,
                      background: suggestOpen === d.iso ? "rgba(216,90,28,.08)" : undefined,
                      borderColor: suggestOpen === d.iso ? "var(--accent)" : undefined,
                      color: suggestOpen === d.iso ? "var(--accent)" : undefined,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M16 8l-2.5 5.5L8 16l2.5-5.5L16 8z" fill="currentColor" fillOpacity="0.15"/>
                    </svg>
                  </button>
                )}
                <button className="btn btn-ghost btn-icon" onClick={() => startNewOnDate(d.iso)} title="Add booking this day">
                  +
                </button>
                {suggestOpen === d.iso && (
                  <SuggestPopover
                    city={city}
                    items={getSuggestions(city)}
                    onPick={(s) => { setSuggestOpen(null); startNewOnDate(d.iso); }}
                    onClose={() => setSuggestOpen(null)}
                  />
                )}
              </div>
            </div>
            {list.length === 0 ? (
              <div className="empty-day">
                <span>— nothing planned —</span>
                <a className="add-link" onClick={() => startNewOnDate(d.iso)}>add something</a>
              </div>
            ) : list.map(b => (
              <BookingCard key={b.id} booking={b} onClick={() => openBooking(b.id)} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

// ─── CATEGORIES ─────────────────────────────────────────────
function CategoriesView({ openBooking }) {
  const [tab, setTab] = React.useState("flight");
  const list = BOOKINGS.filter(b => b.type === tab);

  const tabs = ["flight","train","hotel","activity"];

  const columns = {
    flight: ["Date", "Flight", "Route", "Seat", "Conf.", "Price"],
    train: ["Date", "Train", "Route", "Seat", "Conf.", "Price"],
    hotel: ["Dates", "Hotel", "Location", "Room", "Conf.", "Price"],
    activity: ["Date", "Activity", "Venue", "Time", "Conf.", "Price"],
  };

  function rowFor(b) {
    const startD = fmtDateLong(new Date(b.start));
    const endD = b.end ? fmtDateLong(new Date(b.end)) : null;

    if (b.type === "flight" || b.type === "train") {
      return (
        <tr key={b.id} onClick={() => openBooking(b.id)}>
          <td className="mono">{startD.mo} {startD.day}</td>
          <td>
            <div className="primary">{b.title}</div>
            <div className="muted mono" style={{fontSize:10, marginTop:2}}>
              {b.type === "flight" ? b.airline : b.operator} · {b.flightNumber || b.trainNumber}
            </div>
          </td>
          <td className="mono">{b.from?.code || b.from?.label?.slice(0,20)} → {b.to?.code || b.to?.label?.slice(0,20)}</td>
          <td className="mono">{b.seat || "—"}</td>
          <td className="mono">{b.confirmation || "—"}</td>
          <td>
            <div className="primary">{fmtPrice(b.price.amount, b.price.currency)}</div>
            {b.price.currency !== "CAD" && <div className="muted mono" style={{fontSize:10}}>{fmtCAD(b.cad)}</div>}
          </td>
        </tr>
      );
    }

    if (b.type === "hotel") {
      return (
        <tr key={b.id} onClick={() => openBooking(b.id)}>
          <td className="mono">{startD.mo} {startD.day} – {endD?.mo} {endD?.day}</td>
          <td><div className="primary">{b.title}</div></td>
          <td className="muted" style={{fontSize:12}}>{b.address}</td>
          <td>{b.roomType}</td>
          <td className="mono">{b.confirmation || "—"}</td>
          <td>
            <div className="primary">{fmtPrice(b.price.amount, b.price.currency)}</div>
            {b.price.currency !== "CAD" && <div className="muted mono" style={{fontSize:10}}>{fmtCAD(b.cad)}</div>}
          </td>
        </tr>
      );
    }

    // activity
    return (
      <tr key={b.id} onClick={() => openBooking(b.id)}>
        <td className="mono">{startD.mo} {startD.day}</td>
        <td><div className="primary">{b.title}</div></td>
        <td className="muted" style={{fontSize:12}}>{b.venue}</td>
        <td className="mono">{fmtTime(b.start)}{b.end ? `–${fmtTime(b.end)}` : ""}</td>
        <td className="mono">{b.confirmation || "—"}</td>
        <td>
          <div className="primary">{fmtPrice(b.price.amount, b.price.currency)}</div>
          {b.price.currency !== "CAD" && b.cad > 0 && <div className="muted mono" style={{fontSize:10}}>{fmtCAD(b.cad)}</div>}
        </td>
      </tr>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">By <em>category</em></div>
          <div className="page-sub">Tables · Filter · Export</div>
        </div>
      </div>

      <div className="cat-tabs">
        {tabs.map(t => {
          const n = BOOKINGS.filter(b => b.type === t).length;
          return (
            <button key={t}
              className={`cat-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              <TypeIcon type={t} size={14} />
              {TYPE_META[t].label}s
              <span className="cat-count">{n}</span>
            </button>
          );
        })}
      </div>

      <table className="table">
        <thead>
          <tr>
            {columns[tab].map(c => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {list.map(rowFor)}
        </tbody>
      </table>
    </div>
  );
}

// ─── MAP (stylized) ─────────────────────────────────────────
function MapView({ openBooking }) {
  const [active, setActive] = React.useState(null);
  const geoBookings = BOOKINGS.filter(b => b.from && typeof b.from.x === "number");
  const pins = geoBookings.filter(b => b.type === "hotel" || b.type === "activity");
  const lines = geoBookings.filter(b => b.type === "flight" || b.type === "train");

  return (
    <div className="page" style={{maxWidth: 1400}}>
      <div className="page-header">
        <div>
          <div className="page-title">The <em>map</em></div>
          <div className="page-sub">{pins.length} Pins · {lines.length} Routes</div>
        </div>
        <div style={{display:"flex", gap:10}}>
          <button className="btn btn-ghost">Satellite</button>
          <button className="btn btn-ghost">Street</button>
        </div>
      </div>

      <div className="map-layout">
        <div className="map-canvas">
          <MapCanvas pins={pins} lines={lines} active={active} setActive={setActive} openBooking={openBooking} />
        </div>
        <div className="map-side">
          <div className="map-side-head">
            <h3>Pinned places</h3>
            <p>{geoBookings.length} Located</p>
          </div>
          <div className="map-side-list">
            {geoBookings.map(b => (
              <div key={b.id}
                className={`map-side-item ${active === b.id ? "active" : ""}`}
                onMouseEnter={() => setActive(b.id)}
                onMouseLeave={() => setActive(null)}
                onClick={() => openBooking(b.id)}
              >
                <div className="dot" style={{background: `var(--${({flight:"sky",train:"sea",hotel:"gold",activity:"accent"})[b.type]})`}} />
                <div className="label">{b.title}</div>
                <div className="kind">{b.type.slice(0,3)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MapCanvas({ pins, lines, active, setActive, openBooking }) {
  const W = 1000, H = 640;

  // Illustrated continent silhouette (stylized Europe + NA coastline hint)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%", height:"100%", display:"block"}}>
      <defs>
        <radialGradient id="mapGlow" cx="55%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#f2ead7" />
          <stop offset="100%" stopColor="#e3d9c0" />
        </radialGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(90,60,20,.08)" strokeWidth="1"/>
        </pattern>
        <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.8" fill="rgba(90,60,20,.1)"/>
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#mapGlow)" />
      <rect width={W} height={H} fill="url(#grid)" />

      {/* Latitude/longitude graticule */}
      {[0.2, 0.4, 0.6, 0.8].map(p => (
        <g key={p}>
          <line x1="0" y1={p*H} x2={W} y2={p*H} stroke="rgba(90,60,20,.1)" strokeDasharray="2 6" />
          <line x1={p*W} y1="0" x2={p*W} y2={H} stroke="rgba(90,60,20,.1)" strokeDasharray="2 6" />
        </g>
      ))}

      {/* Stylized landmass shapes — abstract, not literal geography */}
      <g fill="#d9ceb5" stroke="#b9ad8e" strokeWidth="1">
        {/* North America silhouette hint */}
        <path d="M -20 140 Q 40 110 90 170 Q 120 210 100 260 Q 70 290 40 290 L -20 290 Z" />
        {/* Europe / Iberia */}
        <path d="M 460 200 Q 520 190 580 215 Q 640 240 640 290 Q 620 340 580 360 L 540 370 Q 510 380 490 430 Q 420 470 360 470 Q 310 510 330 560 L 280 540 Q 260 480 300 450 Q 340 420 360 400 Q 380 370 420 360 Q 450 340 440 310 Q 430 280 450 250 Q 445 220 460 200 Z" />
        {/* UK */}
        <path d="M 430 210 Q 455 210 460 240 Q 440 260 420 250 Z" />
        {/* North Africa hint */}
        <path d="M 320 570 Q 420 560 520 580 Q 580 610 600 640 L 300 640 Z" />
      </g>
      {/* Country labels */}
      <g fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(80,60,30,.45)" letterSpacing="2">
        <text x="40" y="240">CANADA</text>
        <text x="510" y="395">FRANCE</text>
        <text x="400" y="520">SPAIN</text>
        <text x="560" y="260">UK</text>
      </g>
      <g fontFamily="'Fraunces', serif" fontSize="40" fontStyle="italic" fill="rgba(80,60,30,.12)" letterSpacing="-1">
        <text x="540" y="140">Atlantique</text>
        <text x="540" y="530">Mediterraneum</text>
      </g>

      {/* Flight / train lines */}
      {lines.map(b => {
        if (!b.to || typeof b.to.x !== "number") return null;
        const x1 = b.from.x * W, y1 = b.from.y * H;
        const x2 = b.to.x * W, y2 = b.to.y * H;
        const mx = (x1+x2)/2, my = (y1+y2)/2;
        // Flight arc: lift the midpoint
        const dx = x2 - x1, dy = y2 - y1;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const lift = b.type === "flight" ? dist * 0.22 : 0;
        const cx = mx, cy = my - lift;
        const color = b.type === "flight" ? "var(--sky)" : "var(--sea)";
        const isActive = active === b.id;
        return (
          <g key={b.id}>
            <path
              d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
              fill="none"
              stroke={color}
              strokeWidth={isActive ? 2.2 : 1.4}
              strokeDasharray={b.type === "flight" ? "4 5" : "none"}
              strokeOpacity={isActive ? 1 : 0.7}
              style={{transition:"all .2s ease", cursor:"pointer"}}
              onMouseEnter={() => setActive(b.id)}
              onMouseLeave={() => setActive(null)}
              onClick={() => openBooking(b.id)}
            />
            {/* endpoint dots */}
            <circle cx={x1} cy={y1} r="3" fill={color} opacity={0.8}/>
            <circle cx={x2} cy={y2} r="3" fill={color} opacity={0.8}/>
          </g>
        );
      })}

      {/* Pin markers */}
      {pins.map(b => {
        const x = b.from.x * W, y = b.from.y * H;
        const isActive = active === b.id;
        const color = ({hotel:"var(--gold)", activity:"var(--accent)"})[b.type];
        return (
          <g key={b.id} style={{cursor:"pointer"}}
            onMouseEnter={() => setActive(b.id)}
            onMouseLeave={() => setActive(null)}
            onClick={() => openBooking(b.id)}
          >
            {isActive && (
              <circle cx={x} cy={y} r="14" fill={color} opacity="0.15" />
            )}
            <circle cx={x} cy={y} r={isActive ? 7 : 5} fill={color} stroke="var(--bg)" strokeWidth="2" />
            {isActive && (
              <g>
                <rect x={x + 12} y={y - 14} width={b.title.length * 7 + 16} height="26" rx="4"
                  fill="var(--bg-1)" stroke="var(--line-2)" />
                <text x={x + 20} y={y + 3} fill="var(--ink)" fontSize="12" fontFamily="'Fraunces', serif">
                  {b.title}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Compass */}
      <g transform={`translate(${W-80}, ${H-80})`}>
        <circle r="28" fill="var(--bg-1)" stroke="var(--line-2)" />
        <path d="M 0 -20 L 4 0 L 0 5 L -4 0 Z" fill="var(--accent)" />
        <path d="M 0 20 L 4 0 L 0 -5 L -4 0 Z" fill="var(--ink-dim)" opacity="0.3" />
        <text y="-32" textAnchor="middle" fill="var(--muted)" fontSize="9" fontFamily="'JetBrains Mono', monospace" letterSpacing="1">N</text>
      </g>

      {/* Scale */}
      <g transform={`translate(30, ${H-30})`}>
        <line x1="0" y1="0" x2="80" y2="0" stroke="var(--ink-dim)" strokeWidth="1.5" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--ink-dim)" strokeWidth="1.5" />
        <line x1="80" y1="-4" x2="80" y2="4" stroke="var(--ink-dim)" strokeWidth="1.5" />
        <text x="40" y="-8" fill="var(--muted)" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" letterSpacing="1">500 KM</text>
      </g>
    </svg>
  );
}

Object.assign(window, { ItineraryView, CategoriesView, MapView, SuggestPopover: null });

// ─── SUGGESTIONS POPOVER ────────────────────────────────────
function SuggestPopover({ city, items, onPick, onClose }) {
  return (
    <div className="suggest-popover" style={{
      position: "absolute",
      top: "calc(100% + 10px)",
      right: 0,
      width: 340,
      background: "var(--bg-1)",
      border: "1px solid var(--line-2)",
      borderRadius: "var(--r-md)",
      boxShadow: "var(--shadow-2)",
      zIndex: 50,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "14px 16px 10px",
        borderBottom: "1px solid var(--line)",
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
      }}>
        <div>
          <div style={{
            fontFamily: "var(--type-mono)", fontSize: 9,
            letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)",
            marginBottom: 3,
          }}>Nearby · AI picks</div>
          <div style={{
            fontFamily: "var(--type-serif)", fontSize: 18, color: "var(--ink)",
            letterSpacing: "-.01em",
          }}>
            Around <em style={{color:"var(--accent)", fontStyle:"italic"}}>{city}</em>
          </div>
        </div>
        <span style={{cursor:"pointer", color:"var(--muted)", fontSize:14}} onClick={onClose}>✕</span>
      </div>
      <div style={{maxHeight: 340, overflowY: "auto"}}>
        {items.map((s, i) => (
          <div key={i}
            onClick={() => onPick(s)}
            style={{
              display: "flex", gap: 12, padding: "12px 16px",
              borderBottom: i < items.length - 1 ? "1px solid var(--line)" : "none",
              cursor: "pointer", alignItems: "flex-start",
              transition: "background .12s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-2)"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          >
            <div style={{fontSize: 22, lineHeight: 1, marginTop: 2}}>{s.icon}</div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{
                fontFamily: "var(--type-serif)", fontSize: 15, color: "var(--ink)",
                letterSpacing: "-.005em", marginBottom: 3,
              }}>{s.title}</div>
              <div style={{
                fontFamily: "var(--type-mono)", fontSize: 10, color: "var(--muted)",
                letterSpacing: ".02em",
              }}>{s.detail}</div>
            </div>
            <div style={{
              fontFamily: "var(--type-mono)", fontSize: 8,
              letterSpacing: ".18em", textTransform: "uppercase",
              color: "var(--accent)", padding: "3px 7px",
              border: "1px solid var(--accent)", borderRadius: 3,
              whiteSpace: "nowrap", marginTop: 2,
            }}>{s.tag}</div>
          </div>
        ))}
      </div>
      <div style={{
        padding: "10px 16px", borderTop: "1px solid var(--line)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "var(--type-mono)", fontSize: 9, letterSpacing: ".14em",
        textTransform: "uppercase", color: "var(--muted-2)",
      }}>
        <span>Based on {city}</span>
        <span style={{color:"var(--accent)", cursor:"pointer"}}>More ↗</span>
      </div>
    </div>
  );
}

Object.assign(window, { SuggestPopover });
