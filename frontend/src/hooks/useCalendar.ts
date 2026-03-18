import { useMemo } from 'react';
import { getCalendarDays, getWeekDays } from '../utils/dateHelpers';
import type { ViewMode } from '../context/NavigationContext';

export function useCalendar(
  year: number,
  month: number,
  viewMode: ViewMode,
  weekStart: Date,
) {
  const days = useMemo(() => {
    if (viewMode === 'week') {
      return getWeekDays(weekStart);
    }
    return getCalendarDays(year, month);
  }, [year, month, viewMode, weekStart]);

  return days;
}
