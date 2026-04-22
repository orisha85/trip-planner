import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookings, type Booking, type NewBooking } from "@/db/schema";
import type { BookingInput } from "./booking-schema";

function toRow(input: Partial<BookingInput>): Partial<NewBooking> {
  const row: Partial<NewBooking> = {};
  if (input.type !== undefined) row.type = input.type;
  if (input.title !== undefined) row.title = input.title;
  if (input.start_at !== undefined) row.startAt = new Date(input.start_at);
  if (input.end_at !== undefined)
    row.endAt = input.end_at ? new Date(input.end_at) : null;
  if (input.timezone !== undefined) row.timezone = input.timezone;
  if (input.from_location !== undefined) row.fromLocation = input.from_location ?? null;
  if (input.to_location !== undefined) row.toLocation = input.to_location ?? null;
  if (input.from_lat !== undefined) row.fromLat = input.from_lat ?? null;
  if (input.from_lng !== undefined) row.fromLng = input.from_lng ?? null;
  if (input.to_lat !== undefined) row.toLat = input.to_lat ?? null;
  if (input.to_lng !== undefined) row.toLng = input.to_lng ?? null;
  if (input.confirmation_code !== undefined)
    row.confirmationCode = input.confirmation_code ?? null;
  if (input.price_amount !== undefined) row.priceAmount = input.price_amount ?? null;
  if (input.price_currency !== undefined)
    row.priceCurrency = input.price_currency ?? null;
  if (input.price_cad !== undefined) row.priceCad = input.price_cad ?? null;
  if (input.fx_rate !== undefined) row.fxRate = input.fx_rate ?? null;
  if (input.fx_fetched_at !== undefined)
    row.fxFetchedAt = input.fx_fetched_at ? new Date(input.fx_fetched_at) : null;
  if (input.details !== undefined) row.details = input.details;
  if (input.notes !== undefined) row.notes = input.notes ?? null;
  if (input.receipt_url !== undefined) row.receiptUrl = input.receipt_url ?? null;
  if (input.receipt_filename !== undefined)
    row.receiptFilename = input.receipt_filename ?? null;
  return row;
}

export async function listBookings(): Promise<Booking[]> {
  return db.select().from(bookings).orderBy(asc(bookings.startAt));
}

export async function getBooking(id: string): Promise<Booking | undefined> {
  const rows = await db.select().from(bookings).where(eq(bookings.id, id));
  return rows[0];
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  const row = toRow(input) as NewBooking;
  const [created] = await db.insert(bookings).values(row).returning();
  return created;
}

export async function updateBooking(
  id: string,
  patch: Partial<BookingInput>,
): Promise<Booking | undefined> {
  const row = toRow(patch);
  row.updatedAt = new Date();
  const [updated] = await db
    .update(bookings)
    .set(row)
    .where(eq(bookings.id, id))
    .returning();
  return updated;
}

export async function deleteBooking(id: string): Promise<Booking | undefined> {
  const [deleted] = await db
    .delete(bookings)
    .where(eq(bookings.id, id))
    .returning();
  return deleted;
}
