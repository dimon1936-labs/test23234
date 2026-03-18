import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { NavigationProvider, useNavigation } from './NavigationContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}

describe('NavigationContext', () => {
  it('should throw when used outside provider', () => {
    expect(() => renderHook(() => useNavigation())).toThrow(
      'useNavigation must be used within NavigationProvider',
    );
  });

  it('should have correct default state', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });
    const now = new Date();
    expect(result.current.state.currentMonth).toBe(now.getMonth());
    expect(result.current.state.currentYear).toBe(now.getFullYear());
    expect(result.current.state.viewMode).toBe('month');
    expect(result.current.state.countryCode).toBe('UA');
  });

  it('should update month and year', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });
    act(() => result.current.actions.setMonthYear(5, 2027));
    expect(result.current.state.currentMonth).toBe(5);
    expect(result.current.state.currentYear).toBe(2027);
  });

  it('should toggle view mode', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });
    act(() => result.current.actions.setViewMode('week'));
    expect(result.current.state.viewMode).toBe('week');
    act(() => result.current.actions.setViewMode('month'));
    expect(result.current.state.viewMode).toBe('month');
  });

  it('should update country code', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });
    act(() => result.current.actions.setCountry('US'));
    expect(result.current.state.countryCode).toBe('US');
  });

  it('should update week start', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });
    const newStart = new Date(2026, 5, 1);
    act(() => result.current.actions.setWeekStart(newStart));
    expect(result.current.state.currentWeekStart).toEqual(newStart);
  });

  it('goToToday should reset to current date', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });
    // Navigate away
    act(() => result.current.actions.setMonthYear(0, 2020));
    // Go back
    act(() => result.current.actions.goToToday());
    const now = new Date();
    expect(result.current.state.currentMonth).toBe(now.getMonth());
    expect(result.current.state.currentYear).toBe(now.getFullYear());
  });
});
