// views-detail-form.jsx — Booking detail page, form, and unlock

// ─── DETAIL ─────────────────────────────────────────────────
function DetailView({ bookingId, onEdit, onBack, onDelete }) {
  const b = BOOKINGS.find(x => x.id === bookingId);
  if (!b) return <div className="page"><div>Booking not found.</div></div>;
  const meta = TYPE_META[b.type];
  const startD = fmtDateLong(new Date(b.start));
  const endD = b.end ? fmtDateLong(new Date(b.end)) : null;

  const specificFields = () => {
    if (b.type === "flight") return [
      ["Airline", b.airline], ["Flight", b.flightNumber, "mono"],
      ["Seat", b.seat, "mono"], ["Terminal", b.terminal, "mono"],
    ];
    if (b.type === "train") return [
      ["Operator", b.operator], ["Train", b.trainNumber, "mono"],
      ["Coach", b.coach, "mono"], ["Seat", b.seat, "mono"],
    ];
    if (b.type === "hotel") return [
      ["Address", b.address, null, true], ["Room type", b.roomType],
    ];
    if (b.type === "activity") return [
      ["Venue", b.venue], ["Address", b.address, null, true],
      ["Ticket URL", b.ticketUrl, "mono", true],
    ];
    return [];
  };

  return (
    <div className="page">
      <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:20}}>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <span className="page-sub" style={{margin:0}}>/ bookings / {b.id}</span>
      </div>

      <div className="detail-hero">
        <div className="kind-badge">
          <TypeIcon type={b.type} size={12}/> {meta.label}
        </div>
        <h1>{b.title}</h1>
        <div className="subtitle">
          {startD.wk} {startD.mo} {startD.day} · {fmtTime(b.start)}
          {endD && ` → ${endD.wk} ${endD.mo} ${endD.day} · ${fmtTime(b.end)}`}
        </div>
        <div className="watermark">{meta.icon}</div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="field-grid">
            {specificFields().map(([label, val, mono, span2]) => (
              <div key={label} className={span2 ? "span-2" : ""}>
                <div className="field-label">{label}</div>
                <div className={`field-value ${mono === "mono" ? "mono" : ""}`}>{val || "—"}</div>
              </div>
            ))}
            {(b.type === "flight" || b.type === "train") && (
              <>
                <div>
                  <div className="field-label">From</div>
                  <div className="field-value">{b.from?.label}</div>
                </div>
                <div>
                  <div className="field-label">To</div>
                  <div className="field-value">{b.to?.label}</div>
                </div>
              </>
            )}
            <div className="span-2">
              <div className="field-label">Notes</div>
              <div className="field-value" style={{fontSize:15, lineHeight:1.5}}>{b.notes || <span style={{color:"var(--muted)"}}>No notes.</span>}</div>
            </div>
          </div>

          <div className="action-row" style={{padding:"16px 28px", background:"var(--bg-1)", border:"1px solid var(--line)", borderRadius:"var(--r-lg)", marginTop:0}}>
            <button className="btn btn-primary" onClick={onEdit}>Edit</button>
            <button className="btn btn-ghost" onClick={onBack}>Cancel</button>
            <div className="spacer"/>
            <button className="btn btn-danger" onClick={onDelete}>Delete</button>
          </div>
        </div>

        <div>
          <div className="aside-card">
            <h4>Cost</h4>
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              <div>
                <div className="field-label">Original</div>
                <div className="field-value" style={{fontSize:24}}>
                  {fmtPrice(b.price.amount, b.price.currency)}
                  <span style={{fontFamily:"var(--type-mono)", fontSize:11, color:"var(--muted)", marginLeft:6}}>
                    {b.price.currency}
                  </span>
                </div>
              </div>
              <div style={{borderTop:"1px solid var(--line)", paddingTop:10}}>
                <div className="field-label">CAD equivalent</div>
                <div className="field-value" style={{fontSize:24, color:"var(--accent)"}}>
                  {fmtCAD(b.cad)}
                </div>
              </div>
              {b.fx && (
                <div className="mono" style={{fontSize:11, color:"var(--muted)", fontFamily:"var(--type-mono)"}}>
                  FX snapshot: 1 {b.price.currency} = {b.fx.toFixed(4)} CAD
                </div>
              )}
            </div>
          </div>
          <div className="aside-card">
            <h4>Reference</h4>
            <div className="field-value mono">{b.confirmation || "—"}</div>
          </div>
          <div className="aside-card">
            <h4>Receipt</h4>
            {b.receipt ? (
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <div style={{width:40, height:50, border:"1px solid var(--line)", borderRadius:4, background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"var(--muted)"}}>📄</div>
                <div style={{flex:1, minWidth:0}}>
                  <a style={{fontFamily:"var(--type-mono)", fontSize:12, color:"var(--accent)"}}>{b.id}-receipt.pdf</a>
                  <div style={{fontSize:10, color:"var(--muted)", fontFamily:"var(--type-mono)", marginTop:2}}>284 KB</div>
                </div>
              </div>
            ) : (
              <div className="empty-day" style={{margin:0, padding:12}}>
                — No receipt —
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FORM ───────────────────────────────────────────────────
function BookingForm({ mode, bookingId, prefillDate, onSave, onCancel, onDelete }) {
  const existing = bookingId ? BOOKINGS.find(b => b.id === bookingId) : null;
  const [type, setType] = React.useState(existing?.type || "flight");
  const [fxLoading, setFxLoading] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const [receiptState, setReceiptState] = React.useState(existing?.receipt ? "attached" : "none");
  const [error, setError] = React.useState("");

  const title = mode === "edit" ? `Edit booking` : `New booking`;
  const date0 = prefillDate || existing?.start?.slice(0,10) || "2026-08-01";

  function runFX() {
    setFxLoading(true);
    setTimeout(() => setFxLoading(false), 900);
  }
  function runLocate() {
    setLocating(true);
    setTimeout(() => setLocating(false), 1100);
  }
  function uploadReceipt() {
    setReceiptState("uploading");
    setTimeout(() => setReceiptState("attached"), 1200);
  }

  return (
    <div className="page" style={{maxWidth: 1040}}>
      <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:20}}>
        <button className="btn btn-ghost" onClick={onCancel}>← Cancel</button>
        <span className="page-sub" style={{margin:0}}>/ bookings / {mode === "edit" ? bookingId + " / edit" : "new"}</span>
      </div>

      <div className="page-header">
        <div>
          <div className="page-title">
            {mode === "edit" ? <>Edit <em>booking</em></> : <>New <em>booking</em></>}
          </div>
          <div className="page-sub">Type · Details · Money · Receipt</div>
        </div>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      <div className="form-card">
        <div className="form-section-title">01 · Type</div>
        <div className="type-switcher">
          {Object.keys(TYPE_META).map(t => (
            <button key={t}
              className={`type-pill ${type === t ? "active" : ""}`}
              onClick={() => setType(t)}
            >
              <span className="icon" style={{color: TYPE_META[t].color === "var(--accent)" ? "var(--accent)" : TYPE_META[t].color}}>
                <TypeIcon type={t} size={22}/>
              </span>
              <span className="label">{TYPE_META[t].label}</span>
            </button>
          ))}
        </div>

        <div className="form-section-title">02 · Basics</div>
        <div className="form-grid">
          <div className="field col-4">
            <label className="field-label">Title</label>
            <input className="input" defaultValue={existing?.title || ""} placeholder={
              type === "flight" ? "e.g. AC 888 YUL → CDG"
              : type === "train" ? "e.g. TGV Paris → Barcelona"
              : type === "hotel" ? "e.g. Hôtel du Marais"
              : "e.g. Louvre Museum"
            }/>
          </div>
          <div className="field col-2">
            <label className="field-label">Start</label>
            <input className="input mono" type="datetime-local" defaultValue={`${date0}T09:00`} />
          </div>
          <div className="field col-2">
            <label className="field-label">End (optional)</label>
            <input className="input mono" type="datetime-local" />
          </div>
          <div className="field col-2">
            <label className="field-label">Timezone</label>
            <select className="select">
              <option>Europe/Paris (CEST)</option>
              <option>Europe/Madrid (CEST)</option>
              <option>America/Montreal (EDT)</option>
              <option>UTC</option>
            </select>
          </div>
        </div>

        <div className="form-section-title" style={{marginTop:28}}>03 · {TYPE_META[type].label} details</div>
        <div className="form-grid">
          {/* Location fields */}
          {(type === "flight" || type === "train") ? (
            <>
              <div className="field col-2">
                <label className="field-label">From</label>
                <input className="input" defaultValue={existing?.from?.label || ""} placeholder={type === "flight" ? "YUL Montréal-Trudeau" : "Gare de Lyon, Paris"}/>
                <div style={{display:"flex", gap:8, marginTop:4}}>
                  <button className="btn btn-ghost" style={{fontSize:9, padding:"6px 10px"}} onClick={runLocate} disabled={locating}>
                    {locating ? "Locating…" : "◎ Locate on map"}
                  </button>
                  <span className="field-hint">{existing?.from ? "✓ located" : "lat/lng"}</span>
                </div>
              </div>
              <div className="field col-2">
                <label className="field-label">To</label>
                <input className="input" defaultValue={existing?.to?.label || ""} placeholder={type === "flight" ? "CDG Paris" : "Barcelona Sants"}/>
                <div style={{display:"flex", gap:8, marginTop:4}}>
                  <button className="btn btn-ghost" style={{fontSize:9, padding:"6px 10px"}}>◎ Locate on map</button>
                  <span className="field-hint">{existing?.to ? "✓ located" : "lat/lng"}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="field col-4">
              <label className="field-label">Location</label>
              <input className="input" defaultValue={existing?.from?.label || ""} placeholder={type === "hotel" ? "Hôtel, Paris" : "Musée d'Orsay"}/>
              <div style={{display:"flex", gap:8, marginTop:4}}>
                <button className="btn btn-ghost" style={{fontSize:9, padding:"6px 10px"}} onClick={runLocate} disabled={locating}>
                  {locating ? "Locating…" : "◎ Locate on map"}
                </button>
                <span className="field-hint">{existing?.from ? "✓ located" : "lat/lng"}</span>
              </div>
            </div>
          )}

          {type === "flight" && <>
            <div className="field col-2"><label className="field-label">Airline</label><input className="input" defaultValue={existing?.airline || ""}/></div>
            <div className="field"><label className="field-label">Flight #</label><input className="input mono" defaultValue={existing?.flightNumber || ""} placeholder="AC 888"/></div>
            <div className="field"><label className="field-label">Seat</label><input className="input mono" defaultValue={existing?.seat || ""} placeholder="14A"/></div>
            <div className="field"><label className="field-label">Terminal</label><input className="input mono" defaultValue={existing?.terminal || ""} placeholder="T1"/></div>
          </>}
          {type === "train" && <>
            <div className="field col-2"><label className="field-label">Operator</label><input className="input" defaultValue={existing?.operator || ""}/></div>
            <div className="field"><label className="field-label">Train #</label><input className="input mono" defaultValue={existing?.trainNumber || ""}/></div>
            <div className="field"><label className="field-label">Coach</label><input className="input mono" defaultValue={existing?.coach || ""}/></div>
            <div className="field"><label className="field-label">Seat</label><input className="input mono" defaultValue={existing?.seat || ""}/></div>
          </>}
          {type === "hotel" && <>
            <div className="field col-2"><label className="field-label">Address</label><input className="input" defaultValue={existing?.address || ""}/></div>
            <div className="field col-2"><label className="field-label">Room type</label><input className="input" defaultValue={existing?.roomType || ""}/></div>
          </>}
          {type === "activity" && <>
            <div className="field col-2"><label className="field-label">Venue</label><input className="input" defaultValue={existing?.venue || ""}/></div>
            <div className="field col-2"><label className="field-label">Address</label><input className="input" defaultValue={existing?.address || ""}/></div>
            <div className="field col-4"><label className="field-label">Ticket URL</label><input className="input mono" defaultValue={existing?.ticketUrl || ""} placeholder="https://"/></div>
          </>}
        </div>

        <div className="form-section-title" style={{marginTop:28}}>04 · Money</div>
        <div className="form-grid">
          <div className="field">
            <label className="field-label">Confirmation</label>
            <input className="input mono" defaultValue={existing?.confirmation || ""} placeholder="ABC123"/>
          </div>
          <div className="field">
            <label className="field-label">Price</label>
            <input className="input mono" defaultValue={existing?.price?.amount || ""} placeholder="0.00" onBlur={runFX}/>
          </div>
          <div className="field">
            <label className="field-label">Currency</label>
            <select className="select" defaultValue={existing?.price?.currency || "EUR"} onBlur={runFX}>
              <option>CAD</option><option>EUR</option><option>USD</option><option>GBP</option><option>CHF</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">CAD equivalent</label>
            <input className="input mono" defaultValue={existing?.cad || ""} placeholder="0.00"/>
            <div style={{display:"flex", gap:8, marginTop:4, alignItems:"center"}}>
              <button className="btn btn-ghost" style={{fontSize:9, padding:"6px 10px"}} onClick={runFX} disabled={fxLoading}>
                {fxLoading ? "Fetching…" : "↻ Refresh FX"}
              </button>
              {existing?.fx && <span className="field-hint">1 {existing.price.currency} = {existing.fx.toFixed(4)}</span>}
            </div>
          </div>
          <div className="field col-4">
            <label className="field-label">Notes</label>
            <textarea className="input textarea" defaultValue={existing?.notes || ""} placeholder="Seat preferences, meal options, meeting points…"/>
          </div>
        </div>

        <div className="form-section-title" style={{marginTop:28}}>05 · Receipt</div>
        <div>
          {receiptState === "none" && (
            <label className="empty-day" style={{cursor:"pointer", justifyContent:"center", padding:"20px"}} onClick={uploadReceipt}>
              + UPLOAD RECEIPT (PDF, JPG, PNG, HEIC · max 10 MB)
            </label>
          )}
          {receiptState === "uploading" && (
            <div className="empty-day" style={{justifyContent:"center", padding:"20px"}}>
              Uploading…
            </div>
          )}
          {receiptState === "attached" && (
            <div style={{display:"flex", alignItems:"center", gap:14, padding:"14px 16px", border:"1px solid var(--line)", borderRadius:"var(--r-sm)", background:"var(--bg)"}}>
              <span style={{fontSize:20}}>📄</span>
              <a style={{fontFamily:"var(--type-mono)", fontSize:13, color:"var(--accent)", flex:1}}>
                {existing?.id || "new"}-receipt.pdf
              </a>
              <button className="btn btn-ghost" onClick={() => setReceiptState("none")}>Remove / replace</button>
            </div>
          )}
        </div>

        <div className="action-row">
          <button className="btn btn-primary" onClick={onSave}>{mode === "edit" ? "Save changes" : "Create booking"}</button>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <div className="spacer"/>
          {mode === "edit" && <button className="btn btn-danger" onClick={onDelete}>Delete booking</button>}
        </div>
      </div>
    </div>
  );
}

// ─── UNLOCK ─────────────────────────────────────────────────
function UnlockView({ onUnlock }) {
  const [pwd, setPwd] = React.useState("");
  const [error, setError] = React.useState(false);
  function submit(e) {
    e.preventDefault();
    if (pwd.length < 1) return;
    setError(false);
    onUnlock();
  }
  return (
    <div className="unlock-wrap">
      <div className="unlock-card">
        <div className="unlock-mark">ƒ</div>
        <h2>France + Spain '26</h2>
        <p>Enter passphrase</p>
        <form onSubmit={submit}>
          <input
            type="password"
            autoFocus
            className="input"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            placeholder="••••••••"
          />
          {error && <div style={{color:"var(--danger)", fontSize:11, fontFamily:"var(--type-mono)", marginTop:10, letterSpacing:".1em"}}>INCORRECT PASSPHRASE</div>}
          <button type="submit" className="btn btn-primary btn-lg" style={{width:"100%", justifyContent:"center", marginTop:20}}>
            Unlock
          </button>
        </form>
        <div style={{marginTop:24, fontFamily:"var(--type-mono)", fontSize:9, color:"var(--muted-2)", letterSpacing:".2em"}}>
          PRIVATE · BCRYPT · 30-DAY SESSION
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DetailView, BookingForm, UnlockView });
