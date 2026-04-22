# Handoff: Trip Organizer

## Overview

Trip Organizer is a **single-user, password-protected web app** for planning and tracking a multi-destination international trip. It centralizes flights, trains, hotels, and activities into one timeline, one map, and one CAD-normalized budget. The reference instance covers France + Spain, 2026-07-31 – 2026-08-24, for a traveler based in Montreal.

Primary views:
- **/unlock** — passphrase gate
- **/itinerary** — day-by-day timeline (primary view)
- **/categories** — tabbed tables (flights / trains / hotels / activities)
- **/map** — stylized map with pins and flight/train routes
- **/bookings/[id]** — booking detail
- **/bookings/new** and **/bookings/[id]/edit** — create/edit form

## About the Design Files

The files in this bundle are **design references created in HTML/JSX** — interactive prototypes showing intended look and behavior. They are **not production code to copy directly.**

The task is to **recreate these designs in the target codebase** — per the PRD, that's **Next.js 16 (App Router) + React 19 + Tailwind CSS v4 (CSS-first `@theme`)** — using its established patterns and libraries. Treat the prototype JSX as wireframes-with-pixel-detail, not as shippable code:
- Routing: replace the single-page state machine in `app.jsx` with App Router routes
- Styling: translate `styles.css` custom properties into Tailwind v4 `@theme` tokens + utility classes
- Data: replace the static `BOOKINGS` array with a real database model (Postgres / Prisma or similar) and the bcrypt-gated session described in the PRD
- Components: hand-rolled Tailwind components (the PRD specifies no component library)

## Fidelity

**High-fidelity.** All colors, typography, spacing, radii, shadows, hover states, loading states, and micro-interactions are intentional and final. Match them pixel-perfectly unless the user asks otherwise.

## Visual Language

The design deviates from the original PRD's dark-theme specification. The final direction is a **warm paper-white editorial theme** with:
- Cream / warm-white backgrounds
- Dark ink text
- Persimmon accent (#d85a1c)
- Fraunces serif (italic display) + JetBrains Mono (times, codes, labels) + system-sans for body
- Subtle multiplicative paper-grain overlay
- Micro-details: film/scale markers, compass rose on map, italic accent in display type

## Design Tokens

All exposed as CSS custom properties in `styles.css` — port to Tailwind v4 `@theme`.

### Colors

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#fbf8f2` | Page background |
| `--bg-1` | `#ffffff` | Cards, elevated surfaces |
| `--bg-2` | `#f4efe5` | Hover / secondary surface |
| `--bg-3` | `#eae3d4` | Active cells, tertiary surface |
| `--line` | `#e4ddcd` | Default borders |
| `--line-2` | `#c9c0ad` | Emphasized borders |
| `--ink` | `#1c1a18` | Primary text |
| `--ink-dim` | `#433f3a` | Secondary text |
| `--muted` | `#807a70` | Labels, timestamps, uppercase mono |
| `--muted-2` | `#a9a396` | Tertiary text |
| `--accent` | `#d85a1c` | Links, active tab, primary buttons, highlights |
| `--accent-hi` | `#b94814` | Accent hover |
| `--accent-fg` | `#ffffff` | Text on accent-filled surfaces |
| `--gold` | `#b48420` | Hotel color |
| `--sea` | `#1f8a7a` | Train color |
| `--sky` | `#3d68c4` | Flight color |
| `--danger` | `#c4324a` | Delete, errors |
| `--danger-soft` | `#fce7ea` | Error banner background |

Body background (outside the app root): `#f0ebdf`.

### Typography

Font families (loaded from Google Fonts):
- **`--type-serif`**: `'Fraunces', 'Instrument Serif', Georgia, serif` — display, titles, booking titles, price values, italic accents on display headings
- **`--type-sans`**: `ui-sans-serif, system-ui, …` — body copy, form inputs
- **`--type-mono`**: `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace` — timestamps, timezone abbreviations, confirmation codes, field labels (uppercase), tabs

Type scale (approximate px):
- Display headings (page-title): 44 / Fraunces 400 / -0.025em
- Page title on mobile: 32
- Detail hero h1: 40 (28 mobile)
- Section headings (day-date): 24 / Fraunces 500
- Booking title: 18 / Fraunces 500
- Body default: 14
- Field labels / tabs / badges (mono, uppercase): 9–11 / letter-spacing 0.14–0.22em
- Monospace timestamps on cards: 15

Font features: `"ss01", "ss02", "cv11"`. `-webkit-font-smoothing: antialiased`.

### Radius
- `--r-xs: 4px` — subtle accents
- `--r-sm: 8px` — buttons, inputs
- `--r-md: 12px` — booking rows
- `--r-lg: 18px` — cards, heros
- `--r-xl: 28px` — unused but available

### Shadow
- `--shadow-1: 0 1px 0 rgba(255,255,255,.6) inset, 0 1px 2px rgba(40,30,15,.05)` — subtle depth
- `--shadow-2: 0 24px 60px -20px rgba(60,40,15,.18), 0 10px 20px -10px rgba(40,30,15,.08)` — popovers, modals

### Spacing rhythm
Container padding: `32px 28px` desktop, `20px 18px` mobile. Max content width: `1240px` (up to `1400px` on map).

### Per-booking accent strip

Every booking row has a 3px left-edge stripe colored by type:
- flight → `--sky`
- train → `--sea`
- hotel → `--gold`
- activity → `--accent`

## Screens / Views

### 1. Unlock (`/unlock`)

Full-screen centered card on radial-gradient background (persimmon + cobalt soft glows on paper-white).
- **Card**: 420px max / 44px padding / `--bg-1` / `--r-lg` / `--shadow-2`
- **Mark**: stylized italic `ƒ` glyph, 48px Fraunces italic, `--accent`
- **Heading**: "France + Spain '26", 24px Fraunces 500
- **Subline**: mono 10px / `letter-spacing: .2em` / uppercase / muted — "ENTER PASSPHRASE"
- **Input**: password, center-aligned, `letter-spacing: .4em`, 14px mono
- **Button**: full-width primary, label "Unlock"
- **Footer**: "PRIVATE · BCRYPT · 30-DAY SESSION" — mono 9px / very dim

### 2. App Shell — Header

Sticky header with blur and paper-white gradient.
- **Top row**: brand on left, stats on right
  - **Brand**: 3-line stack — eyebrow mono "TRIP ORGANIZER · PRIVATE" / title "France + Spain **'26**" (Fraunces 30px with italic persimmon year) / dates mono 11px "JUL 31, 2026 — AUG 24, 2026 · 25 DAYS"
  - **Countdown chip**: pill with pulsing persimmon dot, mono 10px "IN N DAYS"
  - **Total**: Fraunces 22px persimmon number + mono "CAD" unit
  - **Bookings**: Fraunces 22px count
- **Tabs row**: flush-left tab list (Itinerary / Categories / Map), 11px mono uppercase, active tab gets a 2px persimmon underline. Right-aligned **+ New Booking** primary button.

### 3. Itinerary (primary view)

- Page title: "The *itinerary*" (Fraunces, italic "itinerary" in persimmon)
- Page sub: mono uppercase "DAY BY DAY · 25 DAYS · 14 BOOKINGS"
- **Day section** for each of the 25 days:
  - **Day header** (dashed underline): "Day 03 / 25" mono persimmon + "Mon Aug 2" Fraunces w/ italic muted weekday
  - **Right side**: "in {city}" (mono 10px muted), **compass/sparkle icon button** that opens suggestions popover, **+ icon** button that opens the new-booking form pre-filled to that date
  - **Booking rows** sorted by start time (see Booking Card below)
  - **Empty day**: dashed-border ghost row "— nothing planned —" with inline "add something" link

### 4. Booking Card (the row)

Flex layout: time / icon / body / meta.
- **Time block**: mono 15px time + 9px uppercase timezone abbr (fixed 72px wide)
- **Icon tile**: 38×38 bordered square, type-colored SVG icon (flight/train/hotel/activity — custom SVGs in `shell.jsx`)
- **Body**: Fraunces 18px title + mono 9px uppercase type kind + mono 11px route ("From → To" for transport, single location for hotel/activity)
- **Meta (right)**: Fraunces 17px price + mono 10px "≈ CA$X" equivalent + mono 10px confirmation code with 📎 emoji if receipt attached
- **Hover**: border becomes `--accent`, background lifts to `--bg-2`, left-stripe intensifies
- **Left stripe**: 3px colored by type

### 5. Suggestions Popover (on itinerary day header)

Click the compass icon next to "in {city}" → absolute-positioned popover below the icon (340px wide, right-aligned).
- **Header**: mono eyebrow "NEARBY · AI PICKS" + Fraunces "Around *{city}*" with italic persimmon city name + close ✕
- **Body**: scrollable list (max 340px). Each row: emoji icon + Fraunces 15px title + mono 10px detail + persimmon-outlined mono uppercase tag (e.g. "LOCAL PICK", "ESSENTIAL", "NEARBY")
- **Footer**: mono "Based on {city}" + persimmon "More ↗"
- Clicking a suggestion opens the new-booking form pre-filled to that day's date.
- City library in `views-main.jsx` → `SUGGESTIONS_BY_CITY` (Paris / Barcelona / Madrid / Seville).

### 6. Categories (tabbed tables)

- Page title "By *category*"
- Tab bar: rounded 2px-inner-padding pill group, 4 tabs each with a type SVG icon + pluralized label + count. Active tab has `--bg-3` background and persimmon count.
- **Table**: bordered card, `--bg-1`, rounded. Mono uppercase 9px headers on `--bg` row; `--bg-2` hover; each data row is a link to detail.
- Columns per type:
  - Flight/Train: Date · Flight|Train # · Route (from-code → to-code) · Seat · Conf · Price (w/ CAD sub)
  - Hotel: Dates (start–end) · Hotel · Address · Room · Conf · Price
  - Activity: Date · Activity · Venue · Time · Conf · Price

### 7. Map (stylized, not Leaflet in the prototype)

The PRD specifies Leaflet + react-leaflet + OSM. The prototype uses a hand-drawn stylized SVG for brand feel. In production, render Leaflet dark/light tiles but keep the **visual language** of the overlay (persimmon arcs, sea-green train lines, gold hotel pins, accent activity pins, Fraunces tooltip labels).

Layout: `1fr 320px` grid — map canvas + pinned-places side panel.
- **Side panel header**: Fraunces "Pinned places" + mono "{N} LOCATED"
- **Side items**: colored dot (by type) + Fraunces label + mono 3-letter type abbr; hover/active fills `--bg-2`/`--bg-3`
- **Canvas overlays**: graticule, stylized landmass silhouettes (`#d9ceb5` with `#b9ad8e` border), 9px mono country labels, 40px italic Fraunces sea names at very low opacity, compass rose (top-right), scale bar (bottom-left "500 KM")
- **Flight**: dashed quadratic arc lifted to 22% of segment distance
- **Train**: solid quadratic line (no lift)
- **Pin markers**: 5px / 7px active, 2px white stroke, active state shows a halo + tooltip rect with Fraunces title

### 8. Booking Detail (`/bookings/[id]`)

Back button + breadcrumb mono path.
- **Hero card**: gradient `--bg-1 → --bg-2`, oversized (240px) watermark emoji bottom-right at 4% opacity, kind badge pill, 40px Fraunces title, mono subtitle with full formatted date range
- **Two-column grid**: left = field grid + action row; right = aside cards (Cost, Reference, Receipt)
- **Field grid**: 2-col on desktop, label (mono 9px uppercase) over value (Fraunces 18px, or mono 14px for codes/URLs). Some fields span both columns (Address, Ticket URL, Notes).
- **Action row**: Save / Cancel / spacer / Delete (danger, right-aligned) — inside its own bordered card on `--bg-1`
- **Cost aside**: Original (currency sym + amount) / divider / CAD equivalent (24px persimmon) / mono FX snapshot line
- **Receipt aside**: 40×50 thumbnail + mono filename link + size, or ghost "— No receipt —"

### 9. Booking Form (`/bookings/new` and `/bookings/[id]/edit`)

Sectioned single-card form with uppercase mono section titles ("01 · Type", "02 · Basics", "03 · {Type} details", "04 · Money", "05 · Receipt").

- **Type switcher**: 4 large buttons in a grid. Inactive = bordered / dim; active = persimmon border + 1px inset box-shadow + soft persimmon bg + persimmon label. Each button is icon (22px SVG) over uppercase mono label.
- **Field grid**: 4-col desktop, 2-col mobile. Span helpers: `col-2 / col-3 / col-4`.
- **Common fields**: Title (col-4) · Start (datetime-local, col-2) · End (col-2) · Timezone (col-2)
- **Type-specific blocks**:
  - **Flight**: Airline (col-2) · Flight# · Seat · Terminal
  - **Train**: Operator (col-2) · Train# · Coach · Seat
  - **Hotel**: Address (col-2) · Room type (col-2)
  - **Activity**: Venue (col-2) · Address (col-2) · Ticket URL (col-4)
  - **From/To** for flights/trains: col-2 each with **◎ Locate on map** ghost button (Nominatim geocoding → lat/lng) and "✓ located" hint
  - **Location** for hotels/activities: col-4 with same Locate button
- **Money block**: Confirmation / Price / Currency / CAD equivalent, with **↻ Refresh FX** ghost button under CAD field. Auto-fetches on blur of Price or Currency. Skip call if currency is CAD.
- **Notes**: col-4 textarea
- **Receipt**: three states
  - `none`: dashed ghost row "+ UPLOAD RECEIPT (PDF, JPG, PNG, HEIC · max 10 MB)"
  - `uploading`: "Uploading…"
  - `attached`: bordered row with 📄 emoji + filename link (persimmon mono) + "Remove / replace" ghost
- **Action row**: Create/Save (primary) · Cancel (ghost) · spacer · Delete (danger, edit only)
- **Error banner**: danger-tinted background + persimmon-red text, shown above form on async failure.

## Interactions & Behavior

### Navigation & state

- Global route state with persistence in `localStorage` under keys `to_route` and `to_book` (so reload restores position during iterative design — optional in production)
- Tab nav in header switches routes
- Clicking a booking card / table row → detail view
- Detail "Edit" → edit form; Detail "Delete" → `confirm()` → back to itinerary (per PRD, native confirm is intentional)
- Form Cancel → back; Save → if editing, back to detail; if creating, back to itinerary
- **Day header "+" button** → new form with that date pre-filled
- **Day header compass icon** → suggestions popover (outside-click closes it); selecting a suggestion → new form for that day
- **Floating lock button** (bottom-right, fixed) → `/unlock`

### Form interactions

- **Type switcher**: changing type swaps the type-specific fields. No page reload; React state.
- **Locate on map**: ghost button enters "Locating…" loading state, runs Nominatim fetch, fills geocoords (prototype uses a 1.1s simulated delay)
- **FX auto-fill**: on blur of Price or Currency fields, fetch rate and fill CAD (prototype uses 0.9s simulated delay). Skip if currency is CAD.
- **Refresh FX**: manual trigger for the same fetch.
- **Receipt upload**: click ghost uploader → "Uploading…" → "attached" row; Remove resets to `none` (prototype simulates with 1.2s delay; production uses Vercel Blob per PRD).
- **Delete**: native `confirm()` then delete.
- **Error banner**: rendered above the form when any async op fails.

### Hover / active states

- Booking rows: border → `--accent`, bg → `--bg-2`
- Table rows: bg → `--bg-2`
- Tabs: muted text → ink on hover; active adds a 2px persimmon underline
- Type switcher: hover darkens border; active gets persimmon border + inset shadow + tint
- Primary button hover: `--accent-hi`
- Ghost button hover: border and text darken

### Animations

Kept deliberately minimal:
- `.15s ease` transitions on color / border / background
- Countdown dot: 2.4s ease-in-out pulse (`@keyframes pulse`)
- Map pin tooltip: instant reveal on hover/active
- No page transitions in the prototype.

### Responsive

- Mobile breakpoint: `md` 768px (per PRD)
- Header collapses to column, stats become a 3-up row (hides booking count at narrowest)
- Booking rows wrap; meta drops to a full-width row under body with a dashed top divider
- Form grid collapses 4-col → 2-col
- Type switcher: 4 → 2 per row
- Detail grid becomes single column; aside falls below
- Map: side panel falls below canvas; canvas capped at 400px height
- Category table becomes horizontal-scroll

The prototype also supports a **`.mobile-mode` modifier class** (triggered from the Tweaks panel) that forces mobile styles independent of viewport, for testing.

## State Management

State variables (prototype, for porting to a server-backed app):

- **Route state**: `route`, `bookingId`, `prefillDate`. Replace with Next.js App Router + URL params.
- **Form state per booking**: type, all field values, receiptState (`none | uploading | attached`), fxLoading, locating, error string
- **Itinerary**: `cityForDay` memo derived from hotel check-in/out windows — each day inherits the city of the most recent active hotel. Keep this derivation on the server or in a selector.
- **Suggestions popover**: `suggestOpen` is the `iso` date of the day whose popover is open (single-at-a-time), closes on outside click
- **Tweaks**: accent preset key, density, viewport, showGrain — purely design-prototype; omit from production

Data fetching (production, per PRD):
- Bookings: server-rendered from DB
- Auth: bcrypt passphrase → JWT cookie, 30-day sessions; middleware gates every route
- FX: live API call, snapshot stored on the booking (never recalculated)
- Geocoding: Nominatim on demand
- Receipts: Vercel Blob

## Data Model (reference)

```ts
type BookingType = "flight" | "train" | "hotel" | "activity";

interface Booking {
  id: string;
  type: BookingType;
  title: string;
  start: string; // ISO datetime
  end?: string;
  tz: string; // IANA timezone
  tzEnd?: string;
  from?: { label: string; lat?: number; lng?: number; code?: string };
  to?:   { label: string; lat?: number; lng?: number; code?: string };
  confirmation?: string;
  price: { amount: number; currency: "CAD" | "EUR" | "USD" | "GBP" | "CHF" };
  cad: number;              // auto-filled, manually overridable
  fx?: number;              // snapshot at time of entry
  receipt?: boolean;        // in prototype; production: file URL + metadata
  notes?: string;

  // flight
  airline?: string; flightNumber?: string; seat?: string; terminal?: string;
  // train
  operator?: string; trainNumber?: string; coach?: string;
  // hotel
  address?: string; roomType?: string;
  // activity
  venue?: string; ticketUrl?: string;
}
```

## Assets

- **Google Fonts**: Fraunces (variable, ital + weight), JetBrains Mono, Instrument Serif. Imported at top of `styles.css`. In production, swap to `next/font/google` for better loading behavior.
- **Icons**: inline SVG in `shell.jsx` (`<TypeIcon>`) for the four booking types. Extract to individual components or an icon set.
- **Emoji** used intentionally as small accents (📎 receipt, 📄 filename, compass/sparkle glyphs in suggestions). Keep or replace with icons consistent with your design system.
- **No raster images.** The map is 100% inline SVG — abstract, not literal geography. In production, use a real Leaflet map and re-style tiles to match this warm-paper palette.
- **Paper grain**: CSS-generated radial-dot pattern, `mix-blend-mode: multiply`, ~5% opacity. Toggleable via Tweaks.

## Files in This Bundle

- **`Trip Organizer.html`** — entry HTML, loads React/Babel + all JSX
- **`styles.css`** — all design tokens + component styles (tokens at top; port to Tailwind v4 `@theme`)
- **`data.jsx`** — `TRIP`, `TYPE_META`, `BOOKINGS` seed data, helpers (`dayList`, `bookingsByDay`, `totalCAD`, `daysUntilTrip`, formatters)
- **`shell.jsx`** — `Header` + `TypeIcon` SVGs
- **`booking-card.jsx`** — `BookingCard` row
- **`views-main.jsx`** — `ItineraryView`, `CategoriesView`, `MapView`, `MapCanvas`, `SuggestPopover`, and the `SUGGESTIONS_BY_CITY` library
- **`views-detail-form.jsx`** — `DetailView`, `BookingForm`, `UnlockView`
- **`app.jsx`** — App root, route state, Tweaks panel, mount

## Notes for the implementer

- The prototype uses a **single-page state machine** instead of real routes. Replace with Next.js App Router segments: `app/itinerary/page.tsx`, `app/categories/page.tsx`, `app/map/page.tsx`, `app/bookings/[id]/page.tsx`, `app/bookings/[id]/edit/page.tsx`, `app/bookings/new/page.tsx`, `app/unlock/page.tsx`. Middleware at the root gates everything except `/unlock`.
- The **Tweaks** floating panel is a design-time affordance (accent color, density, viewport, grain). Remove from production.
- The prototype seeds ~14 placeholder bookings to show density and behavior. These are **not the traveler's real trip** — discard when wiring real data.
- Keep the **warm paper aesthetic** cohesive: if you add surfaces, pick from the `--bg / --bg-1 / --bg-2 / --bg-3` scale; if you add accents, prefer Fraunces italic in persimmon over new hues. The four type-accent colors (sky / sea / gold / persimmon) are the system — don't introduce more.
- Honor mono-uppercase labels as a structural device: they anchor the editorial feel. Never replace with sentence-case sans.
- The map in production (Leaflet) should retain the overlay treatment: dashed arcs for flights, solid lines for trains, colored pins by type, Fraunces tooltips.
