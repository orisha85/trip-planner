"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/itinerary", label: "Itinerary" },
  { href: "/categories", label: "Categories" },
  { href: "/map", label: "Map" },
];

export function NavTabs() {
  const path = usePathname() ?? "";
  return (
    <div className="tab-list">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`tab${path.startsWith(t.href) ? " active" : ""}`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
