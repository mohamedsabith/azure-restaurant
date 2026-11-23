'use server';

import { headers } from 'next/headers';
import { clientKey, getRateLimiter } from '@/lib/security/server';
import { getDateStatus, isSlotBookable, restaurantNow, dateStatusMessage } from './availability';
import { getReservationProvider } from './provider';
import { fieldErrorsFrom, formDataToObject, reservationSchema } from './schema';
import type { ReservationFormState } from './types';

const limiter = () => getRateLimiter({ prefix: 'reservation', limit: 5, windowMs: 10 * 60_000 });

/**
 * Server Action behind the reservation form.
 * Built-in protections: encrypted action IDs and Origin/Host CSRF checks (Next.js).
 * Added here: rate limiting, honeypot, schema validation and authoritative
 * availability re-check (the client view may be stale).
 */
export async function submitReservation(
  _previous: ReservationFormState,
  formData: FormData,
): Promise<ReservationFormState> {
  const requestHeaders = await headers();
  const rate = await limiter().limit(clientKey(requestHeaders));
  if (!rate.success) {
    return {
      status: 'error',
      reason: 'rate',
      message: 'Too many booking attempts. Please wait a few minutes and try again.',
      fieldErrors: {},
    };
  }

  const parsed = reservationSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    const fieldErrors = fieldErrorsFrom(parsed.error);
    // A filled honeypot is a bot: answer generically, never reveal the trap.
    if (fieldErrors.website) {
      return {
        status: 'error',
        reason: 'validation',
        message: 'Your request could not be sent.',
        fieldErrors: {},
      };
    }
    return {
      status: 'error',
      reason: 'validation',
      message: 'Please check the highlighted fields.',
      fieldErrors,
    };
  }

  const request = parsed.data;
  const now = restaurantNow();
  const dateStatus = getDateStatus(request.date, now.date);
  if (dateStatus !== 'open') {
    return {
      status: 'error',
      reason: 'validation',
      message: dateStatusMessage[dateStatus],
      fieldErrors: { date: dateStatusMessage[dateStatus] },
    };
  }
  if (!isSlotBookable(request.date, request.time, request.guests, now)) {
    return {
      status: 'error',
      reason: 'slot',
      message: 'That time has just been taken. Please choose another.',
      fieldErrors: { time: 'This time is no longer available.' },
    };
  }

  try {
    const receipt = await getReservationProvider().submit(request);
    return { status: 'success', receipt };
  } catch (error) {
    console.error('[reservations] provider failure', error);
    return {
      status: 'error',
      reason: 'provider',
      message: 'We could not send your request just now. Please try again in a moment.',
      fieldErrors: {},
    };
  }
}
