# Trip Organizer — France + Spain 2026

A personal trip organizer built on Next.js + Postgres + Vercel Blob. Tracks flights, trains, hotels, and activities with receipts, costs (auto-converted to CAD), and a map view.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Drizzle ORM + Vercel Postgres / Neon
- Vercel Blob for receipt uploads
- react-leaflet + OpenStreetMap for the map
- bcrypt + signed JWT cookie for the single-password gate
- exchangerate.host for FX snapshots at entry time

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` by copying the example and filling in values:
   ```bash
   cp .env.example .env.local
   ```

   Generate the password hash (pick your own password):
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
   ```

   Generate the session secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Create a Postgres database. Locally you can use Docker:
   ```bash
   docker run --name trip-pg -e POSTGRES_PASSWORD=pg -p 5432:5432 -d postgres:16
   ```
   Then set `POSTGRES_URL="postgresql://postgres:pg@localhost:5432/postgres"` in `.env.local`.

4. Push the schema to the database:
   ```bash
   npm run db:push
   ```

5. Run the dev server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 → you'll be redirected to `/unlock`. Enter the password. You should then land on the itinerary.

## Deploying to Vercel

1. Push this repo to GitHub (or similar) and import it in Vercel.
2. In the Vercel project:
   - **Storage → Add Postgres** (Neon). This auto-populates `POSTGRES_URL`.
   - **Storage → Add Blob**. This auto-populates `BLOB_READ_WRITE_TOKEN`.
3. Add environment variables in **Settings → Environment Variables** (production + preview):
   - `APP_PASSWORD_HASH` (bcrypt hash — see above)
   - `SESSION_SECRET` (32-byte hex — see above)
   - `TRIP_TITLE="France + Spain 2026"`
   - `TRIP_START="2026-07-31"`
   - `TRIP_END="2026-08-24"`
   - `HOME_CURRENCY="CAD"`
4. Deploy. The first deploy will pick up everything.
5. After the first deploy, push the schema into the production DB:
   ```bash
   POSTGRES_URL="<copy from Vercel>" npm run db:push
   ```
   (You only need to do this once, and again if you change `db/schema.ts`.)

## Usage

- **/itinerary** — day-by-day timeline. Each day has a quick "+ Add" that pre-fills the date.
- **/categories** — tabbed tables (Flights, Trains, Hotels, Activities).
- **/map** — pins for hotels/activities; dashed/solid lines for flights/trains with both endpoints located.
- **Bookings**:
  - Required: type, title, start time, timezone.
  - Optional: end time, from/to locations, confirmation code, price (with currency), notes, receipt.
  - **Locate on map**: click the button next to `From` or `To` to geocode the typed address via OpenStreetMap Nominatim and fill coordinates.
  - **Receipt**: upload any PDF/JPG/PNG/HEIC up to 10 MB. Stored in Vercel Blob. Removing/replacing the receipt deletes the old blob.
  - **FX**: enter price in any currency. Click **Refresh FX rate** (or just tab off the currency field) to fetch today's rate from exchangerate.host and fill the CAD amount. You can also type the CAD amount manually (e.g. from your credit card statement) — it's stored as a snapshot and never recalculated.

## Notes

- Middleware gates every route except `/unlock` and `/api/unlock`. The session cookie lasts 30 days.
- The home currency and trip dates are env-var driven, so you can reuse this app for another trip without code changes.
- The Leaflet marker icons are loaded from the unpkg CDN because bundlers break the default icon paths.
- Nominatim is rate-limited — the "Locate on map" button only fires on click, not on every keystroke.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run db:push` | Push `db/schema.ts` to the database |
| `npm run db:generate` | Generate a SQL migration for the current schema |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio to browse data |
