import 'server-only';
import { createHmac, randomBytes } from 'node:crypto';
import { env } from '@/lib/env/server';
import type { ReservationRequest } from './schema';
import type { ReservationReceipt } from './types';

/**
 * Booking back-end abstraction. Swap in OpenTable, SevenRooms, Resy or an
 * in-house API by implementing `ReservationProvider` — the form and the
 * Server Action do not change.
 */
export interface ReservationProvider {
  readonly name: string;
  submit(request: ReservationRequest): Promise<ReservationReceipt>;
}

function reference(prefix: string): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  return `${prefix}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}

function receiptFor(request: ReservationRequest, ref: string, status: ReservationReceipt['status']) {
  return {
    reference: ref,
    status,
    guests: request.guests,
    date: request.date,
    time: request.time,
    name: request.name,
    email: request.email,
  } satisfies ReservationReceipt;
}

/** Demonstration provider: validates everything, books nothing. */
export const demoProvider: ReservationProvider = {
  name: 'demo',
  async submit(request) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return receiptFor(request, reference('DEMO'), 'demo');
  },
};

/** Forwards the request to a webhook (signed with HMAC-SHA256) for staff confirmation. */
export function createWebhookProvider(url: string, secret: string): ReservationProvider {
  return {
    name: 'webhook',
    async submit(request) {
      const ref = reference('AZR');
      const body = JSON.stringify({ reference: ref, submittedAt: new Date().toISOString(), ...request });
      const signature = createHmac('sha256', secret).update(body).digest('hex');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Azure-Signature': `sha256=${signature}` },
        body,
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`Reservation webhook responded with ${response.status}`);
      return receiptFor(request, ref, 'pending');
    },
  };
}

export function getReservationProvider(): ReservationProvider {
  const { RESERVATION_WEBHOOK_URL: url, RESERVATION_WEBHOOK_SECRET: secret } = env.raw;
  return url && secret ? createWebhookProvider(url, secret) : demoProvider;
}
