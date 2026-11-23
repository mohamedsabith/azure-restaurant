import { type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  PARTY_MAX,
  PARTY_MIN,
  dateStatusMessage,
  getDateStatus,
  getSlots,
  restaurantNow,
} from '@/lib/reservations/availability';
import { isIsoDate } from '@/lib/reservations/dates';
import { clientKey, getRateLimiter } from '@/lib/security/server';

const query = z.object({
  date: z.string().refine(isIsoDate, 'date must be YYYY-MM-DD'),
  guests: z.coerce.number().int().min(PARTY_MIN).max(PARTY_MAX),
});

const limiter = () => getRateLimiter({ prefix: 'availability', limit: 60, windowMs: 60_000 });

export async function GET(request: NextRequest) {
  const rate = await limiter().limit(clientKey(request.headers));
  if (!rate.success) {
    return Response.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rate.resetAt - Date.now()) / 1000)) } },
    );
  }

  const parsed = query.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return Response.json(
      { error: 'invalid_query', issues: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }

  const { date, guests } = parsed.data;
  const now = restaurantNow();
  const status = getDateStatus(date, now.date);
  return Response.json(
    {
      date,
      guests,
      status,
      message: status === 'open' ? undefined : dateStatusMessage[status],
      slots: getSlots(date, guests, now),
    },
    { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } },
  );
}
