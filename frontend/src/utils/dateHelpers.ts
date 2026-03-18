import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  format,
  isToday,
  isSameMonth,
  parseISO,
} from 'date-fns';
import type { CalendarDay } from '../types/calendar';

/** Extract yyyy-MM-dd from an ISO date string or Date object */
export function toDateKey(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  return format(d, 'yyyy-MM-dd');
}

export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const monthDate = new Date(year, month, 1);
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });

  return eachDayOfInterval({ start, end }).map((date) => ({
    date,
    dateStr: format(date, 'yyyy-MM-dd'),
    isCurrentMonth: isSameMonth(date, monthDate),
    isToday: isToday(date),
  }));
}

export function getWeekDays(weekStart: Date): CalendarDay[] {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const refMonth = weekStart;
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return {
      date,
      dateStr: format(date, 'yyyy-MM-dd'),
      isCurrentMonth: isSameMonth(date, refMonth),
      isToday: isToday(date),
    };
  });
}

export function formatMonthYear(year: number, month: number): string {
  return format(new Date(year, month, 1), 'MMMM yyyy');
}

export function formatWeekRange(weekStart: Date): string {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = addDays(start, 6);
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
