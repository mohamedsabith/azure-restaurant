import { describe, expect, it } from 'vitest';
import {
  BOOKING_WINDOW_DAYS,
  getDateStatus,
  getSlots,
  isSlotBookable,
  lastBookableDate,
} from '@/lib/reservations/availability';
import { addDays, diffInDays, isIsoDate, weekday, zonedNow } from '@/lib/reservations/dates';

// 2026-11-23 is a Monday.
const today = '2026-11-23';
const now = { date: today, minutes: 10 * 60 };

describe('dates', () => {
  it('validates real calendar dates only', () => {
    expect(isIsoDate('2026-02-28')).toBe(true);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate('26-11-01')).toBe(false);
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(diffInDays('2026-11-23', '2027-01-22')).toBe(60);
    expect(weekday(today)).toBe(1);
  });

  it('resolves "now" in the restaurant time zone, not the host zone', () => {
    // 23:30 UTC on 31 Dec is already 1 Jan in Tokyo.
    const at = new Date(Date.UTC(2026, 11, 31, 23, 30));
    expect(zonedNow('Asia/Tokyo', at)).toEqual({ date: '2027-01-01', minutes: 8 * 60 + 30 });
    expect(zonedNow('UTC', at)).toEqual({ date: '2026-12-31', minutes: 23 * 60 + 30 });
  });
});

describe('date status', () => {
  it.each([
    ['2026-11-22', 'past'],
    [today, 'closed'], // Monday
    ['2026-11-29', 'closed'], // Sunday
    ['2026-11-24', 'open'], // Tuesday
    ['2026-12-25', 'closure'],
    [addDays(today, BOOKING_WINDOW_DAYS + 1), 'beyond-window'],
  ])('%s → %s', (date, status) => {
    expect(getDateStatus(date, today)).toBe(status);
  });

  it('exposes the last bookable date', () => {
    expect(lastBookableDate(today)).toBe(addDays(today, BOOKING_WINDOW_DAYS));
  });
});

describe('slots', () => {
  it('offers dinner only on Tuesday and lunch + dinner on Friday', () => {
    const tuesday = getSlots('2026-11-24', 2, now);
    expect(new Set(tuesday.map((s) => s.seating))).toEqual(new Set(['dinner']));
    expect(tuesday[0]?.time).toBe('17:30');
    expect(tuesday.at(-1)?.time).toBe('21:30');

    const friday = getSlots('2026-11-27', 2, now);
    expect(friday.some((s) => s.seating === 'lunch')).toBe(true);
    expect(friday.at(-1)?.time).toBe('22:00');
  });

  it('returns nothing for closed dates', () => {
    expect(getSlots(today, 2, now)).toEqual([]);
  });

  it('is deterministic for the same date and party size', () => {
    expect(getSlots('2026-12-04', 4, now)).toEqual(getSlots('2026-12-04', 4, now));
  });

  it('closes same-day slots inside the two-hour lead time', () => {
    const tuesdayEvening = { date: '2026-11-24', minutes: 18 * 60 };
    const slots = getSlots('2026-11-24', 2, tuesdayEvening);
    expect(slots.filter((s) => s.time <= '19:30').every((s) => !s.available)).toBe(true);
  });

  it('confirms bookability against the same rules the UI uses', () => {
    const open = getSlots('2026-11-25', 2, now).find((s) => s.available);
    expect(open).toBeDefined();
    expect(isSlotBookable('2026-11-25', open!.time, 2, now)).toBe(true);
    expect(isSlotBookable('2026-11-25', '03:00', 2, now)).toBe(false);
    expect(isSlotBookable(today, '19:00', 2, now)).toBe(false);
  });
});
