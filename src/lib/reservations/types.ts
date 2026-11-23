import type { ReservationField } from './schema';

export interface ReservationReceipt {
  reference: string;
  /** `demo` = nothing was booked; `pending` = forwarded to the restaurant for confirmation. */
  status: 'demo' | 'pending';
  guests: number;
  date: string;
  time: string;
  name: string;
  email: string;
}

export type ReservationFormState =
  | { status: 'idle' }
  | { status: 'success'; receipt: ReservationReceipt }
  | {
      status: 'error';
      message: string;
      fieldErrors: Partial<Record<ReservationField, string>>;
      /** `slot` = the chosen time became unavailable; `rate` = too many attempts. */
      reason?: 'validation' | 'slot' | 'rate' | 'provider';
    };
