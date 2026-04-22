import Link from "next/link";
import { listBookings } from "@/lib/bookings-repo";
import { BookingCard } from "@/components/booking-card";
import { SuggestTrigger } from "@/components/suggest-popover";
import { dayKeyInTz } from "@/lib/dates";
import { TRIP_START, TRIP_END } from "@/lib/utils";
import type { Booking } from "@/db/schema";

const SUGGESTIONS_BY_CITY: Record<string, { icon: string; title: string; detail: string; tag: string }[]> = {
  Paris: [
    { icon: "🎟", title: "Sainte-Chapelle", detail: "15 min walk · €13 · opens 9:00", tag: "underrated" },
    { icon: "🥐", title: "Du Pain et des Idées", detail: "Classic boulangerie · 2.1 km", tag: "local pick" },
    { icon: "🎨", title: "Musée de l'Orangerie", detail: "Monet's Water Lilies · €12.50", tag: "nearby" },
    { icon: "🌳", title: "Coulée verte René-Dumont", detail: "Elevated walk · free", tag: "quiet" },
    { icon: "🍷", title: "Le Verre Volé", detail: "Natural-wine bistro · book ahead", tag: "dinner" },
  ],
  Barcelona: [
    { icon: "🎟", title: "Palau de la Música", detail: "Guided tour · €22", tag: "stunning" },
    { icon: "🍤", title: "Bar Cañete", detail: "Classic tapas · La Rambla", tag: "local pick" },
    { icon: "🌊", title: "Barceloneta beach walk", detail: "2 km promenade · free", tag: "chill" },
    { icon: "🎨", title: "Fundació Joan Miró", detail: "On Montjuïc · €14", tag: "nearby" },
    { icon: "🥘", title: "Quimet & Quimet", detail: "Iconic montaditos · ~€20", tag: "lunch" },
  ],
  Madrid: [
    { icon: "🎟", title: "Reina Sofía", detail: "Guernica · €12 · 20 min walk", tag: "essential" },
    { icon: "🍷", title: "Casa Alberto", detail: "Historic tavern, 1827 · dinner", tag: "local pick" },
    { icon: "🌳", title: "Retiro Park", detail: "Crystal Palace · 5 min walk", tag: "nearby" },
    { icon: "🥐", title: "San Ginés chocolatería", detail: "Churros since 1894 · late-night", tag: "tradition" },
    { icon: "🎨", title: "Thyssen-Bornemisza", detail: "Cross the street from Prado · €13", tag: "nearby" },
  ],
  Granada: [
    { icon: "🎟", title: "Real Alcázar", detail: "Book online · €14.50", tag: "essential" },
    { icon: "💃", title: "Flamenco show", detail: "Intimate venue · €22", tag: "evening" },
    { icon: "🥘", title: "Tapas in Albaicín", detail: "Traditional neighbourhood", tag: "local pick" },
    { icon: "🌳", title: "Plaza Nueva", detail: "Sunset stroll · free", tag: "photogenic" },
  ],
  Málaga: [
    { icon: "🎨", title: "Museo Picasso", detail: "Birthplace of Picasso · €12", tag: "essential" },
    { icon: "🏖", title: "Playa de la Malagueta", detail: "City beach · free", tag: "chill" },
    { icon: "🍷", title: "El Pimpi bodega", detail: "Historic wine bar · no res needed", tag: "local pick" },
  ],
};

function getSuggestions(city: string | null) {
  if (!city) return [];
  for (const key of Object.keys(SUGGESTIONS_BY_CITY)) {
    if (city.toLowerCase().includes(key.toLowerCase())) return SUGGESTIONS_BY_CITY[key];
  }
  return [];
}

function daysInTrip(): string[] {
  const start = new Date(`${TRIP_START}T00:00:00Z`);
  const end = new Date(`${TRIP_END}T00:00:00Z`);
  const days: string[] = [];
  for (let d = start; d <= end; d = new Date(d.getTime() + 24 * 3600 * 1000)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function cityForDay(iso: string, hotels: Booking[]): string | null {
  let city: string | null = null;
  for (const h of hotels) {
    const start = new Date(h.startAt).toISOString().slice(0, 10);
    const end = h.endAt ? new Date(h.endAt).toISOString().slice(0, 10) : null;
    if (start <= iso && end && end > iso) {
      city = h.fromLocation?.split(",").pop()?.trim() ?? h.title;
    }
  }
  return city;
}

function parseDayKey(key: string): { idx: number; wk: string; mo: string; day: number } {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const start = new Date(`${TRIP_START}T12:00:00Z`);
  const idx = Math.round((dt.getTime() - start.getTime()) / (24 * 3600 * 1000)) + 1;
  const wk = dt.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  const mo = dt.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return { idx, wk, mo, day: d };
}

const TOTAL_DAYS =
  Math.round(
    (new Date(`${TRIP_END}T00:00:00Z`).getTime() - new Date(`${TRIP_START}T00:00:00Z`).getTime()) /
    (24 * 3600 * 1000),
  ) + 1;

export default async function ItineraryPage() {
  const bookings = await listBookings();
  const hotels = bookings.filter((b) => b.type === "hotel");

  const byDay = new Map<string, typeof bookings>();
  for (const b of bookings) {
    const key = dayKeyInTz(b.startAt, b.timezone);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(b);
  }

  const allDays = daysInTrip();
  for (const key of byDay.keys()) {
    if (!allDays.includes(key)) allDays.push(key);
  }
  allDays.sort();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Mia <em>Itinerary</em></div>
          <div className="page-sub">Day by Day · {TOTAL_DAYS} Days · {bookings.length} Bookings</div>
        </div>
      </div>

      {allDays.map((key) => {
        const items = byDay.get(key) ?? [];
        const { idx, wk, mo, day } = parseDayKey(key);
        const city = cityForDay(key, hotels);
        const suggestions = getSuggestions(city);

        return (
          <section key={key} className="day-section">
            <div className="day-header">
              <div className="day-marker">
                <span className="day-num">Day {String(idx).padStart(2, "0")} / {TOTAL_DAYS}</span>
                <span className="day-date">
                  <span className="weekday">{wk} </span>
                  {mo} {day}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                {city && <span className="day-meta">in {city}</span>}
                {city && suggestions.length > 0 && (
                  <SuggestTrigger date={key} city={city} suggestions={suggestions} />
                )}
                <Link href={`/bookings/new?date=${key}`} className="btn btn-ghost btn-icon" title="Add booking this day">
                  +
                </Link>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="empty-day">
                <span>— nothing planned —</span>
                <Link href={`/bookings/new?date=${key}`} className="add-link">add something</Link>
              </div>
            ) : (
              items.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </section>
        );
      })}
    </div>
  );
}
