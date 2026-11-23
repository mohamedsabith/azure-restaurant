import { z } from 'zod';
import { reservationsPage } from '@/content/pages';
import { PARTY_MAX, PARTY_MIN } from './availability';
import { HH_MM, isIsoDate } from './dates';

// This schema also runs in the browser. Zod's JIT probes `new Function`, which the CSP
// (no 'unsafe-eval') reports as a violation; jitless mode avoids eval entirely.
z.config({ jitless: true });

const dietaryIds = reservationsPage.dietaryOptions.map((o) => o.id) as [string, ...string[]];
const occasions = reservationsPage.occasions as unknown as [string, ...string[]];

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Shared by the client form (instant feedback) and the Server Action (authoritative). */
export const reservationSchema = z.object({
  guests: z.coerce
    .number({ error: 'Choose the number of guests.' })
    .int()
    .min(PARTY_MIN, 'Choose the number of guests.')
    .max(PARTY_MAX, `For more than ${PARTY_MAX} guests, please contact us about the private room.`),
  date: z.string({ error: 'Choose a date.' }).refine(isIsoDate, 'Choose a date.'),
  time: z.string({ error: 'Choose a time.' }).regex(HH_MM, 'Choose a time.'),
  name: z
    .string({ error: 'Enter your name.' })
    .trim()
    .min(2, 'Enter your full name.')
    .max(80, 'Name must be 80 characters or fewer.'),
  email: z.email('Enter a valid email address, like name@example.com.').max(254),
  phone: z
    .string({ error: 'Enter a phone number.' })
    .trim()
    .regex(/^\+?[0-9\s().-]+$/, 'Use digits, spaces and an optional leading +.')
    .refine((v) => {
      const digits = v.replace(/\D/g, '').length;
      return digits >= 7 && digits <= 15;
    }, 'Enter a phone number with 7 to 15 digits.'),
  occasion: z
    .enum(occasions)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  dietary: z.array(z.enum(dietaryIds)).max(dietaryIds.length).default([]),
  dietaryNotes: optionalText(300, 'Dietary notes'),
  requests: optionalText(500, 'Special requests'),
  /** Honeypot: humans never see or fill this field. */
  website: z.string().max(0).optional(),
});

export type ReservationInput = z.input<typeof reservationSchema>;
export type ReservationRequest = z.output<typeof reservationSchema>;
export type ReservationField = keyof ReservationRequest;

export function formDataToObject(formData: FormData): Record<string, unknown> {
  return {
    guests: formData.get('guests'),
    date: formData.get('date'),
    time: formData.get('time'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    occasion: formData.get('occasion') ?? undefined,
    dietary: formData.getAll('dietary'),
    dietaryNotes: formData.get('dietaryNotes') ?? undefined,
    requests: formData.get('requests') ?? undefined,
    website: formData.get('website') ?? undefined,
  };
}

export function fieldErrorsFrom(error: z.ZodError): Partial<Record<ReservationField, string>> {
  const out: Partial<Record<ReservationField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as ReservationField | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
