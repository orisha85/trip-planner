// app.jsx — Root app: routing, tweaks, mount

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "persimmon",
  "density": "comfortable",
  "viewport": "desktop",
  "showGrain": true
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  persimmon: { accent: "#d85a1c", hi: "#b94814", fg: "#ffffff" },
  cobalt:    { accent: "#3d68c4", hi: "#2b4ea0", fg: "#ffffff" },
  pistachio: { accent: "#5a8a2a", hi: "#466d1f", fg: "#ffffff" },
  rose:      { accent: "#c43968", hi: "#a02a52", fg: "#ffffff" },
  mustard:   { accent: "#b48420", hi: "#8f6815", fg: "#ffffff" },
};

function useLocalRoute() {
  const [route, setRoute] = React.useState(() => localStorage.getItem("to_route") || "unlock");
  const [bookingId, setBookingId] = React.useState(() => localStorage.getItem("to_book") || null);
  const [prefillDate, setPrefillDate] = React.useState(null);

  React.useEffect(() => { localStorage.setItem("to_route", route); }, [route]);
  React.useEffect(() => { if (bookingId) localStorage.setItem("to_book", bookingId); }, [bookingId]);

  return { route, setRoute, bookingId, setBookingId, prefillDate, setPrefillDate };
}

function App() {
  const { route, setRoute, bookingId, setBookingId, prefillDate, setPrefillDate } = useLocalRoute();
  const [tweaks, setTweaks] = React.useState(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);

  // Edit mode protocol
  React.useEffect(() => {
    function onMsg(e) {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") { setEditMode(true); setTweaksOpen(true); }
      if (d.type === "__deactivate_edit_mode") { setEditMode(false); setTweaksOpen(false); }
    }
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  function setTweak(key, val) {
    const next = { ...tweaks, [key]: val };
    setTweaks(next);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [key]: val } }, "*");
  }

  // Apply accent tokens
  React.useEffect(() => {
    const p = ACCENT_PRESETS[tweaks.accent] || ACCENT_PRESETS.persimmon;
    document.documentElement.style.setProperty("--accent", p.accent);
    document.documentElement.style.setProperty("--accent-hi", p.hi);
    document.documentElement.style.setProperty("--accent-fg", p.fg);
  }, [tweaks.accent]);

  // Grain toggle
  React.useEffect(() => {
    document.documentElement.style.setProperty("--grain-display", tweaks.showGrain ? "block" : "none");
  }, [tweaks.showGrain]);

  // Density
  const densityClass = tweaks.density === "compact" ? "density-compact" : "";

  // Viewport
  const viewportClass = tweaks.viewport === "mobile" ? "mobile-mode" : "";

  function openBooking(id) { setBookingId(id); setRoute("detail"); }
  function backFromDetail() { setRoute("itinerary"); }
  function startNew(date) { setPrefillDate(date); setBookingId(null); setRoute("new"); }
  function startEdit() { setRoute("edit"); }
  function deleteBooking() {
    if (confirm("Delete this booking? This cannot be undone.")) {
      setRoute("itinerary");
    }
  }
  function saveBooking() {
    if (bookingId) setRoute("detail");
    else setRoute("itinerary");
  }

  if (route === "unlock") {
    return (
      <div className={`app-root ${viewportClass}`}>
        <UnlockView onUnlock={() => setRoute("itinerary")} />
      </div>
    );
  }

  return (
    <div className={`app-root ${viewportClass} ${densityClass}`}>
      <Header route={route} setRoute={(r) => { setRoute(r); }} trip={TRIP} />
      <div className="app-scroll">
        {route === "itinerary" && (
          <ItineraryView openBooking={openBooking} startNewOnDate={startNew} />
        )}
        {route === "categories" && (
          <CategoriesView openBooking={openBooking} />
        )}
        {route === "map" && (
          <MapView openBooking={openBooking} />
        )}
        {route === "detail" && (
          <DetailView bookingId={bookingId} onEdit={startEdit} onBack={backFromDetail} onDelete={deleteBooking} />
        )}
        {route === "edit" && (
          <BookingForm mode="edit" bookingId={bookingId} onSave={saveBooking} onCancel={() => setRoute("detail")} onDelete={deleteBooking} />
        )}
        {route === "new" && (
          <BookingForm mode="create" prefillDate={prefillDate} onSave={saveBooking} onCancel={() => setRoute("itinerary")} />
        )}
        {route === "lock" && <UnlockView onUnlock={() => setRoute("itinerary")} />}
      </div>

      {/* Floating lock button */}
      <button
        style={{
          position:"fixed", right: tweaksOpen ? 320 : 20, bottom: 20,
          padding:"10px 12px",
          background:"var(--bg-1)", border:"1px solid var(--line-2)",
          borderRadius:"var(--r-sm)",
          fontFamily:"var(--type-mono)", fontSize:10, letterSpacing:".15em",
          color:"var(--muted)", zIndex: 99,
          transition:"right .2s ease",
        }}
        onClick={() => setRoute("unlock")}
        title="Lock"
      >
        ⏻ LOCK
      </button>

      {editMode && tweaksOpen && (
        <TweaksPanel tweaks={tweaks} setTweak={setTweak} onClose={() => setTweaksOpen(false)} />
      )}
    </div>
  );
}

function TweaksPanel({ tweaks, setTweak, onClose }) {
  return (
    <div className="tweaks">
      <h4>
        Tweaks
        <span className="close" onClick={onClose}>✕</span>
      </h4>

      <div className="tweak-group">
        <span className="tweak-label">Accent</span>
        <div className="swatch-row">
          {Object.entries(ACCENT_PRESETS).map(([k, v]) => (
            <div key={k}
              className={`swatch ${tweaks.accent === k ? "active" : ""}`}
              style={{ background: v.accent, color: v.accent }}
              onClick={() => setTweak("accent", k)}
              title={k}
            />
          ))}
        </div>
      </div>

      <div className="tweak-group">
        <span className="tweak-label">Density</span>
        <div className="pill-row">
          {["comfortable","compact"].map(d => (
            <div key={d}
              className={`pill-opt ${tweaks.density === d ? "active" : ""}`}
              onClick={() => setTweak("density", d)}
            >{d}</div>
          ))}
        </div>
      </div>

      <div className="tweak-group">
        <span className="tweak-label">Viewport</span>
        <div className="pill-row">
          {["desktop","mobile"].map(v => (
            <div key={v}
              className={`pill-opt ${tweaks.viewport === v ? "active" : ""}`}
              onClick={() => setTweak("viewport", v)}
            >{v}</div>
          ))}
        </div>
      </div>

      <div className="tweak-group">
        <span className="tweak-label">Film grain</span>
        <div className="pill-row">
          {[["on", true], ["off", false]].map(([l, v]) => (
            <div key={l}
              className={`pill-opt ${tweaks.showGrain === v ? "active" : ""}`}
              onClick={() => setTweak("showGrain", v)}
            >{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
