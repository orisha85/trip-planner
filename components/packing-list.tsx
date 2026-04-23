"use client";

import { useState, useTransition } from "react";
import type { PackingItem } from "@/db/schema";

type Section = { name: string; items: PackingItem[] };

function buildSections(items: PackingItem[]): Section[] {
  const order = ["Snacks", "Algo para dormir", "Car seat bag", "Juguetes", "Maleta clear", "Bebé", "Salud & Toiletries", "Varios"];
  const map = new Map<string, PackingItem[]>();
  for (const item of items) {
    if (!map.has(item.section)) map.set(item.section, []);
    map.get(item.section)!.push(item);
  }
  const sorted: Section[] = [];
  for (const name of order) {
    if (map.has(name)) sorted.push({ name, items: map.get(name)! });
  }
  for (const [name, sectionItems] of map) {
    if (!order.includes(name)) sorted.push({ name, items: sectionItems });
  }
  return sorted;
}

async function toggleItem(id: string, checked: boolean) {
  await fetch(`/api/packing/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ checked }),
  });
}

function SectionBlock({ section, onToggle }: { section: Section; onToggle: (id: string, checked: boolean) => void }) {
  const done = section.items.filter((i) => i.checked).length;
  const total = section.items.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="pack-section">
      <div className="pack-section-header">
        <span className="pack-section-name">{section.name}</span>
        <span className="pack-section-count">{done}/{total}</span>
      </div>
      {total > 0 && (
        <div className="pack-progress-bar">
          <div className="pack-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
      <ul className="pack-items">
        {section.items.map((item) => (
          <li key={item.id} className={`pack-item${item.checked ? " checked" : ""}`}>
            <label>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => onToggle(item.id, e.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PackingList({ initial }: { initial: PackingItem[] }) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();

  const totalDone = items.filter((i) => i.checked).length;
  const total = items.length;
  const overallPct = total === 0 ? 0 : Math.round((totalDone / total) * 100);

  function handleToggle(id: string, checked: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked } : i)));
    startTransition(() => {
      toggleItem(id, checked);
    });
  }

  const sections = buildSections(items);

  return (
    <div className="pack-root">
      <div className="pack-overview">
        <div className="pack-overview-bar">
          <div className="pack-overview-fill" style={{ width: `${overallPct}%` }} />
        </div>
        <span className="pack-overview-label">{totalDone} of {total} packed · {overallPct}%</span>
      </div>
      <div className="pack-grid">
        {sections.map((s) => (
          <SectionBlock key={s.name} section={s} onToggle={handleToggle} />
        ))}
      </div>
    </div>
  );
}
