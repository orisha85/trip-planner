import { NextResponse } from "next/server";
import { bookingInputSchema } from "@/lib/booking-schema";
import { createBooking, listBookings } from "@/lib/bookings-repo";

export const runtime = "nodejs";

export async function GET() {
  const all = await listBookings();
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bookingInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const created = await createBooking(parsed.data);
  return NextResponse.json(created, { status: 201 });
}
