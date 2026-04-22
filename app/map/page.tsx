import { listBookings } from "@/lib/bookings-repo";
import type { MapLine, MapPin } from "@/components/map-view";
import MapViewClient from "@/components/map-view-client";
import { formatInTz } from "@/lib/dates";

export default async function MapPage() {
  const bookings = await listBookings();

  const pins: MapPin[] = [];
  const lines: MapLine[] = [];

  for (const b of bookings) {
    const fromLat = b.fromLat ? Number(b.fromLat) : null;
    const fromLng = b.fromLng ? Number(b.fromLng) : null;
    const toLat = b.toLat ? Number(b.toLat) : null;
    const toLng = b.toLng ? Number(b.toLng) : null;

    if (fromLat && fromLng) {
      pins.push({
        id: b.id,
        type: b.type,
        title: b.title,
        lat: fromLat,
        lng: fromLng,
        subtitle: formatInTz(b.startAt, b.timezone, "EEE MMM d · HH:mm"),
      });
    }
    if (toLat && toLng && fromLat && fromLng && (b.type === "flight" || b.type === "train")) {
      lines.push({
        id: b.id + "-line",
        from: [fromLat, fromLng],
        to: [toLat, toLng],
        type: b.type,
      });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Map</h1>
      {pins.length === 0 ? (
        <div className="rounded-md border border-dashed border-[color:var(--color-border)] p-8 text-center text-sm text-[color:var(--color-muted)]">
          No located bookings yet. Use the &ldquo;Locate on map&rdquo; button on a
          booking to pin it here.
        </div>
      ) : (
        <MapViewClient pins={pins} lines={lines} />
      )}
    </div>
  );
}
