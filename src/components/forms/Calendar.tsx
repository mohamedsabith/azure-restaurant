'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { dateStatusMessage, getDateStatus, lastBookableDate } from '@/lib/reservations/availability';
import { addDays, formatLongDate, fromUtcDate, toUtcDate, weekday } from '@/lib/reservations/dates';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function monthDays(month: string): (string | null)[] {
  const first = `${month}-01`;
  const lead = (weekday(first) + 6) % 7; // Monday-first grid
  const date = toUtcDate(first);
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  const count = date.getUTCDate();
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= count; d += 1) cells.push(`${month}-${String(d).padStart(2, '0')}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

function shiftMonth(month: string, delta: number): string {
  const date = toUtcDate(`${month}-01`);
  date.setUTCMonth(date.getUTCMonth() + delta);
  return monthKey(fromUtcDate(date));
}

interface CalendarProps {
  today: string;
  value: string;
  onChange: (iso: string) => void;
}

/**
 * Accessible date grid: arrow keys move by day/week, PageUp/PageDown by month,
 * Home/End to week start/end, Enter/Space selects. Closed and out-of-window
 * days are focusable (so keyboard users hear why) but not selectable.
 */
export function Calendar({ today, value, onChange }: CalendarProps) {
  const last = lastBookableDate(today);
  const [month, setMonth] = useState(monthKey(value || today));
  const [focused, setFocused] = useState(value || today);
  const grid = useRef<HTMLTableElement>(null);
  const shouldFocus = useRef(false);

  const cells = useMemo(() => monthDays(month), [month]);
  const monthLabel = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(toUtcDate(`${month}-01`));
  const canPrev = month > monthKey(today);
  const canNext = month < monthKey(last);

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
  }, [focused, month]);

  function moveFocus(next: string) {
    if (next < today || next > last) return;
    shouldFocus.current = true;
    setFocused(next);
    if (monthKey(next) !== month) setMonth(monthKey(next));
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, iso: string) {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in map) {
      event.preventDefault();
      moveFocus(addDays(iso, map[event.key]!));
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      const target = toUtcDate(iso);
      target.setUTCMonth(target.getUTCMonth() + (event.key === 'PageUp' ? -1 : 1));
      const next = fromUtcDate(target);
      moveFocus(next < today ? today : next > last ? last : next);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const offset = (weekday(iso) + 6) % 7;
      moveFocus(addDays(iso, event.key === 'Home' ? -offset : 6 - offset));
    }
  }

  return (
    <div className="w-full max-w-[22rem] select-none">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canPrev && setMonth(shiftMonth(month, -1))}
          disabled={!canPrev}
          className="inline-flex size-11 items-center justify-center text-moss disabled:opacity-30"
          aria-label="Previous month"
        >
          <Icon name="chevronLeft" />
        </button>
        <p className="font-display text-h4 text-moss" aria-live="polite">
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={() => canNext && setMonth(shiftMonth(month, 1))}
          disabled={!canNext}
          className="inline-flex size-11 items-center justify-center text-moss disabled:opacity-30"
          aria-label="Next month"
        >
          <Icon name="chevronRight" />
        </button>
      </div>
      <table ref={grid} className="w-full table-fixed border-collapse" aria-label={monthLabel}>
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th
                key={d}
                scope="col"
                className="pb-2 text-center text-[0.6875rem] font-semibold tracking-[0.1em] text-ink/75 uppercase"
              >
                <abbr title={d} className="no-underline">
                  {d.slice(0, 2)}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: cells.length / 7 }, (_, row) => (
            <tr key={row}>
              {cells.slice(row * 7, row * 7 + 7).map((iso, col) => {
                if (!iso) return <td key={`empty-${row}-${col}`} />;
                const status = getDateStatus(iso, today);
                const open = status === 'open';
                const selected = iso === value;
                const reason = open ? 'available' : dateStatusMessage[status];
                return (
                  <td key={iso} className="p-0.5 text-center">
                    <button
                      type="button"
                      data-date={iso}
                      tabIndex={iso === focused ? 0 : -1}
                      aria-disabled={!open || undefined}
                      aria-pressed={selected}
                      aria-label={`${formatLongDate(iso)}, ${reason}`}
                      onKeyDown={(event) => onKeyDown(event, iso)}
                      onFocus={() => setFocused(iso)}
                      onClick={() => open && onChange(iso)}
                      className={cn(
                        'inline-flex aspect-square w-full max-w-11 items-center justify-center text-small tabular transition-colors duration-200',
                        selected
                          ? 'bg-bronze font-semibold text-white'
                          : open
                            ? 'text-moss hover:bg-sand'
                            : 'cursor-not-allowed text-ink/35 line-through decoration-ink/25',
                        iso === today && !selected && 'shadow-[inset_0_0_0_1px_var(--color-sage)]',
                      )}
                    >
                      {Number(iso.slice(8))}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-caption text-ink/80">
        Closed Sundays and Mondays. Bookings open 60 days ahead.
      </p>
    </div>
  );
}
