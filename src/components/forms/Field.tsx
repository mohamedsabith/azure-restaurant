import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

const control =
  'block w-full min-h-13 border bg-white px-4 py-3 text-body text-moss transition-[border-color,box-shadow] duration-200 placeholder:text-ink/50 focus:outline-none focus-visible:outline-none focus:border-bronze focus:shadow-[0_0_0_1px_var(--color-bronze)] aria-invalid:border-[#B42318] aria-invalid:shadow-[0_0_0_1px_#B42318]';

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldShell({ id, label, hint, error, optional, children, className }: FieldShellProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2 flex items-baseline justify-between gap-4 text-small font-semibold text-moss"
      >
        <span>{label}</span>
        {optional && <span className="text-caption font-normal text-ink/75">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-caption text-ink/80">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-caption font-medium text-[#B42318]">
      <Icon name="alert" className="mt-px size-4" />
      <span>{children}</span>
    </p>
  );
}

export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export function TextField({ id, label, hint, error, optional, className, ...input }: InputProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        aria-required={optional ? undefined : true}
        className={cn(control, 'border-moss/20')}
        {...input}
      />
    </FieldShell>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export function TextAreaField({ id, label, hint, error, optional, className, ...textarea }: TextAreaProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea
        id={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, 'resize-y border-moss/20')}
        {...textarea}
      />
    </FieldShell>
  );
}

export const selectClasses = cn(
  control,
  'bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23102A56%27 stroke-width=%271.5%27%3E%3Cpath d=%27M6 9l6 6 6-6%27/%3E%3C/svg%3E")] appearance-none border-moss/20 bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat pr-12',
);
