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
    <nav className="flex gap-1">
      {TABS.map((t) => {
        const active = path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-md px-3 py-1 text-sm transition ${
              active
                ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                : "text-[color:var(--color-muted)] hover:bg-[color:var(--color-bg-elev)] hover:text-[color:var(--color-fg)]"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
