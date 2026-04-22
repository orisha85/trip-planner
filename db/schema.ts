import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const bookingType = pgEnum("booking_type", [
  "flight",
  "train",
  "hotel",
  "activity",
]);

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: bookingType("type").notNull(),
  title: text("title").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }),
  timezone: text("timezone").notNull().default("Europe/Paris"),

  fromLocation: text("from_location"),
  toLocation: text("to_location"),
  fromLat: numeric("from_lat", { precision: 9, scale: 6 }),
  fromLng: numeric("from_lng", { precision: 9, scale: 6 }),
  toLat: numeric("to_lat", { precision: 9, scale: 6 }),
  toLng: numeric("to_lng", { precision: 9, scale: 6 }),

  confirmationCode: text("confirmation_code"),

  priceAmount: numeric("price_amount", { precision: 12, scale: 2 }),
  priceCurrency: text("price_currency"),
  priceCad: numeric("price_cad", { precision: 12, scale: 2 }),
  fxRate: numeric("fx_rate", { precision: 14, scale: 6 }),
  fxFetchedAt: timestamp("fx_fetched_at", { withTimezone: true }),

  details: jsonb("details").$type<Record<string, unknown>>().default({}),
  notes: text("notes"),

  receiptUrl: text("receipt_url"),
  receiptFilename: text("receipt_filename"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type BookingType = (typeof bookingType.enumValues)[number];
