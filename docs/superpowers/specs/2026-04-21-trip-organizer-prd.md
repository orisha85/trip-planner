# Product Requirements Document — Trip Organizer

**Version:** 1.0  
**Date:** 2026-04-21  
**Purpose:** Feature context for design system generation

---

## 1. Product Overview

Trip Organizer is a personal, password-protected web app for planning and tracking a multi-destination international trip. The initial instance covers France + Spain, July 31 – August 24, 2026, for a traveler based in Montreal, Canada.

The app is intentionally single-user — there is no accounts system, just a bcrypt-hashed password that gates all routes. It lives at a private Vercel URL.

The home currency is CAD. All prices can be entered in any currency and are auto-converted to CAD at the time of entry using a live FX rate snapshot.

---

## 2. Users

| User | Description |
|---|---|
| Trip owner | The sole authenticated user. Manages all bookings, views the itinerary, uploads receipts, and checks the map. |
| (no other users) | The app is not shared or multi-tenant. |

---

## 3. Core Domain: Bookings

A **booking** is any trip element with a time and a type. All four types share the same database record and form — they differ only in which detail fields are shown and how they appear on the map and itinerary.

### 3.1 Booking Types

| Type | Icon | Description |
|---|---|---|
| Flight | ✈ | Air travel leg. Has From/To airports, airline, flight number, seat, terminal. Shows as a dashed arc on the map. |
| Train | 🚆 | Rail leg. Has From/To stations, operator, train number, coach, seat. Shows as a solid line on the map. |
| Hotel | 🏨 | Accommodation. Has a single location (no To), address, room type. Shows as a pin on the map. |
| Activity | 🎟 | Excursion, museum, tour, restaurant, etc. Has a single location, venue, address, optional ticket URL. Shows as a pin on the map. |

### 3.2 Common Booking Fields

Every booking has:

- **Type** — one of the four types above
- **Title** — free text (e.g., "AC 888 YUL → CDG", "Hotel Le Marais", "Louvre Museum")
- **Start time** — required; departure time for transport, check-in for hotels, start time for activities
- **End time** — optional; arrival for transport, check-out for hotels, end time for activities
- **Timezone** — dropdown (Paris, Madrid/Barcelona, Montreal, UTC)
- **From location** — required for flights/trains; single location for hotels/activities
- **To location** — flights and trains only
- **Geocoordinates** — lat/lng for From and/or To, filled via "Locate on map" button (Nominatim geocoding)
- **Confirmation code** — booking reference (e.g., "ABC123")
- **Price** — amount + currency dropdown (CAD, EUR, USD, GBP, CHF)
- **CAD equivalent** — auto-filled by FX lookup; can be overridden manually
- **FX rate snapshot** — stored at time of entry; never recalculated automatically
- **Notes** — free-text field (seat preferences, meal options, meeting points, etc.)
- **Receipt** — file upload (PDF, JPG, PNG, HEIC, up to 10 MB); stored in Vercel Blob

### 3.3 Type-Specific Detail Fields

**Flight:**
- Airline, Flight number, Seat, Terminal

**Train:**
- Operator, Train number, Coach, Seat

**Hotel:**
- Address (spans 2 cols), Room type

**Activity:**
- Venue, Address (spans 2 cols), Ticket URL (full width)

---

## 4. Views / Pages

### 4.1 /itinerary — Day-by-Day Timeline

The primary view. Displays all bookings grouped by calendar date in chronological order.

- Each day has a section header with the date and day number (e.g., "Day 3 — Thu Aug 2")
- Each day header has a quick **"+ Add"** button that pre-fills the booking form with that day's date
- Bookings within a day are rendered as **BookingCards** sorted by start time
- The view covers the full trip window (Jul 31 – Aug 24); days with no bookings show as empty sections

### 4.2 /categories — Tabbed Tables

Four tabs: **Flights**, **Trains**, **Hotels**, **Activities**.

Each tab shows a table of bookings of that type, with columns relevant to the type (dates, route or location, price, confirmation code). Links to each booking's detail page.

### 4.3 /map — Interactive Map

An OpenStreetMap/Leaflet map showing all geolocated bookings.

- **Hotels and activities** render as pin markers
- **Flights** render as dashed arcs between From and To coordinates
- **Trains** render as solid lines between From and To coordinates
- Clicking a marker or line opens a popup with the booking title and a link to its detail page
- The map is client-side only (no SSR for Leaflet)

### 4.4 /bookings/[id] — Booking Detail

Full read view of a single booking. Shows all fields, links to receipt, and provides Edit and Delete actions.

### 4.5 /bookings/new — Create Booking

The booking form in create mode. Accessible from the itinerary "+ Add" buttons and a global "+ New booking" nav action.

### 4.6 /bookings/[id]/edit — Edit Booking

The same booking form in edit mode, pre-filled with existing data.

### 4.7 /unlock — Password Gate

Single-field password form. On success, sets a 30-day signed JWT session cookie and redirects to /itinerary. Every other route redirects here if the cookie is missing or invalid.

---

## 5. Navigation

A persistent top header is shown on all authenticated pages:

- **Trip title** (e.g., "France + Spain 2026") — links to /itinerary
- **Trip date range** (e.g., "Jul 31, 2026 – Aug 24, 2026")
- **Countdown / progress** — shows "in N days" before the trip, "Day X of Y" during, "Finished" after
- **Total cost** in CAD across all bookings
- **Booking count** (e.g., "14 bookings")
- **Tab nav**: Itinerary · Categories · Map

---

## 6. Booking Card (List Item)

Used in the itinerary and anywhere a compact booking summary is needed.

- Type icon (emoji)
- Start time in 24h format + timezone abbreviation
- Title (truncated if long)
- From → To route (for flights/trains) or single location (hotels/activities)
- Price in original currency + CAD equivalent
- Confirmation code (monospace)
- Receipt indicator (📎) if a receipt is attached
- Entire card is a link to the booking detail page
- Hover state highlights the card border in accent color

---

## 7. Forms & Interactions

### Booking Form

- Responsive grid layout: 1 col on mobile, 2–4 cols on desktop depending on section
- **Type selector** at the top controls which detail fields appear (flight/train/hotel/activity)
- **"Locate on map"** button — on click, geocodes the typed location text via Nominatim and fills lat/lng coordinates. Shows a loading state ("Locating…"). Disabled if the location field is empty.
- **FX auto-fill** — when the user tabs off the Price or Currency fields, automatically fetches the current rate and fills the CAD field. A **"Refresh FX rate"** button triggers the same fetch manually. Shows loading state ("Fetching…"). If price currency is CAD, skips the API call.
- **Receipt upload** — file input appears when no receipt is attached. Once a receipt is uploaded, it shows the filename as a link and a "Remove / replace" ghost button. Uploading shows "Uploading…" state.
- **Error banner** — inline error message below the form fields when any async operation fails.
- **Action row** — Save/Create button (primary), Cancel (ghost), Delete (danger, edit mode only, right-aligned)

### Confirmation / Destructive Actions

- Delete booking uses a native `confirm()` dialog

---

## 8. Current Visual Design Language

The app uses a **dark theme** with a purple accent.

### Color Tokens (Tailwind v4 `@theme`)

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#0b0b0f` | Page background |
| `--color-bg-elev` | `#141419` | Cards, header, elevated surfaces |
| `--color-border` | `#23232b` | Borders on cards, inputs |
| `--color-fg` | `#eeeef2` | Primary text |
| `--color-muted` | `#9494a0` | Secondary text, labels, timestamps |
| `--color-accent` | `#7c7cff` | Links, hover states, active tab indicator |
| `--color-accent-fg` | `#ffffff` | Text on accent-colored backgrounds |
| `--color-danger` | `#ff5c6c` | Delete button, error states |

### Typography

- System UI font stack (ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans)
- `-webkit-font-smoothing: antialiased`
- Monospace used for times, timezone abbreviations, confirmation codes

### Component Patterns

- **Cards**: `rounded-md border border-border bg-bg-elev p-3`; hover transitions to accent border
- **Inputs / Selects**: shared `inputClass` — dark background, border, rounded, full-width
- **Buttons**:
  - Primary: accent background (`#7c7cff`) + white text
  - Ghost: transparent with muted text; used for secondary actions and inline controls
  - Danger: danger color (`#ff5c6c`); used only for delete
- **Field wrapper**: label above input, optional hint text below
- **Error state**: red-bordered, red-tinted panel with danger-colored text

---

## 9. Technology Constraints for Design System

| Constraint | Detail |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4 (CSS-first config via `@theme` in `globals.css`) |
| Component approach | No component library — all UI is hand-rolled with Tailwind utilities |
| Dark mode | Dark-only; no light mode toggle |
| Responsive | Mobile-first; breakpoint is `md` (768 px) for grid expansions |
| Map | react-leaflet + OpenStreetMap; Leaflet CSS loaded globally |
| Fonts | System font stack only — no web font loading |

---

## 10. Out of Scope

- Multi-user / sharing
- Light mode
- Push notifications or reminders
- Offline support / PWA
- Native mobile app
- Budget forecasting or analytics beyond total CAD spend
