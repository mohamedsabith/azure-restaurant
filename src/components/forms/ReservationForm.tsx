'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useActionState, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { DemoNotice } from '@/components/ui/DemoNotice';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import { reservationsPage } from '@/content/pages';
import { site } from '@/content/site';
import { submitReservation } from '@/lib/reservations/actions';
import { PARTY_MAX, PARTY_MIN, restaurantNow } from '@/lib/reservations/availability';
import { formatLongDate } from '@/lib/reservations/dates';
import { fieldErrorsFrom, reservationSchema, type ReservationField } from '@/lib/reservations/schema';
import type { ReservationFormState, ReservationReceipt } from '@/lib/reservations/types';
import { cn } from '@/lib/utils';
import { useClientSnapshot } from '@/hooks/useClientSnapshot';
import { motion as tokens } from '@/theme/tokens';
import { DatePicker } from './DatePicker';
import { selectClasses, TextAreaField, TextField } from './Field';
import { TimeSlots } from './TimeSlots';

const FIELD_ORDER: ReservationField[] = [
  'guests',
  'date',
  'time',
  'name',
  'email',
  'phone',
  'dietaryNotes',
  'requests',
];
const FIELD_LABEL: Partial<Record<ReservationField, string>> = {
  guests: 'Guests',
  date: 'Date',
  time: 'Time',
  name: 'Full name',
  email: 'Email',
  phone: 'Phone',
  dietaryNotes: 'Dietary notes',
  requests: 'Special requests',
};
const FIELD_ID: Partial<Record<ReservationField, string>> = { date: 'date', time: 'time-group' };

interface Values {
  guests: number;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  occasion: string;
  dietary: string[];
  dietaryNotes: string;
  requests: string;
}

const initialValues: Values = {
  guests: 2,
  date: '',
  time: '',
  name: '',
  email: '',
  phone: '',
  occasion: '',
  dietary: [],
  dietaryNotes: '',
  requests: '',
};

export function ReservationForm() {
  const [instance, setInstance] = useState(0);
  return <ReservationFormInner key={instance} onReset={() => setInstance((n) => n + 1)} />;
}

function ReservationFormInner({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState<ReservationFormState, FormData>(submitReservation, {
    status: 'idle',
  });
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<ReservationField, string>>>({});
  const [slotRefresh, setSlotRefresh] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);

  // "Today" in the restaurant's time zone, read on the client only (no hydration drift).
  const today = useClientSnapshot<string | null>(() => restaurantNow().date, null);

  // A new action result arrived: merge the authoritative server errors (adjusting state while rendering).
  const [handledState, setHandledState] = useState(state);
  if (handledState !== state) {
    setHandledState(state);
    if (state.status === 'error') {
      setErrors(state.fieldErrors);
      if (state.reason === 'slot') setSlotRefresh((n) => n + 1);
    }
  }
  useEffect(() => {
    if (state.status === 'error') requestAnimationFrame(() => summaryRef.current?.focus());
  }, [state]);

  const set = useCallback(<K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key as ReservationField] ? { ...e, [key]: undefined } : e));
  }, []);
  const setTime = useCallback((time: string) => set('time', time), [set]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const result = reservationSchema.safeParse({ ...values, website: '' });
    if (!result.success) {
      event.preventDefault();
      const fieldErrors = fieldErrorsFrom(result.error);
      setErrors(fieldErrors);
      const first = FIELD_ORDER.find((f) => fieldErrors[f]);
      requestAnimationFrame(() => {
        const target = first ? document.getElementById(FIELD_ID[first] ?? first) : null;
        (target?.matches('fieldset')
          ? target.querySelector<HTMLElement>('input:not(:disabled)')
          : target
        )?.focus();
      });
    }
  }

  if (state.status === 'success') {
    return <Confirmation receipt={state.receipt} onReset={onReset} />;
  }

  const errorEntries = FIELD_ORDER.filter((f) => errors[f]);
  const serverMessage = state.status === 'error' ? state.message : null;

  return (
    <div className="grid items-start gap-x-[clamp(2rem,5vw,5rem)] gap-y-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
      <form
        action={formAction}
        onSubmit={onSubmit}
        noValidate
        aria-describedby="form-note"
        className="space-y-12"
      >
        <DemoNotice />
        <p id="form-note" className="text-small text-ink/85">
          All fields are required unless marked optional.
        </p>

        {(errorEntries.length > 0 || serverMessage) && (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="border-l-2 border-[#B42318] bg-white px-5 py-4 text-small text-moss shadow-hairline focus:outline-none"
          >
            <p className="flex items-center gap-2 font-semibold text-[#B42318]">
              <Icon name="alert" className="size-4" />
              {serverMessage ?? 'Please check the highlighted fields.'}
            </p>
            {errorEntries.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-6">
                {errorEntries.map((field) => (
                  <li key={field}>
                    <a
                      href={`#${FIELD_ID[field] ?? field}`}
                      className="underline underline-offset-2 hover:text-bronze"
                    >
                      {FIELD_LABEL[field]}: {errors[field]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 01 — Party & date */}
        <fieldset className="space-y-8">
          <legend className="mb-6 flex items-baseline gap-4">
            <span className="font-display text-[1.35rem] text-bronze tabular">01</span>
            <span className="font-display text-[2.1rem] leading-none text-forest">Your table</span>
          </legend>
          <div className="grid gap-8">
            <div>
              <p id="guests-label" className="mb-2 text-small font-semibold text-moss">
                Guests
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby="guests-label">
                {Array.from({ length: PARTY_MAX - PARTY_MIN + 1 }, (_, i) => PARTY_MIN + i).map((n) => {
                  const on = values.guests === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set('guests', n)}
                      aria-pressed={on}
                      aria-label={`${n} ${n === 1 ? 'guest' : 'guests'}`}
                      className={cn(
                        'inline-flex size-12 items-center justify-center border font-display text-[1.35rem] tabular transition-colors duration-300',
                        on
                          ? 'border-forest bg-forest text-white'
                          : 'border-forest/18 bg-white text-forest hover:border-bronze',
                      )}
                    >
                      {n}
                    </button>
                  );
                })}
                <output id="guests" htmlFor="guests-input" aria-live="polite" className="sr-only">
                  {values.guests} {values.guests === 1 ? 'guest' : 'guests'}
                </output>
                <input id="guests-input" type="hidden" name="guests" value={values.guests} />
              </div>
              <p className="mt-2 text-caption text-ink/80">
                For {PARTY_MAX + 1} or more, write to {site.contact.email} about the private room.
              </p>
            </div>
            <div>
              <DatePicker
                id="date"
                today={today}
                value={values.date}
                onChange={(d) => set('date', d)}
                error={errors.date}
              />
              <input type="hidden" name="date" value={values.date} />
            </div>
          </div>
          <div id="time-group" tabIndex={-1} className="focus:outline-none">
            <TimeSlots
              date={values.date}
              guests={values.guests}
              value={values.time}
              onChange={setTime}
              error={errors.time}
              refreshKey={slotRefresh}
            />
          </div>
        </fieldset>

        {/* 02 — Guest details */}
        <fieldset className="space-y-6">
          <legend className="mb-6 flex items-baseline gap-4">
            <span className="font-display text-[1.35rem] text-bronze tabular">02</span>
            <span className="font-display text-[2.1rem] leading-none text-forest">Your details</span>
          </legend>
          <TextField
            id="name"
            name="name"
            label="Full name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            error={errors.name}
            maxLength={80}
          />
          <div className="grid gap-6 md:grid-cols-2">
            <TextField
              id="email"
              name="email"
              type="email"
              inputMode="email"
              label="Email"
              autoComplete="email"
              hint="We send the confirmation here."
              value={values.email}
              onChange={(e) => set('email', e.target.value)}
              error={errors.email}
              maxLength={254}
            />
            <TextField
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              label="Phone"
              autoComplete="tel"
              hint="Only used if we need to reach you about the booking."
              value={values.phone}
              onChange={(e) => set('phone', e.target.value)}
              error={errors.phone}
              maxLength={24}
            />
          </div>
          <div>
            <label
              htmlFor="occasion"
              className="mb-2 flex items-baseline justify-between text-small font-semibold text-moss"
            >
              <span>Occasion</span>
              <span className="text-caption font-normal text-ink/75">Optional</span>
            </label>
            <select
              id="occasion"
              name="occasion"
              value={values.occasion}
              onChange={(e) => set('occasion', e.target.value)}
              className={selectClasses}
            >
              <option value="">No particular occasion</option>
              {reservationsPage.occasions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* 03 — Dietary & requests */}
        <fieldset className="space-y-6">
          <legend className="mb-6 flex items-baseline gap-4">
            <span className="font-display text-[1.35rem] text-bronze tabular">03</span>
            <span className="font-display text-[2.1rem] leading-none text-forest">
              Dietary requirements & requests
            </span>
          </legend>
          <fieldset>
            <legend className="mb-3 flex items-baseline justify-between gap-4 text-small font-semibold text-moss">
              <span>Dietary requirements</span>
              <span className="text-caption font-normal text-ink/75">Optional</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {reservationsPage.dietaryOptions.map((option) => {
                const checked = values.dietary.includes(option.id);
                return (
                  <label key={option.id} className="relative">
                    <input
                      type="checkbox"
                      name="dietary"
                      value={option.id}
                      checked={checked}
                      onChange={() =>
                        set(
                          'dietary',
                          checked
                            ? values.dietary.filter((d) => d !== option.id)
                            : [...values.dietary, option.id],
                        )
                      }
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        'inline-flex min-h-11 cursor-pointer items-center gap-2 border px-4 text-small transition-colors duration-200',
                        'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bronze',
                        checked
                          ? 'border-bronze bg-bronze text-white'
                          : 'border-moss/20 bg-white text-moss hover:border-moss',
                      )}
                    >
                      {checked && <Icon name="check" className="size-4" />}
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <TextAreaField
            id="dietaryNotes"
            name="dietaryNotes"
            label="Dietary notes"
            optional
            hint="Allergies, intolerances or anything else the kitchen should know."
            rows={3}
            value={values.dietaryNotes}
            onChange={(e) => set('dietaryNotes', e.target.value)}
            error={errors.dietaryNotes}
            maxLength={300}
          />
          <TextAreaField
            id="requests"
            name="requests"
            label="Special requests"
            optional
            hint="Seating preferences, access needs, a celebration we should know about."
            value={values.requests}
            onChange={(e) => set('requests', e.target.value)}
            error={errors.requests}
            maxLength={500}
          />
        </fieldset>

        {/* Honeypot — hidden from people and assistive tech. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <div className="flex flex-col gap-4 border-t border-moss/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-ink/80">
            By sending this request you agree that we use these details only to manage your booking.
          </p>
          <Button
            type="submit"
            variant="dark"
            disabled={pending}
            aria-disabled={pending}
            className="min-h-14 w-full sm:w-auto sm:min-w-60 sm:shrink-0"
          >
            {pending ? (
              <>
                <span
                  aria-hidden
                  className="mr-1 inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
                Sending request…
              </>
            ) : (
              'Request reservation'
            )}
          </Button>
        </div>
        <p className="sr-only" aria-live="assertive">
          {pending ? 'Sending your reservation request.' : ''}
        </p>
      </form>
      <TableSummary guests={values.guests} date={values.date} time={values.time} />
    </div>
  );
}

/** Live summary of the table being requested; updates as the guest chooses. */
function TableSummary({ guests, date, time }: { guests: number; date: string; time: string }) {
  const service = time ? (time < '16:00' ? 'Lunch' : 'Dinner') : '—';
  return (
    <aside
      aria-label="Your table"
      className="border border-forest/10 bg-white shadow-[0_30px_60px_-40px_rgb(16_42_86/0.45)] lg:sticky lg:top-28"
    >
      <Picture image="dishPlated" aspect="16 / 9" sizes="(min-width: 1024px) 30vw, 100vw" />
      <div className="p-7 sm:p-8">
        <p className="eyebrow text-bronze">Your table</p>
        <p className="mt-4 font-display text-[1.9rem] leading-tight text-forest" aria-live="polite">
          {date ? formatLongDate(date) : 'Choose a date'}
        </p>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-small">
          <dt className="text-taupe">Time</dt>
          <dd className="text-right text-forest tabular">{time || 'Choose a time'}</dd>
          <dt className="text-taupe">Guests</dt>
          <dd className="text-right text-forest tabular">
            {guests} {guests === 1 ? 'guest' : 'guests'}
          </dd>
          <dt className="text-taupe">Service</dt>
          <dd className="text-right text-forest">{service}</dd>
        </dl>
        <ul className="mt-6 space-y-2.5 border-t border-forest/10 pt-5 text-caption leading-relaxed text-taupe">
          <li>The tasting menu is served to the whole table and takes about two and a half hours.</li>
          <li>Tables are held for fifteen minutes after the booking time.</li>
          <li>Please give forty-eight hours’ notice to change or cancel.</li>
          <li>Nine or more? The private room seats up to sixteen; write to {site.contact.email}.</li>
        </ul>
      </div>
    </aside>
  );
}

function Confirmation({ receipt, onReset }: { receipt: ReservationReceipt; onReset: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const isDemo = receipt.status === 'demo';
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: tokens.easeOutExpo }}
        className="border border-moss/10 bg-white p-6 sm:p-10"
        aria-live="polite"
      >
        <span className="inline-flex size-12 items-center justify-center rounded-full border border-bronze text-bronze">
          <Icon name="check" className="size-6" />
        </span>
        <h2
          ref={heading}
          tabIndex={-1}
          className="mt-8 font-display text-[clamp(2.25rem,1.6rem+1.8vw,3rem)] leading-tight focus:outline-none"
        >
          {isDemo ? 'Demonstration request received' : 'Request received'}
        </h2>
        <p className="mt-4 max-w-xl text-lead text-ink/90">
          {isDemo
            ? 'Everything checked out. Because this is a demonstration site, no reservation has been made and no email will be sent.'
            : `Thank you, ${receipt.name}. We will confirm your table by email at ${receipt.email}.`}
        </p>
        <dl className="mt-10 grid gap-6 border-y border-moss/10 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Reference', receipt.reference],
            ['Date', formatLongDate(receipt.date)],
            ['Time', receipt.time],
            ['Guests', String(receipt.guests)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="eyebrow text-ink/80">{label}</dt>
              <dd className="mt-2 font-display text-h4 text-moss tabular">{value}</dd>
            </div>
          ))}
        </dl>
        {isDemo && (
          <p className="mt-6 inline-block bg-sand px-3 py-2 text-caption text-moss">
            Demonstration only — this does not create a booking at a real restaurant.
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Button variant="secondary" onClick={onReset}>
            Make another request
          </Button>
          <ButtonLink href="/menu" variant="quiet" arrow>
            Browse the menu
          </ButtonLink>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
