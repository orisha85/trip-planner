import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { TripHeader } from "@/components/trip-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: process.env.TRIP_TITLE ?? "Trip Organizer",
  description: "Personal trip organizer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div aria-hidden className="app-grain" />
        <div className="app-root">
          <TripHeader />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
