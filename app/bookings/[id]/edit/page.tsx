import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { getBooking } from "@/lib/bookings-repo";

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBooking(id);
  if (!booking) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit booking</h1>
      <BookingForm initial={booking} />
    </div>
  );
}
