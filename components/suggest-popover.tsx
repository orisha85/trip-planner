"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Suggestion = { icon: string; title: string; detail: string; tag: string };

export function SuggestTrigger({
  date,
  city,
  suggestions,
}: {
  date: string;
  city: string;
  suggestions: Suggestion[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => setOpen((v) => !v)}
        title={`Suggestions near ${city}`}
        style={{
          padding: 7,
          background: open ? "rgba(216,90,28,.08)" : undefined,
          borderColor: open ? "var(--accent)" : undefined,
          color: open ? "var(--accent)" : undefined,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M16 8l-2.5 5.5L8 16l2.5-5.5L16 8z" fill="currentColor" fillOpacity="0.15" />
        </svg>
      </button>

      {open && (
        <div className="suggest-popover">
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div style={{ fontFamily: "var(--type-mono)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 3 }}>
                Nearby · AI picks
              </div>
              <div style={{ fontFamily: "var(--type-serif)", fontSize: 18, color: "var(--ink)", letterSpacing: "-.01em" }}>
                Around <em style={{ color: "var(--accent)", fontStyle: "italic" }}>{city}</em>
              </div>
            </div>
            <button style={{ cursor: "pointer", color: "var(--muted)", fontSize: 14, background: "none", border: 0 }} onClick={() => setOpen(false)}>✕</button>
          </div>
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {suggestions.map((s, i) => (
              <Link
                key={i}
                href={`/bookings/new?date=${date}`}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex", gap: 12, padding: "12px 16px",
                  borderBottom: i < suggestions.length - 1 ? "1px solid var(--line)" : "none",
                  textDecoration: "none", alignItems: "flex-start",
                  transition: "background .12s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <div style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>{s.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--type-serif)", fontSize: 15, color: "var(--ink)", letterSpacing: "-.005em", marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontFamily: "var(--type-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: ".02em" }}>{s.detail}</div>
                </div>
                <div style={{ fontFamily: "var(--type-mono)", fontSize: 8, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--accent)", padding: "3px 7px", border: "1px solid var(--accent)", borderRadius: 3, whiteSpace: "nowrap", marginTop: 2 }}>
                  {s.tag}
                </div>
              </Link>
            ))}
          </div>
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--line)", fontFamily: "var(--type-mono)", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted-2)" }}>
            Based on {city}
          </div>
        </div>
      )}
    </div>
  );
}
