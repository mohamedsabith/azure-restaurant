/**
 * Calendar maths on ISO date strings (YYYY-MM-DD) so results never depend on the
 * server's or browser's time zone. "Now" is always resolved in the restaurant's zone.
 */

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function toUtcDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d));
}

export function fromUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const date = toUtcDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return fromUtcDate(date);
}

/** 0 = Sunday … 6 = Saturday */
export function weekday(iso: string): number {
  return toUtcDate(iso).getUTCDay();
}

export function diffInDays(fromIso: string, toIso: string): number {
  return Math.round((toUtcDate(toIso).getTime() - toUtcDate(fromIso).getTime()) / 86_400_000);
}

export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface ZonedNow {
  date: string;
  minutes: number;
}

/** Current date and minute-of-day in an IANA time zone. */
export function zonedNow(timeZone: string, at: Date = new Date()): ZonedNow {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '00';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

export function formatLongDate(iso: string, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(toUtcDate(iso));
}
