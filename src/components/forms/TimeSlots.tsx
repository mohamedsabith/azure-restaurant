'use client';

import { useEffect, useState } from 'react';
import type { Slot } from '@/lib/reservations/availability';
import { cn } from '@/lib/utils';
import { FieldError } from './Field';

export interface AvailabilityResponse {
  date: string;
  guests: number;
  status: string;
  message?: string;
  slots: Slot[];
}

type LoadState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; data: AvailabilityResponse }
  | { kind: 'error'; message: string };

type Result = { key: string } & (
  { kind: 'ready'; data: AvailabilityResponse } | { kind: 'error'; message: string }
);

interface TimeSlotsProps {
  date: string;
  guests: number;
  value: string;
  onChange: (time: string) => void;
  error?: string;
  /** Bump to force a refresh (e.g. after a slot was taken). */
  refreshKey?: number;
}

export function TimeSlots({ date, guests, value, onChange, error, refreshKey = 0 }: TimeSlotsProps) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const requestKey = date ? `${date}|${guests}|${attempt}|${refreshKey}` : null;

  // Idle and loading are derived; state is only written when a response arrives.
  const state: LoadState = !requestKey
    ? { kind: 'idle' }
    : result?.key === requestKey
      ? result
      : { kind: 'loading' };

  useEffect(() => {
    if (!requestKey) return;
    const controller = new AbortController();
    fetch(`/api/availability?date=${encodeURIComponent(date)}&guests=${guests}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 429) throw new Error('Too many requests — please wait a moment.');
        if (!response.ok) throw new Error('We could not load times for this date.');
        const data = (await response.json()) as AvailabilityResponse;
        setResult({ key: requestKey, kind: 'ready', data });
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setResult({ key: requestKey, kind: 'error', message: err.message });
      });
    return () => controller.abort();
  }, [requestKey, date, guests]);

  // Drop a selected time that is no longer offered for the new date/party size.
  const selectionStale =
    state.kind === 'ready' &&
    Boolean(value) &&
    !state.data.slots.some((s) => s.time === value && s.available);
  useEffect(() => {
    if (selectionStale) onChange('');
  }, [selectionStale, onChange]);

  return (
    <fieldset aria-describedby={error ? 'time-error' : undefined} aria-busy={state.kind === 'loading'}>
      <legend className="mb-3 text-small font-semibold text-moss">Time</legend>

      {state.kind === 'idle' && (
        <p className="text-small text-ink/80">Choose a date to see available times.</p>
      )}

      {state.kind === 'loading' && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Loading available times">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="h-12 animate-pulse bg-sand" />
          ))}
        </div>
      )}

      {state.kind === 'error' && (
        <div
          className="flex flex-wrap items-center gap-4 border-l-2 border-[#B42318] bg-white px-4 py-3 text-small"
          role="alert"
        >
          <span className="text-[#B42318]">{state.message}</span>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="font-semibold text-bronze underline"
          >
            Try again
          </button>
        </div>
      )}

      {state.kind === 'ready' && state.data.slots.length === 0 && (
        <p className="text-small text-ink/85">
          {state.data.message ?? 'No tables are available on this date.'}
        </p>
      )}

      {state.kind === 'ready' && state.data.slots.length > 0 && (
        <div className="space-y-5">
          {(['lunch', 'dinner'] as const).map((seating) => {
            const slots = state.data.slots.filter((s) => s.seating === seating);
            if (!slots.length) return null;
            const anyFree = slots.some((s) => s.available);
            return (
              <div key={seating}>
                <p className="mb-2 eyebrow text-ink/80">{seating === 'lunch' ? 'Lunch' : 'Dinner'}</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {slots.map((slot) => {
                    const id = `time-${slot.time.replace(':', '')}`;
                    return (
                      <div key={slot.time}>
                        <input
                          id={id}
                          type="radio"
                          name="time"
                          value={slot.time}
                          checked={value === slot.time}
                          disabled={!slot.available}
                          onChange={() => onChange(slot.time)}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={id}
                          className={cn(
                            'flex min-h-12 cursor-pointer flex-col items-center justify-center border text-small tabular transition-colors duration-200',
                            'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bronze',
                            slot.available
                              ? 'border-moss/20 bg-white text-moss peer-checked:border-bronze peer-checked:bg-bronze peer-checked:text-white hover:border-moss'
                              : 'cursor-not-allowed border-transparent bg-sand/60 text-ink/45',
                          )}
                        >
                          <span className={cn(!slot.available && 'line-through')}>{slot.time}</span>
                          {!slot.available && (
                            <span className="text-[0.625rem] tracking-[0.1em] uppercase">Full</span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
                {!anyFree && <p className="mt-2 text-caption text-ink/80">This seating is fully booked.</p>}
              </div>
            );
          })}
        </div>
      )}
      {error && <FieldError id="time-error">{error}</FieldError>}
    </fieldset>
  );
}
