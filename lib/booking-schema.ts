import { z } from "zod";

export const BOOKING_TYPES = ["flight", "train", "hotel", "activity"] as const;
export type BookingTypeLiteral = (typeof BOOKING_TYPES)[number];

const flightDetails = z.object({
  airline: z.string().optional(),
  flight_number: z.string().optional(),
  seat: z.string().optional(),
  terminal: z.string().optional(),
});

const trainDetails = z.object({
  operator: z.string().optional(),
  train_number: z.string().optional(),
  coach: z.string().optional(),
  seat: z.string().optional(),
});

const hotelDetails = z.object({
  address: z.string().optional(),
  room_type: z.string().optional(),
  guests: z.coerce.number().int().min(1).max(20).optional(),
});

const activityDetails = z.object({
  venue: z.string().optional(),
  address: z.string().optional(),
  ticket_url: z.string().url().or(z.literal("")).optional(),
});

export const detailsSchemaByType = {
  flight: flightDetails,
  train: trainDetails,
  hotel: hotelDetails,
  activity: activityDetails,
};

const isoDatetime = z
  .string()
  .min(1)
  .refine((v) => !Number.isNaN(Date.parse(v)), "must be a valid date-time");

const decimalString = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/u, "must be a decimal number")
  .or(z.number().transform((n) => String(n)));

export const bookingInputSchema = z.object({
  type: z.enum(BOOKING_TYPES),
  title: z.string().min(1).max(200),
  start_at: isoDatetime,
  end_at: isoDatetime.nullable().optional(),
  timezone: z.string().min(1).default("Europe/Paris"),

  from_location: z.string().nullable().optional(),
  to_location: z.string().nullable().optional(),
  from_lat: decimalString.nullable().optional(),
  from_lng: decimalString.nullable().optional(),
  to_lat: decimalString.nullable().optional(),
  to_lng: decimalString.nullable().optional(),

  confirmation_code: z.string().nullable().optional(),

  price_amount: decimalString.nullable().optional(),
  price_currency: z
    .string()
    .transform((s) => s.toUpperCase())
    .pipe(z.string().length(3))
    .nullable()
    .optional(),
  price_cad: decimalString.nullable().optional(),
  fx_rate: decimalString.nullable().optional(),
  fx_fetched_at: isoDatetime.nullable().optional(),

  details: z.record(z.string(), z.unknown()).default({}),
  notes: z.string().nullable().optional(),

  receipt_url: z.string().url().nullable().optional(),
  receipt_filename: z.string().nullable().optional(),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

export const bookingPatchSchema = bookingInputSchema.partial();
