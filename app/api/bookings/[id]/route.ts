import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { bookingPatchSchema } from "@/lib/booking-schema";
import {
  deleteBooking,
  getBooking,
  updateBooking,
} from "@/lib/bookings-repo";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const booking = await getBooking(id);
  if (!booking) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(booking);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const existing = await getBooking(id);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = bookingPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // If replacing the receipt, delete the old blob first.
  if (
    parsed.data.receipt_url !== undefined &&
    existing.receiptUrl &&
    existing.receiptUrl !== parsed.data.receipt_url
  ) {
    try {
      await del(existing.receiptUrl);
    } catch {
      // non-fatal — proceed with the update either way
    }
  }

  const updated = await updateBooking(id, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const existing = await getBooking(id);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (existing.receiptUrl) {
    try {
      await del(existing.receiptUrl);
    } catch {
      // non-fatal
    }
  }

  await deleteBooking(id);
  return NextResponse.json({ ok: true });
}
