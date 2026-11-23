import { site } from '@/content/site';
import { addDays, diffInDays, formatMinutes, minutesOf, weekday, zonedNow, type ZonedNow } from './dates';

/**
 * Availability rules for the demonstration booking flow.
 *
 * Slot availability is simulated with a deterministic hash so that the same
 * date and party size always give the same answer (stable for tests and users).
 * Replace `simulatedOccupancy` with a call to the real booking system when one exists.
 */

export const PARTY_MIN = 1;
export const PARTY_MAX = 8;
export const BOOKING_WINDOW_DAYS = 60;
/** Same-day bookings close this long before a seating. */
export const SAME_DAY_LEAD_MINUTES = 120;

export const closures: string[] = ['2026-12-24', '2026-12-25', '2026-12-26', '2027-01-01'];

type Seating = 'lunch' | 'dinner';

const schedule: Record<number, { seating: Seating; first: string; last: string }[]> = {
  0: [],
  1: [],
  2: [{ seating: 'dinner', first: '17:30', last: '21:30' }],
  3: [{ seating: 'dinner', first: '17:30', last: '21:30' }],
  4: [{ seating: 'dinner', first: '17:30', last: '21:30' }],
  5: [
    { seating: 'lunch', first: '12:00', last: '13:30' },
    { seating: 'dinner', first: '17:30', last: '22:00' },
  ],
  6: [
    { seating: 'lunch', first: '12:00', last: '13:30' },
    { seating: 'dinner', first: '17:30', last: '22:00' },
  ],
};

export type DateStatus = 'open' | 'past' | 'closed' | 'closure' | 'beyond-window';

export interface Slot {
  time: string;
  seating: Seating;
  available: boolean;
}

export function restaurantNow(at?: Date): ZonedNow {
  return zonedNow(site.timeZone, at);
}

export function lastBookableDate(today: string): string {
  return addDays(today, BOOKING_WINDOW_DAYS);
}

export function getDateStatus(date: string, today: string): DateStatus {
  const offset = diffInDays(today, date);
  if (offset < 0) return 'past';
  if (offset > BOOKING_WINDOW_DAYS) return 'beyond-window';
  if (closures.includes(date)) return 'closure';
  if ((schedule[weekday(date)] ?? []).length === 0) return 'closed';
  return 'open';
}

export const dateStatusMessage: Record<Exclude<DateStatus, 'open'>, string> = {
  past: 'That date has passed.',
  closed: 'We are closed on Sundays and Mondays.',
  closure: 'The restaurant is closed on this date.',
  'beyond-window': `Reservations open ${BOOKING_WINDOW_DAYS} days ahead.`,
};

/** FNV-1a — tiny, deterministic, good enough to spread simulated bookings. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0xffffffff;
}

function simulatedOccupancy(date: string, time: string, guests: number): boolean {
  // Larger parties and weekend dinners are harder to seat.
  const day = weekday(date);
  const weekendPressure = day === 5 || day === 6 ? 0.18 : 0;
  const partyPressure = Math.max(0, guests - 2) * 0.07;
  const primeTime = time >= '19:00' && time <= '20:30' ? 0.12 : 0;
  return hash(`${date}|${time}|${guests}`) < 0.18 + weekendPressure + partyPressure + primeTime;
}

export function getSlots(date: string, guests: number, now: ZonedNow): Slot[] {
  if (getDateStatus(date, now.date) !== 'open') return [];
  const slots: Slot[] = [];
  for (const period of schedule[weekday(date)] ?? []) {
    for (let m = minutesOf(period.first); m <= minutesOf(period.last); m += 30) {
      const time = formatMinutes(m);
      const tooSoon = date === now.date && m - now.minutes < SAME_DAY_LEAD_MINUTES;
      slots.push({
        time,
        seating: period.seating,
        available: !tooSoon && !simulatedOccupancy(date, time, guests),
      });
    }
  }
  return slots;
}

export function isSlotBookable(date: string, time: string, guests: number, now: ZonedNow): boolean {
  return getSlots(date, guests, now).some((slot) => slot.time === time && slot.available);
}
