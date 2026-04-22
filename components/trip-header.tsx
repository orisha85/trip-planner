import Link from "next/link";
import { cookies } from "next/headers";
import { listBookings } from "@/lib/bookings-repo";
import {
  formatMoney,
  HOME_CURRENCY,
  TRIP_END,
  TRIP_START,
  TRIP_TITLE,
} from "@/lib/utils";
import { NavTabs } from "@/components/nav-tabs";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

function tripDayCounter(): { label: string; totalDays: number } {
  const start = new Date(`${TRIP_START}T00:00:00`);
  const end = new Date(`${TRIP_END}T23:59:59`);
  const now = new Date();
  const totalDays =
    Math.round((end.getTime() - start.getTime()) / (24 * 3600 * 1000)) + 1;

  if (now < start) {
    const daysUntil = Math.ceil(
      (start.getTime() - now.getTime()) / (24 * 3600 * 1000),
    );
    return { label: `in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`, totalDays };
  }
  if (now > end) {
    return { label: "Finished", totalDays };
  }
  const dayNum =
    Math.floor((now.getTime() - start.getTime()) / (24 * 3600 * 1000)) + 1;
  return { label: `Day ${dayNum} of ${totalDays}`, totalDays };
}

function formatTripRange(): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  };
  const start = new Date(`${TRIP_START}T12:00:00Z`).toLocaleDateString(
    "en-CA",
    opts,
  );
  const end = new Date(`${TRIP_END}T12:00:00Z`).toLocaleDateString("en-CA", opts);
  return `${start} – ${end}`;
}

export async function TripHeader() {
  // Don't render the header on /unlock — check the cookie.
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const ok = token ? await verifySessionToken(token) : false;
  if (!ok) return null;

  const bookings = await listBookings().catch(() => []);

  let totalCad = 0;
  const perCurrency = new Map<string, number>();
  for (const b of bookings) {
    if (b.priceCad) totalCad += Number(b.priceCad);
    if (b.priceAmount && b.priceCurrency) {
      perCurrency.set(
        b.priceCurrency,
        (perCurrency.get(b.priceCurrency) ?? 0) + Number(b.priceAmount),
      );
    }
  }

  const counter = tripDayCounter();

  return (
    <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]/60 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <Link href="/itinerary" className="text-lg font-semibold">
              {TRIP_TITLE}
            </Link>
            <div className="text-xs text-[color:var(--color-muted)]">
              {formatTripRange()} · {counter.label}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm">
              <span className="text-[color:var(--color-muted)]">Total: </span>
              <span className="font-medium">
                {formatMoney(totalCad, HOME_CURRENCY)}
              </span>
            </div>
            <div className="text-[10px] text-[color:var(--color-muted)]">
              {bookings.length} booking{bookings.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <NavTabs />
        </div>
      </div>
    </header>
  );
}
