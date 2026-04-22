import Link from "next/link";
import { cookies } from "next/headers";
import { listBookings } from "@/lib/bookings-repo";
import { formatMoney, HOME_CURRENCY, TRIP_END, TRIP_START } from "@/lib/utils";
import { NavTabs } from "@/components/nav-tabs";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

function daysUntil(): number {
  const start = new Date(`${TRIP_START}T00:00:00`);
  const now = new Date();
  return Math.ceil((start.getTime() - now.getTime()) / (24 * 3600 * 1000));
}

function tripDates(): string {
  const fmt = (iso: string) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
    }).toUpperCase();
  const totalDays =
    Math.round(
      (new Date(`${TRIP_END}T00:00:00`).getTime() - new Date(`${TRIP_START}T00:00:00`).getTime()) /
      (24 * 3600 * 1000),
    ) + 1;
  return `${fmt(TRIP_START)} — ${fmt(TRIP_END)} · ${totalDays} DAYS`;
}

export async function TripHeader() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const ok = token ? await verifySessionToken(token) : false;
  if (!ok) return null;

  const bookings = await listBookings().catch(() => []);
  let totalCad = 0;
  for (const b of bookings) {
    if (b.priceCad) totalCad += Number(b.priceCad);
  }

  const d = daysUntil();
  const countdownLabel = d > 0 ? `IN ${d} DAY${d === 1 ? "" : "S"}` : d === 0 ? "TODAY" : "UNDERWAY";

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand">
          <div className="eyebrow">Trip Organizer · Private</div>
          <Link href="/itinerary" style={{ textDecoration: "none" }}>
            <div className="title">
              France + Spain <em>&apos;26</em>
            </div>
          </Link>
          <div className="dates">{tripDates()}</div>
        </div>

        <div className="header-stats">
          <div className="countdown-chip">
            <span className="dot" />
            {countdownLabel}
          </div>
          <div className="stat">
            <div className="label">Total</div>
            <div className="value accent">
              {new Intl.NumberFormat("en-CA", { style: "currency", currency: HOME_CURRENCY, maximumFractionDigits: 0 }).format(totalCad)}
              <span className="unit">{HOME_CURRENCY}</span>
            </div>
          </div>
          <div className="stat stat-count">
            <div className="label">Bookings</div>
            <div className="value">{bookings.length}</div>
          </div>
        </div>
      </div>

      <div className="header-tabs">
        <NavTabs />
        <Link href="/bookings/new" className="btn btn-primary btn-lg">
          + New Booking
        </Link>
      </div>
    </header>
  );
}
