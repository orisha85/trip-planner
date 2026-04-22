"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/db/schema";
import {
  Field,
  buttonClass,
  buttonDangerClass,
  buttonGhostClass,
  inputClass,
} from "@/components/ui/field";
import { BOOKING_TYPES, type BookingTypeLiteral } from "@/lib/booking-schema";

type FormState = {
  type: BookingTypeLiteral;
  title: string;
  start_at: string; // datetime-local string
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
  // interpret as local time, convert to ISO
  const d = new Date(v);
  return d.toISOString();
}

const TIMEZONES = [
  { label: "Paris (Europe/Paris)", value: "Europe/Paris" },
  { label: "Madrid (Europe/Madrid)", value: "Europe/Madrid" },
  { label: "Barcelona (Europe/Madrid)", value: "Europe/Madrid" },
  { label: "Montreal (America/Toronto)", value: "America/Toronto" },
  { label: "UTC", value: "UTC" },
];

const CURRENCIES = ["CAD", "EUR", "USD", "GBP", "CHF"];

function blankForm(): FormState {
  return {
    type: "flight",
    title: "",
    start_at: "",
    end_at: "",
    timezone: "Europe/Paris",
    from_location: "",
    to_location: "",
    from_lat: "",
    from_lng: "",
    to_lat: "",
    to_lng: "",
    confirmation_code: "",
    price_amount: "",
    price_currency: "EUR",
    price_cad: "",
    fx_rate: "",
    fx_fetched_at: "",
    details: {},
    notes: "",
    receipt_url: "",
    receipt_filename: "",
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

export function BookingForm({
  initial,
  initialDate,
}: {
  initial?: Booking;
  initialDate?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => {
    if (initial) return bookingToForm(initial);
    const b = blankForm();
    if (initialDate) {
      b.start_at = `${initialDate}T09:00`;
    }
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

  // When currency or amount changes, re-fetch FX rate (on blur via button)
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
      const res = await fetch(
        `/api/fx?from=${form.price_currency}&to=CAD`,
      );
      if (!res.ok) throw new Error("fx failed");
      const json: { rate: number; fetchedAt: string } = await res.json();
      const cad = amt * json.rate;
      set("price_cad", cad.toFixed(2));
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
      if (which === "from") {
        set("from_lat", json.lat.toFixed(6));
        set("from_lng", json.lng.toFixed(6));
      } else {
        set("to_lat", json.lat.toFixed(6));
        set("to_lng", json.lng.toFixed(6));
      }
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
      type: form.type,
      title: form.title,
      start_at: fromDatetimeLocal(form.start_at),
      end_at: form.end_at ? fromDatetimeLocal(form.end_at) : null,
      timezone: form.timezone,
      from_location: form.from_location || null,
      to_location: form.to_location || null,
      from_lat: form.from_lat || null,
      from_lng: form.from_lng || null,
      to_lat: form.to_lat || null,
      to_lng: form.to_lng || null,
      confirmation_code: form.confirmation_code || null,
      price_amount: form.price_amount || null,
      price_currency: form.price_currency || null,
      price_cad: form.price_cad || null,
      fx_rate: form.fx_rate || null,
      fx_fetched_at: form.fx_fetched_at || null,
      details: Object.fromEntries(
        Object.entries(form.details).filter(([, v]) => v !== ""),
      ),
      notes: form.notes || null,
      receipt_url: form.receipt_url || null,
      receipt_filename: form.receipt_filename || null,
    };

    const url = initial ? `/api/bookings/${initial.id}` : "/api/bookings";
    const method = initial ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "save failed" }));
      setError(err.error ?? "save failed");
      return;
    }
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
    if (!res.ok) {
      setError("delete failed");
      return;
    }
    router.push("/itinerary");
    router.refresh();
  }

  // Keep type-dependent defaults sensible
  useEffect(() => {
    if (form.type === "hotel" || form.type === "activity") {
      // no to_* fields needed
      if (form.to_location || form.to_lat) {
        set("to_location", "");
        set("to_lat", "");
        set("to_lng", "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type]);

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Type">
          <select
            className={inputClass}
            value={form.type}
            onChange={(e) => set("type", e.target.value as BookingTypeLiteral)}
          >
            {BOOKING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Title">
          <input
            className={inputClass}
            value={form.title}
            required
            onChange={(e) => set("title", e.target.value)}
            placeholder={titlePlaceholder(form.type)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label={startLabel(form.type)}>
          <input
            type="datetime-local"
            className={inputClass}
            value={form.start_at}
            required
            onChange={(e) => set("start_at", e.target.value)}
          />
        </Field>
        <Field label={endLabel(form.type)}>
          <input
            type="datetime-local"
            className={inputClass}
            value={form.end_at}
            onChange={(e) => set("end_at", e.target.value)}
          />
        </Field>
        <Field label="Timezone">
          <select
            className={inputClass}
            value={form.timezone}
            onChange={(e) => set("timezone", e.target.value)}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.label} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <TypeSpecificFields
        type={form.type}
        details={form.details}
        setDetail={setDetail}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Field
            label={
              form.type === "hotel" || form.type === "activity"
                ? "Location"
                : "From"
            }
          >
            <input
              className={inputClass}
              value={form.from_location}
              onChange={(e) => set("from_location", e.target.value)}
              placeholder={fromPlaceholder(form.type)}
            />
          </Field>
          <div className="flex items-center gap-2 text-xs text-[color:var(--color-muted)]">
            <button
              type="button"
              className={buttonGhostClass}
              onClick={() => geocodeField("from")}
              disabled={geocoding === "from" || !form.from_location}
            >
              {geocoding === "from" ? "Locating…" : "Locate on map"}
            </button>
            {form.from_lat && form.from_lng && (
              <span>
                {Number(form.from_lat).toFixed(3)}, {Number(form.from_lng).toFixed(3)}
              </span>
            )}
          </div>
        </div>

        {(form.type === "flight" || form.type === "train") && (
          <div className="space-y-2">
            <Field label="To">
              <input
                className={inputClass}
                value={form.to_location}
                onChange={(e) => set("to_location", e.target.value)}
                placeholder={toPlaceholder(form.type)}
              />
            </Field>
            <div className="flex items-center gap-2 text-xs text-[color:var(--color-muted)]">
              <button
                type="button"
                className={buttonGhostClass}
                onClick={() => geocodeField("to")}
                disabled={geocoding === "to" || !form.to_location}
              >
                {geocoding === "to" ? "Locating…" : "Locate on map"}
              </button>
              {form.to_lat && form.to_lng && (
                <span>
                  {Number(form.to_lat).toFixed(3)}, {Number(form.to_lng).toFixed(3)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Confirmation code">
          <input
            className={inputClass}
            value={form.confirmation_code}
            onChange={(e) => set("confirmation_code", e.target.value)}
            placeholder="ABC123"
          />
        </Field>
        <Field label="Price">
          <input
            className={inputClass}
            inputMode="decimal"
            value={form.price_amount}
            onChange={(e) => set("price_amount", e.target.value)}
            onBlur={fetchFx}
            placeholder="120.00"
          />
        </Field>
        <Field label="Currency">
          <select
            className={inputClass}
            value={form.price_currency}
            onChange={(e) => {
              set("price_currency", e.target.value);
            }}
            onBlur={fetchFx}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field
          label="Converted to CAD"
          hint={
            form.fx_rate && form.price_currency !== "CAD"
              ? `1 ${form.price_currency} = ${Number(form.fx_rate).toFixed(4)} CAD`
              : undefined
          }
        >
          <input
            className={inputClass}
            inputMode="decimal"
            value={form.price_cad}
            onChange={(e) => set("price_cad", e.target.value)}
            placeholder={fxLoading ? "…" : "auto"}
          />
        </Field>
        <Field label="&nbsp;">
          <button
            type="button"
            className={buttonGhostClass}
            onClick={fetchFx}
            disabled={fxLoading || !form.price_amount}
          >
            {fxLoading ? "Fetching…" : "Refresh FX rate"}
          </button>
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          className={inputClass}
          rows={3}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Seat preferences, breakfast included, meeting point…"
        />
      </Field>

      <div className="space-y-2 rounded-md border border-[color:var(--color-border)] p-4">
        <div className="text-sm text-[color:var(--color-muted)]">Receipt</div>
        {form.receipt_url ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a
              href={form.receipt_url.includes("private.blob.vercel-storage.com")
                ? `/api/blob-proxy?url=${encodeURIComponent(form.receipt_url)}`
                : form.receipt_url}
              target="_blank"
              rel="noreferrer"
              className="text-[color:var(--color-accent)] underline"
            >
              {form.receipt_filename || "View receipt"}
            </a>
            <button
              type="button"
              className={buttonGhostClass}
              onClick={() => {
                set("receipt_url", "");
                set("receipt_filename", "");
              }}
            >
              Remove / replace
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="application/pdf,image/*"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
            className="block text-sm"
          />
        )}
        {uploading && (
          <div className="text-xs text-[color:var(--color-muted)]">Uploading…</div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-[color:var(--color-danger)] bg-[color:var(--color-danger)]/10 px-3 py-2 text-sm text-[color:var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={buttonClass} disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create booking"}
        </button>
        <button
          type="button"
          className={buttonGhostClass}
          onClick={() => router.back()}
        >
          Cancel
        </button>
        {initial && (
          <button
            type="button"
            className={buttonDangerClass + " ml-auto"}
            onClick={remove}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

function titlePlaceholder(t: BookingTypeLiteral) {
  switch (t) {
    case "flight":
      return "AC 888 YUL → CDG";
    case "train":
      return "TGV 6672 Paris → Barcelona";
    case "hotel":
      return "Hotel Le Marais";
    case "activity":
      return "Louvre Museum";
  }
}

function startLabel(t: BookingTypeLiteral) {
  if (t === "hotel") return "Check-in";
  if (t === "activity") return "Starts at";
  return "Departure";
}

function endLabel(t: BookingTypeLiteral) {
  if (t === "hotel") return "Check-out";
  if (t === "activity") return "Ends at (optional)";
  return "Arrival (optional)";
}

function fromPlaceholder(t: BookingTypeLiteral) {
  switch (t) {
    case "flight":
      return "Montreal YUL";
    case "train":
      return "Paris Gare de Lyon";
    case "hotel":
      return "Hotel name or address";
    case "activity":
      return "Venue name or address";
  }
}

function toPlaceholder(t: BookingTypeLiteral) {
  switch (t) {
    case "flight":
      return "Paris CDG";
    case "train":
      return "Barcelona Sants";
    default:
      return "";
  }
}

function TypeSpecificFields({
  type,
  details,
  setDetail,
}: {
  type: BookingTypeLiteral;
  details: Record<string, string>;
  setDetail: (k: string, v: string) => void;
}) {
  if (type === "flight") {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Field label="Airline">
          <input
            className={inputClass}
            value={details.airline ?? ""}
            onChange={(e) => setDetail("airline", e.target.value)}
            placeholder="Air Canada"
          />
        </Field>
        <Field label="Flight #">
          <input
            className={inputClass}
            value={details.flight_number ?? ""}
            onChange={(e) => setDetail("flight_number", e.target.value)}
            placeholder="AC 888"
          />
        </Field>
        <Field label="Seat">
          <input
            className={inputClass}
            value={details.seat ?? ""}
            onChange={(e) => setDetail("seat", e.target.value)}
            placeholder="14A"
          />
        </Field>
        <Field label="Terminal">
          <input
            className={inputClass}
            value={details.terminal ?? ""}
            onChange={(e) => setDetail("terminal", e.target.value)}
            placeholder="T1"
          />
        </Field>
      </div>
    );
  }
  if (type === "train") {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Field label="Operator">
          <input
            className={inputClass}
            value={details.operator ?? ""}
            onChange={(e) => setDetail("operator", e.target.value)}
            placeholder="SNCF"
          />
        </Field>
        <Field label="Train #">
          <input
            className={inputClass}
            value={details.train_number ?? ""}
            onChange={(e) => setDetail("train_number", e.target.value)}
            placeholder="TGV 6672"
          />
        </Field>
        <Field label="Coach">
          <input
            className={inputClass}
            value={details.coach ?? ""}
            onChange={(e) => setDetail("coach", e.target.value)}
            placeholder="12"
          />
        </Field>
        <Field label="Seat">
          <input
            className={inputClass}
            value={details.seat ?? ""}
            onChange={(e) => setDetail("seat", e.target.value)}
            placeholder="44"
          />
        </Field>
      </div>
    );
  }
  if (type === "hotel") {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Address" className="md:col-span-2">
          <input
            className={inputClass}
            value={details.address ?? ""}
            onChange={(e) => setDetail("address", e.target.value)}
            placeholder="12 Rue de Rivoli, Paris"
          />
        </Field>
        <Field label="Room type">
          <input
            className={inputClass}
            value={details.room_type ?? ""}
            onChange={(e) => setDetail("room_type", e.target.value)}
            placeholder="Deluxe King"
          />
        </Field>
      </div>
    );
  }
  // activity
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Field label="Venue">
        <input
          className={inputClass}
          value={details.venue ?? ""}
          onChange={(e) => setDetail("venue", e.target.value)}
          placeholder="Louvre Museum"
        />
      </Field>
      <Field label="Address" className="md:col-span-2">
        <input
          className={inputClass}
          value={details.address ?? ""}
          onChange={(e) => setDetail("address", e.target.value)}
          placeholder="Rue de Rivoli, 75001 Paris"
        />
      </Field>
      <Field label="Ticket URL" className="md:col-span-3">
        <input
          className={inputClass}
          value={details.ticket_url ?? ""}
          onChange={(e) => setDetail("ticket_url", e.target.value)}
          placeholder="https://…"
        />
      </Field>
    </div>
  );
}
