import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/reservations/actions', () => ({ submitReservation: vi.fn(async () => ({ status: 'idle' })) }));
vi.mock('@/components/motion/TransitionLink', () => ({
  TransitionLink: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const { ReservationForm } = await import('@/components/forms/ReservationForm');

describe('ReservationForm', () => {
  it('shows the demonstration notice and labelled fields', () => {
    render(<ReservationForm />);
    expect(screen.getByText(/Demonstration only/)).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    const party = screen.getByRole('group', { name: 'Guests' });
    expect(within(party).getAllByRole('button')).toHaveLength(8);
    expect(within(party).getByRole('button', { name: '2 guests' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('validates on the client before calling the server', async () => {
    const user = userEvent.setup();
    const { submitReservation } = await import('@/lib/reservations/actions');
    render(<ReservationForm />);

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /Request reservation/ }));

    const summary = await screen.findByRole('alert');
    expect(within(summary).getByText(/Please check the highlighted fields/)).toBeInTheDocument();
    expect(within(summary).getByRole('link', { name: /Date: Choose a date/ })).toHaveAttribute(
      'href',
      '#date',
    );
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(/valid email address/);
    expect(submitReservation).not.toHaveBeenCalled();
  });

  it('offers party sizes from 1 to 8 and reflects the choice in the live summary', async () => {
    const user = userEvent.setup();
    render(<ReservationForm />);
    const party = screen.getByRole('group', { name: 'Guests' });
    expect(within(party).queryByRole('button', { name: '9 guests' })).not.toBeInTheDocument();

    await user.click(within(party).getByRole('button', { name: '1 guest' }));
    expect(within(party).getByRole('button', { name: '1 guest' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(party).getByRole('button', { name: '2 guests' })).toHaveAttribute('aria-pressed', 'false');

    const summary = screen.getByRole('complementary', { name: 'Your table' });
    expect(within(summary).getByText('1 guest')).toBeInTheDocument();
    expect(within(summary).getByText('Choose a date')).toBeInTheDocument();
  });
});
