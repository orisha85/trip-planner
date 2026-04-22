import { BookingForm } from "@/components/booking-form";

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New booking</h1>
      <BookingForm initialDate={date} />
    </div>
  );
}
