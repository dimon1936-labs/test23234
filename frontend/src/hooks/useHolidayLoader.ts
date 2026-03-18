import { useEffect } from 'react';
import { useHolidays } from '../context/HolidayContext';
import { useNavigation } from '../context/NavigationContext';

export function useHolidayLoader() {
  const { loadHolidays } = useHolidays();
  const { state: { currentYear, countryCode } } = useNavigation();

  useEffect(() => {
    loadHolidays(currentYear, countryCode);
  }, [loadHolidays, currentYear, countryCode]);
}
