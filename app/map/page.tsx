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
        id: b.id, type: b.type, title: b.title,
        lat: fromLat, lng: fromLng,
        subtitle: formatInTz(b.startAt, b.timezone, "EEE MMM d · HH:mm"),
      });
    }
    if (toLat && toLng && fromLat && fromLng && (b.type === "flight" || b.type === "train")) {
      lines.push({ id: b.id + "-line", from: [fromLat, fromLng], to: [toLat, toLng], type: b.type });
    }
  }

  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      <div className="page-header">
        <div>
          <div className="page-title">The <em>map</em></div>
          <div className="page-sub">{pins.length} Pins · {lines.length} Routes</div>
        </div>
      </div>

      {pins.length === 0 ? (
        <div className="empty-day" style={{ justifyContent: "center", padding: 24 }}>
          No located bookings yet. Use &ldquo;Locate on map&rdquo; on a booking form to pin it here.
        </div>
      ) : (
        <div className="map-layout">
          <div className="map-canvas">
            <MapViewClient pins={pins} lines={lines} />
          </div>
          <div className="map-side">
            <div className="map-side-head">
              <h3>Pinned places</h3>
              <p>{pins.length} Located</p>
            </div>
            <div className="map-side-list">
              {pins.map((p) => (
                <div key={p.id} className="map-side-item">
                  <div className="dot" style={{
                    background: p.type === "flight" ? "var(--sky)"
                      : p.type === "train" ? "var(--sea)"
                      : p.type === "hotel" ? "var(--gold)"
                      : "var(--accent)",
                  }} />
                  <div className="label">{p.title}</div>
                  <div className="kind">{p.type.slice(0, 3)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
