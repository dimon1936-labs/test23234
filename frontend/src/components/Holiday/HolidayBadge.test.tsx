import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HolidayBadge } from './HolidayBadge';

const holiday = {
  date: '2026-01-01',
  localName: 'Новий рік',
  name: "New Year's Day",
  countryCode: 'UA',
};

describe('HolidayBadge', () => {
  it('should render local name', () => {
    render(<HolidayBadge holiday={holiday} />);
    expect(screen.getByText('Новий рік')).toBeInTheDocument();
  });

  it('should have role="status"', () => {
    render(<HolidayBadge holiday={holiday} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should have aria-label with English name', () => {
    render(<HolidayBadge holiday={holiday} />);
    expect(screen.getByLabelText("Holiday: New Year's Day")).toBeInTheDocument();
  });

  it('should show English name in title attribute', () => {
    render(<HolidayBadge holiday={holiday} />);
    expect(screen.getByText('Новий рік')).toHaveAttribute('title', "New Year's Day");
  });
});
