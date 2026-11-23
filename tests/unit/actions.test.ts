import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Availability from '@/lib/reservations/availability';

// Server-only dependencies are mocked: request headers and a fixed "now".
const headerStore = new Headers({ 'x-forwarded-for': '203.0.113.7', host: 'azure.example' });
vi.mock('next/headers', () => ({ headers: async () => headerStore }));
vi.mock('@/lib/reservations/availability', async (importOriginal) => {
  const actual = await importOriginal<typeof Availability>();
  return { ...actual, restaurantNow: () => ({ date: '2026-11-23', minutes: 600 }) };
});

const { submitReservation } = await import('@/lib/reservations/actions');
const { getSlots } = await import('@/lib/reservations/availability');

function form(overrides: Record<string, string> = {}) {
  const openSlot = getSlots('2026-11-25', 2, { date: '2026-11-23', minutes: 600 }).find((s) => s.available)!;
  const fd = new FormData();
  const values = {
    guests: '2',
    date: '2026-11-25',
    time: openSlot.time,
    name: 'Grace Hopper',
    email: 'grace@example.com',
    phone: '+1 202 555 0143',
    occasion: '',
    dietaryNotes: '',
    requests: '',
    website: '',
    ...overrides,
  };
  Object.entries(values).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

describe('submitReservation (Server Action)', () => {
  beforeEach(() => {
    headerStore.set('x-forwarded-for', `198.51.100.${Math.floor(Math.random() * 250)}`);
  });

  it('returns a demonstration receipt for a valid request', async () => {
    const result = await submitReservation({ status: 'idle' }, form());
    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.receipt.status).toBe('demo');
      expect(result.receipt.reference).toMatch(/^DEMO-[A-Z2-9]{6}$/);
    }
  });

  it('returns field errors for invalid input', async () => {
    const result = await submitReservation({ status: 'idle' }, form({ email: 'nope', guests: '0' }));
    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.reason).toBe('validation');
      expect(Object.keys(result.fieldErrors)).toEqual(expect.arrayContaining(['email', 'guests']));
    }
  });

  it('re-checks availability on the server', async () => {
    const closed = await submitReservation({ status: 'idle' }, form({ date: '2026-11-30' })); // Monday
    expect(closed.status === 'error' && closed.fieldErrors.date).toBeTruthy();
    const badTime = await submitReservation({ status: 'idle' }, form({ time: '16:00' }));
    expect(badTime.status === 'error' && badTime.reason).toBe('slot');
  });

  it('answers a filled honeypot generically', async () => {
    const result = await submitReservation({ status: 'idle' }, form({ website: 'https://spam.example' }));
    expect(result).toMatchObject({ status: 'error', fieldErrors: {} });
  });

  it('rate-limits repeated attempts from the same client', async () => {
    headerStore.set('x-forwarded-for', '192.0.2.99');
    const results = [];
    for (let i = 0; i < 6; i += 1)
      results.push(await submitReservation({ status: 'idle' }, form({ email: 'x' })));
    expect(results.at(-1)).toMatchObject({ status: 'error', reason: 'rate' });
  });
});
