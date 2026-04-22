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
