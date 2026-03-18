import type React from 'react';
import { NavigationProvider } from './NavigationContext';
import { TaskProvider } from './TaskContext';
import { HolidayProvider } from './HolidayContext';
import { SearchProvider } from './SearchContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider>
      <TaskProvider>
        <HolidayProvider>
          <SearchProvider>
            {children}
          </SearchProvider>
        </HolidayProvider>
      </TaskProvider>
    </NavigationProvider>
  );
}
