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
      <body className="min-h-screen bg-bg text-fg">
        <TripHeader />
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-4 md:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
