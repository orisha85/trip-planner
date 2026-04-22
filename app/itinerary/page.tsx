import Link from "next/link";
import { listBookings } from "@/lib/bookings-repo";
import { BookingCard } from "@/components/booking-card";
import { dayKeyInTz, dayLabel } from "@/lib/dates";
import { TRIP_START, TRIP_END } from "@/lib/utils";
import { buttonClass, buttonGhostClass } from "@/components/ui/field";

function daysInTrip(): string[] {
  const start = new Date(`${TRIP_START}T00:00:00Z`);
  const end = new Date(`${TRIP_END}T00:00:00Z`);
  const days: string[] = [];
  for (let d = start; d <= end; d = new Date(d.getTime() + 24 * 3600 * 1000)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default async function ItineraryPage() {
  const bookings = await listBookings();

  const byDay = new Map<string, typeof bookings>();
  for (const b of bookings) {
    const key = dayKeyInTz(b.startAt, b.timezone);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(b);
  }

  const allDays = daysInTrip();
  // also include any booking days outside the trip window
  for (const key of byDay.keys()) {
    if (!allDays.includes(key)) allDays.push(key);
  }
  allDays.sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Itinerary</h1>
        <Link href="/bookings/new" className={buttonClass}>
          + Add booking
        </Link>
      </div>

      {bookings.length === 0 && (
        <div className="rounded-md border border-dashed border-[color:var(--color-border)] p-8 text-center text-sm text-[color:var(--color-muted)]">
          No bookings yet. Start by adding your first flight, train, hotel, or activity.
        </div>
      )}

      <div className="space-y-6">
        {allDays.map((key) => {
          const items = byDay.get(key) ?? [];
          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">{dayLabel(key)}</div>
                <Link
                  href={`/bookings/new?date=${key}`}
                  className={buttonGhostClass}
                >
                  + Add
                </Link>
              </div>
              {items.length === 0 ? (
                <div className="rounded-md border border-dashed border-[color:var(--color-border)] px-3 py-4 text-sm text-[color:var(--color-muted)]">
                  Nothing booked.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
