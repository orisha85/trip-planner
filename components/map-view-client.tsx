"use client";

import dynamic from "next/dynamic";
import type { MapLine, MapPin } from "@/components/map-view";

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] w-full animate-pulse rounded-md bg-[color:var(--color-bg-elev)]" />
  ),
});

export default function MapViewClient(props: { pins: MapPin[]; lines: MapLine[] }) {
  return <MapView {...props} />;
}
