import { BookingForm } from "@/components/booking-form";

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  return <BookingForm initialDate={date} />;
}
