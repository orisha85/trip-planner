"use client";

import { useRef, useState, useTransition } from "react";
import type { PackingItem } from "@/db/schema";

type Section = { name: string; items: PackingItem[]; isNew?: boolean };

const SECTION_ORDER = ["Snacks", "Algo para dormir", "Car seat bag", "Juguetes", "Maleta clear", "Bebé", "Salud & Toiletries", "Varios"];

function buildSections(items: PackingItem[], extras: Section[] = []): Section[] {
  const map = new Map<string, PackingItem[]>();
  for (const item of items) {
    if (!map.has(item.section)) map.set(item.section, []);
    map.get(item.section)!.push(item);
  }
  const result: Section[] = [];
  for (const name of SECTION_ORDER) {
    if (map.has(name)) result.push({ name, items: map.get(name)! });
  }
  for (const [name, sectionItems] of map) {
    if (!SECTION_ORDER.includes(name)) result.push({ name, items: sectionItems });
  }
  for (const extra of extras) {
    if (!result.find((s) => s.name === extra.name)) result.push(extra);
  }
  return result;
}

// ── API helpers ──────────────────────────────────────────────────────────────

async function apiToggle(id: string, checked: boolean) {
  await fetch(`/api/packing/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checked }) });
}
async function apiUpdateLabel(id: string, label: string) {
  await fetch(`/api/packing/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label }) });
}
async function apiDeleteItem(id: string) {
  await fetch(`/api/packing/${id}`, { method: "DELETE" });
}
async function apiAddItem(section: string, label: string): Promise<PackingItem> {
  const res = await fetch("/api/packing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section, label }) });
  return res.json();
}
async function apiRenameSection(from: string, to: string) {
  await fetch("/api/packing/sections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from, to }) });
}
async function apiDeleteSection(name: string) {
  await fetch(`/api/packing/sections?name=${encodeURIComponent(name)}`, { method: "DELETE" });
}

// ── Section card ─────────────────────────────────────────────────────────────

interface SectionProps {
  section: Section;
  onToggle: (id: string, checked: boolean) => void;
  onDeleteItem: (id: string) => void;
  onSaveItemLabel: (id: string, label: string) => void;
  onAddItem: (section: string, label: string) => Promise<void>;
  onRenameSection: (oldName: string, newName: string) => Promise<void>;
  onDeleteSection: (name: string) => void;
}

function SectionBlock({ section, onToggle, onDeleteItem, onSaveItemLabel, onAddItem, onRenameSection, onDeleteSection }: SectionProps) {
  const done = section.items.filter((i) => i.checked).length;
  const total = section.items.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState("");
  const [editingName, setEditingName] = useState(section.isNew ?? false);
  const [nameDraft, setNameDraft] = useState(section.isNew ? "" : section.name);
  const [addingItem, setAddingItem] = useState(false);
  const [addDraft, setAddDraft] = useState("");
  const [, startTransition] = useTransition();
  const addInputRef = useRef<HTMLInputElement>(null);

  function startEditItem(item: PackingItem) {
    setEditingId(item.id);
    setItemDraft(item.label);
  }

  function saveItemLabel() {
    if (!editingId) return;
    const trimmed = itemDraft.trim();
    if (trimmed) onSaveItemLabel(editingId, trimmed);
    setEditingId(null);
  }

  function cancelEditItem() { setEditingId(null); }

  async function saveSectionName() {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === section.name) { setEditingName(false); return; }
    await onRenameSection(section.name, trimmed);
    setEditingName(false);
  }

  function cancelSectionName() {
    if (section.isNew) return; // handled by parent
    setNameDraft(section.name);
    setEditingName(false);
  }

  async function commitAddItem() {
    const trimmed = addDraft.trim();
    if (!trimmed) { setAddingItem(false); setAddDraft(""); return; }
    await onAddItem(section.name, trimmed);
    setAddDraft("");
    addInputRef.current?.focus();
  }

  return (
    <div className="pack-section">
      <div className="pack-section-header">
        {editingName ? (
          <input
            className="pack-name-input"
            value={nameDraft}
            autoFocus
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={saveSectionName}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveSectionName(); } if (e.key === "Escape") cancelSectionName(); }}
            placeholder="Section name"
          />
        ) : (
          <button className="pack-section-name" onClick={() => { setEditingName(true); setNameDraft(section.name); }}>
            {section.name}
          </button>
        )}
        <div className="pack-section-actions">
          <span className="pack-section-count">{done}/{total}</span>
          <button className="pack-delete-btn" title="Delete section" onClick={() => onDeleteSection(section.name)}>✕</button>
        </div>
      </div>

      {total > 0 && (
        <div className="pack-progress-bar">
          <div className="pack-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      )}

      <ul className="pack-items">
        {section.items.map((item) => (
          <li key={item.id} className={`pack-item${item.checked ? " checked" : ""}`}>
            {editingId === item.id ? (
              <input
                className="pack-edit-input"
                autoFocus
                value={itemDraft}
                onChange={(e) => setItemDraft(e.target.value)}
                onBlur={saveItemLabel}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveItemLabel(); } if (e.key === "Escape") cancelEditItem(); }}
              />
            ) : (
              <label className="pack-item-row">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => { startTransition(() => { apiToggle(item.id, e.target.checked); }); onToggle(item.id, e.target.checked); }}
                />
                <span onDoubleClick={() => startEditItem(item)}>{item.label}</span>
                <button className="pack-delete-btn item-delete" title="Delete item" onClick={() => onDeleteItem(item.id)}>✕</button>
              </label>
            )}
          </li>
        ))}
      </ul>

      {addingItem ? (
        <div className="pack-add-row">
          <input
            ref={addInputRef}
            className="pack-edit-input"
            autoFocus
            value={addDraft}
            placeholder="Item name…"
            onChange={(e) => setAddDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitAddItem(); } if (e.key === "Escape") { setAddingItem(false); setAddDraft(""); } }}
          />
          <button className="pack-add-confirm" onClick={commitAddItem}>Add</button>
          <button className="pack-delete-btn" onClick={() => { setAddingItem(false); setAddDraft(""); }}>✕</button>
        </div>
      ) : (
        <button className="pack-add-item-btn" onClick={() => setAddingItem(true)}>+ Add item</button>
      )}
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

export function PackingList({ initial }: { initial: PackingItem[] }) {
  const [items, setItems] = useState(initial);
  const [newSections, setNewSections] = useState<Section[]>([]);
  const [addingSectionDraft, setAddingSectionDraft] = useState("");
  const [showNewSection, setShowNewSection] = useState(false);

  const totalDone = items.filter((i) => i.checked).length;
  const total = items.length;
  const overallPct = total === 0 ? 0 : Math.round((totalDone / total) * 100);

  const sections = buildSections(items, newSections);

  function handleToggle(id: string, checked: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked } : i)));
  }

  function handleDeleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    apiDeleteItem(id);
  }

  function handleSaveItemLabel(id: string, label: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, label } : i)));
    apiUpdateLabel(id, label);
  }

  async function handleAddItem(section: string, label: string) {
    const created = await apiAddItem(section, label);
    setItems((prev) => [...prev, created]);
    setNewSections((prev) => prev.filter((s) => s.name !== section));
  }

  async function handleRenameSection(oldName: string, newName: string) {
    setItems((prev) => prev.map((i) => (i.section === oldName ? { ...i, section: newName } : i)));
    setNewSections((prev) => prev.map((s) => (s.name === oldName ? { ...s, name: newName } : s)));
    await apiRenameSection(oldName, newName);
  }

  function handleDeleteSection(name: string) {
    setItems((prev) => prev.filter((i) => i.section !== name));
    setNewSections((prev) => prev.filter((s) => s.name !== name));
    apiDeleteSection(name);
  }

  function commitNewSection() {
    const name = addingSectionDraft.trim();
    if (!name || sections.find((s) => s.name === name)) return;
    setNewSections((prev) => [...prev, { name, items: [], isNew: true }]);
    setAddingSectionDraft("");
    setShowNewSection(false);
  }

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
          <SectionBlock
            key={s.name}
            section={s}
            onToggle={handleToggle}
            onDeleteItem={handleDeleteItem}
            onSaveItemLabel={handleSaveItemLabel}
            onAddItem={handleAddItem}
            onRenameSection={handleRenameSection}
            onDeleteSection={handleDeleteSection}
          />
        ))}

        {showNewSection ? (
          <div className="pack-section pack-new-section">
            <input
              className="pack-name-input"
              autoFocus
              value={addingSectionDraft}
              placeholder="Section name…"
              onChange={(e) => setAddingSectionDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitNewSection(); } if (e.key === "Escape") { setShowNewSection(false); setAddingSectionDraft(""); } }}
            />
            <div className="pack-new-section-actions">
              <button className="pack-add-confirm" onClick={commitNewSection}>Create</button>
              <button className="pack-delete-btn" onClick={() => { setShowNewSection(false); setAddingSectionDraft(""); }}>✕</button>
            </div>
          </div>
        ) : (
          <button className="pack-add-section-btn" onClick={() => setShowNewSection(true)}>
            <span>+</span> New section
          </button>
        )}
      </div>
    </div>
  );
}
