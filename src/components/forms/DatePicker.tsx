'use client';

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { formatLongDate } from '@/lib/reservations/dates';
import { cn } from '@/lib/utils';
import { Calendar } from './Calendar';
import { FieldError } from './Field';

interface DatePickerProps {
  id: string;
  today: string | null;
  value: string;
  onChange: (iso: string) => void;
  error?: string;
}

/** Date field: a button that opens the calendar in a Floating UI popover. */
export function DatePicker({ id, today, value, onChange, error }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: 16 }),
      shift({ padding: 12 }),
      size({
        padding: 12,
        apply({ availableWidth, elements }) {
          elements.floating.style.maxWidth = `${Math.max(280, availableWidth)}px`;
        },
      }),
    ],
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: 'dialog' }),
  ]);

  return (
    <div>
      <p id={`${id}-label`} className="mb-2 text-small font-semibold text-moss">
        Date
      </p>
      <button
        ref={refs.setReference}
        id={id}
        type="button"
        disabled={!today}
        aria-labelledby={`${id}-label ${id}`}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'flex min-h-13 w-full items-center justify-between gap-4 border bg-white px-4 py-3 text-left text-body transition-[border-color,box-shadow] duration-200',
          open
            ? 'border-bronze shadow-[0_0_0_1px_var(--color-bronze)]'
            : 'border-moss/20 hover:border-moss/50',
          error && 'border-[#B42318] shadow-[0_0_0_1px_#B42318]',
          value ? 'text-moss' : 'text-ink/70',
        )}
        {...getReferenceProps()}
      >
        <span>{value ? formatLongDate(value) : 'Choose a date'}</span>
        <Icon name="calendar" className="text-bronze" />
      </button>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}

      <FloatingPortal>
        <AnimatePresence>
          {open && today && (
            <FloatingFocusManager context={context} modal={false} initialFocus={-1} returnFocus>
              <div
                // eslint-disable-next-line react-hooks/refs -- Floating UI callback ref (stable setter)
                ref={refs.setFloating}
                style={floatingStyles}
                className="z-[85]"
                {...getFloatingProps()}
                aria-label="Choose a date"
              >
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="border border-moss/10 bg-white p-5 shadow-float"
                >
                  <CalendarWithInitialFocus
                    today={today}
                    value={value}
                    onChange={(iso) => {
                      onChange(iso);
                      setOpen(false);
                    }}
                  />
                </motion.div>
              </div>
            </FloatingFocusManager>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </div>
  );
}

/** Focuses the selected (or first focusable) day once the popover mounts. */
function CalendarWithInitialFocus(props: { today: string; value: string; onChange: (iso: string) => void }) {
  return (
    <div
      ref={(node) => {
        if (!node) return;
        requestAnimationFrame(() =>
          node.querySelector<HTMLButtonElement>('button[data-date][tabindex="0"]')?.focus(),
        );
      }}
    >
      <Calendar {...props} />
    </div>
  );
}
