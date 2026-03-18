import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Holiday } from '../types/holiday';
import { fetchHolidays } from '../api/holidaysApi';

function groupHolidaysByDate(holidays: Holiday[]): Record<string, Holiday[]> {
  const grouped: Record<string, Holiday[]> = {};
  for (const h of holidays) {
    if (!grouped[h.date]) grouped[h.date] = [];
    grouped[h.date].push(h);
  }
  return grouped;
}

interface HolidayContextValue {
  holidays: Record<string, Holiday[]>;
  loadHolidays: (year: number, countryCode: string) => Promise<void>;
}

const HolidayContext = createContext<HolidayContextValue | null>(null);

export function HolidayProvider({ children }: { children: React.ReactNode }) {
  const [holidays, setHolidays] = useState<Record<string, Holiday[]>>({});

  const loadHolidays = useCallback(async (year: number, countryCode: string) => {
    const data = await fetchHolidays(year, countryCode);
    setHolidays(groupHolidaysByDate(data));
  }, []);

  return (
    <HolidayContext.Provider value={{ holidays, loadHolidays }}>
      {children}
    </HolidayContext.Provider>
  );
}

export function useHolidays() {
  const ctx = useContext(HolidayContext);
  if (!ctx) throw new Error('useHolidays must be used within HolidayProvider');
  return ctx;
}
