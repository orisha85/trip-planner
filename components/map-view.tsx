"use client";

import { useEffect } from "react";
import Link from "next/link";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
} from "react-leaflet";

export type MapPin = {
  id: string;
  type: "flight" | "train" | "hotel" | "activity";
  title: string;
  lat: number;
  lng: number;
  subtitle?: string;
};

export type MapLine = {
  id: string;
  from: [number, number];
  to: [number, number];
  type: "flight" | "train";
};

function useDefaultIcon() {
  useEffect(() => {
    // Leaflet's default icon URLs break with bundlers. Point them at the CDN.
    const proto = L.Icon.Default.prototype as unknown as {
      _getIconUrl?: () => string;
    };
    delete proto._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);
}

export default function MapView({
  pins,
  lines,
}: {
  pins: MapPin[];
  lines: MapLine[];
}) {
  useDefaultIcon();

  // Center on France + Spain midpoint, or first pin if present
  const center: [number, number] =
    pins[0] ? [pins[0].lat, pins[0].lng] : [43.5, 1.5];
  const zoom = pins.length > 0 ? 5 : 5;

  return (
    <div style={{ height: "100%", width: "100%", overflow: "hidden", borderRadius: "var(--r-lg)" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {lines.map((l) => (
          <Polyline
            key={l.id}
            positions={[l.from, l.to]}
            pathOptions={{
              color: l.type === "flight" ? "#3d68c4" : "#1f8a7a",
              dashArray: l.type === "flight" ? "6 8" : undefined,
              weight: 2.5,
              opacity: 0.8,
            }}
          />
        ))}
        {pins.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <div style={{ fontFamily: "var(--type-serif)", fontSize: 14 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{p.title}</div>
                {p.subtitle && (
                  <div style={{ fontFamily: "var(--type-mono)", fontSize: 10, color: "var(--muted)", marginBottom: 6 }}>{p.subtitle}</div>
                )}
                <Link
                  href={`/bookings/${p.id}`}
                  style={{ fontFamily: "var(--type-mono)", fontSize: 10, color: "var(--accent)", textDecoration: "none", letterSpacing: ".05em" }}
                >
                  Open booking →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
