import { describe, it, expect } from 'vitest';
import {
  toDateKey,
  getCalendarDays,
  getWeekDays,
  formatMonthYear,
  formatWeekRange,
  WEEKDAYS,
} from './dateHelpers';

describe('toDateKey', () => {
  it('should convert Date to yyyy-MM-dd string', () => {
    expect(toDateKey(new Date(2026, 2, 16))).toBe('2026-03-16');
  });

  it('should convert ISO string to yyyy-MM-dd', () => {
    expect(toDateKey('2026-03-16T12:00:00.000Z')).toBe('2026-03-16');
  });

  it('should handle plain date string', () => {
    expect(toDateKey('2026-01-01')).toBe('2026-01-01');
  });
});

describe('getCalendarDays', () => {
  it('should return array of CalendarDay objects', () => {
    const days = getCalendarDays(2026, 2); // March 2026 (0-indexed)
    expect(days.length).toBeGreaterThan(0);
    expect(days[0]).toHaveProperty('date');
    expect(days[0]).toHaveProperty('dateStr');
    expect(days[0]).toHaveProperty('isCurrentMonth');
    expect(days[0]).toHaveProperty('isToday');
  });

  it('should always return a multiple of 7 (full weeks)', () => {
    const days = getCalendarDays(2026, 2);
    expect(days.length % 7).toBe(0);
  });

  it('should start on Monday', () => {
    const days = getCalendarDays(2026, 2);
    expect(days[0].date.getDay()).toBe(1); // Monday
  });

  it('should mark current month days correctly', () => {
    const days = getCalendarDays(2026, 0); // January 2026
    const januaryDays = days.filter((d) => d.isCurrentMonth);
    expect(januaryDays.length).toBe(31);
  });

  it('should include padding days from adjacent months', () => {
    const days = getCalendarDays(2026, 2); // March 2026
    const nonCurrentMonth = days.filter((d) => !d.isCurrentMonth);
    expect(nonCurrentMonth.length).toBeGreaterThan(0);
  });

  it('should handle February in leap year', () => {
    const days = getCalendarDays(2028, 1); // Feb 2028 is leap
    const febDays = days.filter((d) => d.isCurrentMonth);
    expect(febDays.length).toBe(29);
  });

  it('should handle February in non-leap year', () => {
    const days = getCalendarDays(2026, 1); // Feb 2026
    const febDays = days.filter((d) => d.isCurrentMonth);
    expect(febDays.length).toBe(28);
  });
});

describe('getWeekDays', () => {
  it('should return exactly 7 days', () => {
    const days = getWeekDays(new Date(2026, 2, 16));
    expect(days).toHaveLength(7);
  });

  it('should start on Monday', () => {
    const days = getWeekDays(new Date(2026, 2, 18)); // Wednesday
    expect(days[0].date.getDay()).toBe(1);
  });

  it('should have consecutive dates', () => {
    const days = getWeekDays(new Date(2026, 2, 16));
    for (let i = 1; i < days.length; i++) {
      const diff = days[i].date.getTime() - days[i - 1].date.getTime();
      expect(diff).toBe(24 * 60 * 60 * 1000);
    }
  });

  it('should generate valid dateStr format', () => {
    const days = getWeekDays(new Date(2026, 2, 16));
    for (const day of days) {
      expect(day.dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('formatMonthYear', () => {
  it('should format as "Month YYYY"', () => {
    expect(formatMonthYear(2026, 0)).toBe('January 2026');
    expect(formatMonthYear(2026, 11)).toBe('December 2026');
  });
});

describe('formatWeekRange', () => {
  it('should format as "Mon d - Mon d, yyyy"', () => {
    const result = formatWeekRange(new Date(2026, 2, 16));
    expect(result).toMatch(/\w+ \d+ - \w+ \d+, \d{4}/);
  });
});

describe('WEEKDAYS', () => {
  it('should have 7 days starting with Mon', () => {
    expect(WEEKDAYS).toHaveLength(7);
    expect(WEEKDAYS[0]).toBe('Mon');
    expect(WEEKDAYS[6]).toBe('Sun');
  });
});
