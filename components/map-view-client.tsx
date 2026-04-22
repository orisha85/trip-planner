"use client";

import dynamic from "next/dynamic";
import type { MapLine, MapPin } from "@/components/map-view";

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", width: "100%", background: "var(--bg-2)", borderRadius: "var(--r-lg)" }} />
  ),
});

export default function MapViewClient(props: { pins: MapPin[]; lines: MapLine[] }) {
  return <MapView {...props} />;
}
