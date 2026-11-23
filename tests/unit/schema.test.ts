import { describe, expect, it } from 'vitest';
import { fieldErrorsFrom, formDataToObject, reservationSchema } from '@/lib/reservations/schema';

const valid = {
  guests: 2,
  date: '2026-11-24',
  time: '19:00',
  name: '  Ada Lovelace ',
  email: 'ada@example.com',
  phone: '+44 20 7946 0958',
  occasion: '',
  dietary: ['vegetarian'],
  dietaryNotes: '',
  requests: 'Window table if possible',
  website: '',
};

describe('reservationSchema', () => {
  it('accepts a complete request and normalises it', () => {
    const result = reservationSchema.parse(valid);
    expect(result.name).toBe('Ada Lovelace');
    expect(result.occasion).toBeUndefined();
    expect(result.dietaryNotes).toBeUndefined();
    expect(result.dietary).toEqual(['vegetarian']);
  });

  it.each([
    ['guests', { guests: 9 }],
    ['guests', { guests: 0 }],
    ['date', { date: '2026-02-30' }],
    ['time', { time: '7pm' }],
    ['name', { name: 'A' }],
    ['email', { email: 'not-an-email' }],
    ['phone', { phone: '12' }],
    ['phone', { phone: 'call me' }],
    ['dietary', { dietary: ['carnivore'] }],
    ['requests', { requests: 'x'.repeat(501) }],
    ['website', { website: 'https://spam.example' }],
  ])('rejects an invalid %s', (field, override) => {
    const result = reservationSchema.safeParse({ ...valid, ...override });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsFrom(result.error)).toHaveProperty(field);
  });

  it('gives a helpful message for large parties', () => {
    const result = reservationSchema.safeParse({ ...valid, guests: 12 });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsFrom(result.error).guests).toMatch(/private room/);
  });

  it('reads multi-value checkboxes from FormData', () => {
    const fd = new FormData();
    Object.entries({ ...valid, dietary: undefined }).forEach(
      ([k, v]) => v !== undefined && fd.set(k, String(v)),
    );
    fd.append('dietary', 'vegan');
    fd.append('dietary', 'nut-allergy');
    const parsed = reservationSchema.parse(formDataToObject(fd));
    expect(parsed.dietary).toEqual(['vegan', 'nut-allergy']);
    expect(parsed.guests).toBe(2);
  });
});
