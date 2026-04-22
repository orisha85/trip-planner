"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/db/schema";
import { BOOKING_TYPES, type BookingTypeLiteral } from "@/lib/booking-schema";
import { TypeIcon } from "@/components/type-icon";

type FormState = {
  type: BookingTypeLiteral;
  title: string;
  start_at: string;
  end_at: string;
  timezone: string;
  from_location: string;
  to_location: string;
  from_lat: string;
  from_lng: string;
  to_lat: string;
  to_lng: string;
  confirmation_code: string;
  price_amount: string;
  price_currency: string;
  price_cad: string;
  fx_rate: string;
  fx_fetched_at: string;
  details: Record<string, string>;
  notes: string;
  receipt_url: string;
  receipt_filename: string;
};

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(v: string): string | null {
  if (!v) return null;
  return new Date(v).toISOString();
}

const TIMEZONES = [
  { label: "Paris (Europe/Paris)", value: "Europe/Paris" },
  { label: "Madrid (Europe/Madrid)", value: "Europe/Madrid" },
  { label: "Montreal (America/Toronto)", value: "America/Toronto" },
  { label: "UTC", value: "UTC" },
];

const CURRENCIES = ["CAD", "EUR", "USD", "GBP", "CHF"];

const TYPE_LABELS: Record<string, string> = {
  flight: "Flight", train: "Train", hotel: "Hotel", activity: "Activity",
};

function blankForm(): FormState {
  return {
    type: "flight", title: "", start_at: "", end_at: "",
    timezone: "Europe/Paris", from_location: "", to_location: "",
    from_lat: "", from_lng: "", to_lat: "", to_lng: "",
    confirmation_code: "", price_amount: "", price_currency: "EUR",
    price_cad: "", fx_rate: "", fx_fetched_at: "",
    details: {}, notes: "", receipt_url: "", receipt_filename: "",
  };
}

function bookingToForm(b: Booking): FormState {
  return {
    type: b.type,
    title: b.title,
    start_at: toDatetimeLocal(b.startAt as unknown as string),
    end_at: toDatetimeLocal(b.endAt as unknown as string | null),
    timezone: b.timezone,
    from_location: b.fromLocation ?? "",
    to_location: b.toLocation ?? "",
    from_lat: b.fromLat ?? "",
    from_lng: b.fromLng ?? "",
    to_lat: b.toLat ?? "",
    to_lng: b.toLng ?? "",
    confirmation_code: b.confirmationCode ?? "",
    price_amount: b.priceAmount ?? "",
    price_currency: b.priceCurrency ?? "EUR",
    price_cad: b.priceCad ?? "",
    fx_rate: b.fxRate ?? "",
    fx_fetched_at: b.fxFetchedAt ? new Date(b.fxFetchedAt).toISOString() : "",
    details: Object.fromEntries(
      Object.entries((b.details as Record<string, unknown>) ?? {}).map(
        ([k, v]) => [k, v == null ? "" : String(v)],
      ),
    ),
    notes: b.notes ?? "",
    receipt_url: b.receiptUrl ?? "",
    receipt_filename: b.receiptFilename ?? "",
  };
}

function titlePlaceholder(t: BookingTypeLiteral) {
  switch (t) {
    case "flight": return "AC 888 YUL → CDG";
    case "train": return "TGV 6672 Paris → Barcelona";
    case "hotel": return "Hôtel du Marais";
    case "activity": return "Louvre Museum";
  }
}

function startLabel(t: BookingTypeLiteral) {
  if (t === "hotel") return "Check-in";
  if (t === "activity") return "Starts";
  return "Departure";
}

function endLabel(t: BookingTypeLiteral) {
  if (t === "hotel") return "Check-out";
  if (t === "activity") return "Ends (optional)";
  return "Arrival (optional)";
}

export function BookingForm({ initial, initialDate }: { initial?: Booking; initialDate?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => {
    if (initial) return bookingToForm(initial);
    const b = blankForm();
    if (initialDate) b.start_at = `${initialDate}T09:00`;
    return b;
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fxLoading, setFxLoading] = useState(false);
  const [geocoding, setGeocoding] = useState<"from" | "to" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function setDetail(key: string, value: string) {
    setForm((f) => ({ ...f, details: { ...f.details, [key]: value } }));
  }

  useEffect(() => {
    if (form.type === "hotel" || form.type === "activity") {
      if (form.to_location || form.to_lat) {
        set("to_location", "");
        set("to_lat", "");
        set("to_lng", "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type]);

  async function fetchFx() {
    const amt = Number(form.price_amount);
    if (!Number.isFinite(amt) || !form.price_currency) return;
    if (form.price_currency === "CAD") {
      set("price_cad", form.price_amount);
      set("fx_rate", "1");
      set("fx_fetched_at", new Date().toISOString());
      return;
    }
    setFxLoading(true);
    try {
      const res = await fetch(`/api/fx?from=${form.price_currency}&to=CAD`);
      if (!res.ok) throw new Error("fx failed");
      const json: { rate: number; fetchedAt: string } = await res.json();
      set("price_cad", (amt * json.rate).toFixed(2));
      set("fx_rate", String(json.rate));
      set("fx_fetched_at", json.fetchedAt);
    } catch {
      setError("Couldn't fetch exchange rate — enter CAD manually.");
    } finally {
      setFxLoading(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "upload failed" }));
        throw new Error(err.error ?? "upload failed");
      }
      const json: { url: string; filename: string } = await res.json();
      set("receipt_url", json.url);
      set("receipt_filename", json.filename);
    } catch (e) {
      setError(e instanceof Error ? e.message : "upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function geocodeField(which: "from" | "to") {
    const q = which === "from" ? form.from_location : form.to_location;
    if (!q.trim()) return;
    setGeocoding(which);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("no match");
      const json: { lat: number; lng: number } = await res.json();
      if (which === "from") { set("from_lat", json.lat.toFixed(6)); set("from_lng", json.lng.toFixed(6)); }
      else { set("to_lat", json.lat.toFixed(6)); set("to_lng", json.lng.toFixed(6)); }
    } catch {
      setError(`Couldn't find "${q}" on the map.`);
    } finally {
      setGeocoding(null);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      type: form.type, title: form.title,
      start_at: fromDatetimeLocal(form.start_at),
      end_at: form.end_at ? fromDatetimeLocal(form.end_at) : null,
      timezone: form.timezone,
      from_location: form.from_location || null,
      to_location: form.to_location || null,
      from_lat: form.from_lat || null, from_lng: form.from_lng || null,
      to_lat: form.to_lat || null, to_lng: form.to_lng || null,
      confirmation_code: form.confirmation_code || null,
      price_amount: form.price_amount || null,
      price_currency: form.price_currency || null,
      price_cad: form.price_cad || null,
      fx_rate: form.fx_rate || null, fx_fetched_at: form.fx_fetched_at || null,
      details: Object.fromEntries(Object.entries(form.details).filter(([, v]) => v !== "")),
      notes: form.notes || null,
      receipt_url: form.receipt_url || null,
      receipt_filename: form.receipt_filename || null,
    };
    const url = initial ? `/api/bookings/${initial.id}` : "/api/bookings";
    const method = initial ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) { const err = await res.json().catch(() => ({ error: "save failed" })); setError(err.error ?? "save failed"); return; }
    const saved: { id: string } = await res.json();
    router.push(`/bookings/${saved.id}`);
    router.refresh();
  }

  async function remove() {
    if (!initial) return;
    if (!confirm("Delete this booking?")) return;
    setSaving(true);
    const res = await fetch(`/api/bookings/${initial.id}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) { setError("delete failed"); return; }
    router.push("/itinerary");
    router.refresh();
  }

  const isEdit = !!initial;

  return (
    <div className="page" style={{ maxWidth: 1040, paddingTop: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>← Cancel</button>
        <span className="page-sub" style={{ margin: 0 }}>
          / bookings / {isEdit ? `${initial!.id} / edit` : "new"}
        </span>
      </div>

      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-title">{isEdit ? <>Edit <em>booking</em></> : <>New <em>booking</em></>}</div>
          <div className="page-sub">Type · Details · Money · Receipt</div>
        </div>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      <form onSubmit={submit}>
        <div className="form-card">
          <div className="form-section-title">01 · Type</div>
          <div className="type-switcher">
            {BOOKING_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`type-pill${form.type === t ? " active" : ""}`}
                onClick={() => set("type", t)}
              >
                <span className="tp-icon" style={{ color: form.type === t ? "var(--accent)" : "var(--ink-dim)" }}>
                  <TypeIcon type={t} size={22} />
                </span>
                <span className="tp-label">{TYPE_LABELS[t]}</span>
              </button>
            ))}
          </div>

          <div className="form-section-title">02 · Basics</div>
          <div className="form-grid">
            <div className="field-wrap col-4">
              <label className="field-label">Title</label>
              <input className="field-input" value={form.title} required onChange={(e) => set("title", e.target.value)} placeholder={titlePlaceholder(form.type)} />
            </div>
            <div className="field-wrap col-2">
              <label className="field-label">{startLabel(form.type)}</label>
              <input type="datetime-local" className="field-input mono" value={form.start_at} required onChange={(e) => set("start_at", e.target.value)} />
            </div>
            <div className="field-wrap col-2">
              <label className="field-label">{endLabel(form.type)}</label>
              <input type="datetime-local" className="field-input mono" value={form.end_at} onChange={(e) => set("end_at", e.target.value)} />
            </div>
            <div className="field-wrap col-2">
              <label className="field-label">Timezone</label>
              <select className="field-select" value={form.timezone} onChange={(e) => set("timezone", e.target.value)}>
                {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-section-title" style={{ marginTop: 28 }}>03 · {TYPE_LABELS[form.type]} details</div>
          <div className="form-grid">
            {(form.type === "flight" || form.type === "train") ? (
              <>
                <div className="field-wrap col-2">
                  <label className="field-label">From</label>
                  <input className="field-input" value={form.from_location} onChange={(e) => set("from_location", e.target.value)} placeholder={form.type === "flight" ? "YUL Montréal-Trudeau" : "Paris Gare de Lyon"} />
                  <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                    <button type="button" className="btn btn-ghost" style={{ fontSize: 9, padding: "6px 10px" }} onClick={() => geocodeField("from")} disabled={geocoding === "from" || !form.from_location}>
                      {geocoding === "from" ? "Locating…" : "◎ Locate on map"}
                    </button>
                    {form.from_lat && <span className="field-hint">✓ located</span>}
                  </div>
                </div>
                <div className="field-wrap col-2">
                  <label className="field-label">To</label>
                  <input className="field-input" value={form.to_location} onChange={(e) => set("to_location", e.target.value)} placeholder={form.type === "flight" ? "CDG Paris" : "Barcelona Sants"} />
                  <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                    <button type="button" className="btn btn-ghost" style={{ fontSize: 9, padding: "6px 10px" }} onClick={() => geocodeField("to")} disabled={geocoding === "to" || !form.to_location}>
                      {geocoding === "to" ? "Locating…" : "◎ Locate on map"}
                    </button>
                    {form.to_lat && <span className="field-hint">✓ located</span>}
                  </div>
                </div>
              </>
            ) : (
              <div className="field-wrap col-4">
                <label className="field-label">Location</label>
                <input className="field-input" value={form.from_location} onChange={(e) => set("from_location", e.target.value)} placeholder={form.type === "hotel" ? "Hôtel, Paris" : "Venue name or address"} />
                <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 9, padding: "6px 10px" }} onClick={() => geocodeField("from")} disabled={geocoding === "from" || !form.from_location}>
                    {geocoding === "from" ? "Locating…" : "◎ Locate on map"}
                  </button>
                  {form.from_lat && <span className="field-hint">✓ located</span>}
                </div>
              </div>
            )}

            {form.type === "flight" && <>
              <div className="field-wrap col-2"><label className="field-label">Airline</label><input className="field-input" value={form.details.airline ?? ""} onChange={(e) => setDetail("airline", e.target.value)} placeholder="Air France" /></div>
              <div className="field-wrap"><label className="field-label">Flight #</label><input className="field-input mono" value={form.details.flight_number ?? ""} onChange={(e) => setDetail("flight_number", e.target.value)} placeholder="AF 357" /></div>
              <div className="field-wrap"><label className="field-label">Seat</label><input className="field-input mono" value={form.details.seat ?? ""} onChange={(e) => setDetail("seat", e.target.value)} placeholder="14A" /></div>
              <div className="field-wrap"><label className="field-label">Terminal</label><input className="field-input mono" value={form.details.terminal ?? ""} onChange={(e) => setDetail("terminal", e.target.value)} placeholder="T1" /></div>
            </>}
            {form.type === "train" && <>
              <div className="field-wrap col-2"><label className="field-label">Operator</label><input className="field-input" value={form.details.operator ?? ""} onChange={(e) => setDetail("operator", e.target.value)} placeholder="Renfe" /></div>
              <div className="field-wrap"><label className="field-label">Train #</label><input className="field-input mono" value={form.details.train_number ?? ""} onChange={(e) => setDetail("train_number", e.target.value)} /></div>
              <div className="field-wrap"><label className="field-label">Coach</label><input className="field-input mono" value={form.details.coach ?? ""} onChange={(e) => setDetail("coach", e.target.value)} /></div>
              <div className="field-wrap"><label className="field-label">Seat</label><input className="field-input mono" value={form.details.seat ?? ""} onChange={(e) => setDetail("seat", e.target.value)} /></div>
            </>}
            {form.type === "hotel" && <>
              <div className="field-wrap col-2"><label className="field-label">Address</label><input className="field-input" value={form.details.address ?? ""} onChange={(e) => setDetail("address", e.target.value)} placeholder="12 Rue de Rivoli, Paris" /></div>
              <div className="field-wrap col-2"><label className="field-label">Room type</label><input className="field-input" value={form.details.room_type ?? ""} onChange={(e) => setDetail("room_type", e.target.value)} placeholder="Deluxe King" /></div>
            </>}
            {form.type === "activity" && <>
              <div className="field-wrap col-2"><label className="field-label">Venue</label><input className="field-input" value={form.details.venue ?? ""} onChange={(e) => setDetail("venue", e.target.value)} placeholder="Louvre Museum" /></div>
              <div className="field-wrap col-2"><label className="field-label">Address</label><input className="field-input" value={form.details.address ?? ""} onChange={(e) => setDetail("address", e.target.value)} placeholder="Rue de Rivoli, 75001 Paris" /></div>
              <div className="field-wrap col-4"><label className="field-label">Ticket URL</label><input className="field-input mono" value={form.details.ticket_url ?? ""} onChange={(e) => setDetail("ticket_url", e.target.value)} placeholder="https://" /></div>
            </>}
          </div>

          <div className="form-section-title" style={{ marginTop: 28 }}>04 · Money</div>
          <div className="form-grid">
            <div className="field-wrap">
              <label className="field-label">Confirmation</label>
              <input className="field-input mono" value={form.confirmation_code} onChange={(e) => set("confirmation_code", e.target.value)} placeholder="ABC123" />
            </div>
            <div className="field-wrap">
              <label className="field-label">Price</label>
              <input className="field-input mono" inputMode="decimal" value={form.price_amount} onChange={(e) => set("price_amount", e.target.value)} onBlur={fetchFx} placeholder="0.00" />
            </div>
            <div className="field-wrap">
              <label className="field-label">Currency</label>
              <select className="field-select" value={form.price_currency} onChange={(e) => set("price_currency", e.target.value)} onBlur={fetchFx}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field-wrap">
              <label className="field-label">CAD equivalent</label>
              <input className="field-input mono" inputMode="decimal" value={form.price_cad} onChange={(e) => set("price_cad", e.target.value)} placeholder={fxLoading ? "Fetching…" : "auto"} />
              <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                <button type="button" className="btn btn-ghost" style={{ fontSize: 9, padding: "6px 10px" }} onClick={fetchFx} disabled={fxLoading || !form.price_amount}>
                  {fxLoading ? "Fetching…" : "↻ Refresh FX"}
                </button>
                {form.fx_rate && form.price_currency !== "CAD" && (
                  <span className="field-hint">1 {form.price_currency} = {Number(form.fx_rate).toFixed(4)}</span>
                )}
              </div>
            </div>
            <div className="field-wrap col-4">
              <label className="field-label">Notes</label>
              <textarea className="field-input field-textarea" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Seat preferences, meal options, meeting points…" />
            </div>
          </div>

          <div className="form-section-title" style={{ marginTop: 28 }}>05 · Receipt</div>
          {form.receipt_url ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--bg)" }}>
              <span style={{ fontSize: 20 }}>📄</span>
              <a
                href={form.receipt_url.includes("private.blob.vercel-storage.com")
                  ? `/api/blob-proxy?url=${encodeURIComponent(form.receipt_url)}`
                  : form.receipt_url}
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: "var(--type-mono)", fontSize: 13, color: "var(--accent)", flex: 1, wordBreak: "break-all" }}
              >
                {form.receipt_filename || "View receipt"}
              </a>
              <button type="button" className="btn btn-ghost" onClick={() => { set("receipt_url", ""); set("receipt_filename", ""); }}>
                Remove / replace
              </button>
            </div>
          ) : uploading ? (
            <div className="empty-day" style={{ justifyContent: "center", padding: 20 }}>Uploading…</div>
          ) : (
            <label className="empty-day" style={{ cursor: "pointer", justifyContent: "center", padding: 20 }}>
              <span>+ UPLOAD RECEIPT (PDF, JPG, PNG, HEIC · max 10 MB)</span>
              <input type="file" accept="application/pdf,image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
            </label>
          )}

          <div className="action-row">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create booking"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
            <div className="spacer" />
            {isEdit && (
              <button type="button" className="btn btn-danger" onClick={remove}>Delete booking</button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
