import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

export type ViewMode = 'month' | 'week';

interface NavigationState {
  currentMonth: number;
  currentYear: number;
  viewMode: ViewMode;
  currentWeekStart: Date;
  countryCode: string;
}

type NavigationAction =
  | { type: 'SET_MONTH_YEAR'; month: number; year: number }
  | { type: 'SET_VIEW_MODE'; viewMode: ViewMode }
  | { type: 'SET_WEEK_START'; weekStart: Date }
  | { type: 'SET_COUNTRY'; countryCode: string };

const now = new Date();

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

const initialState: NavigationState = {
  currentMonth: now.getMonth(),
  currentYear: now.getFullYear(),
  viewMode: 'month',
  currentWeekStart: getMonday(now),
  countryCode: 'UA',
};

function reducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'SET_MONTH_YEAR':
      return { ...state, currentMonth: action.month, currentYear: action.year };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.viewMode };
    case 'SET_WEEK_START':
      return { ...state, currentWeekStart: action.weekStart };
    case 'SET_COUNTRY':
      return { ...state, countryCode: action.countryCode };
    default:
      return state;
  }
}

interface NavigationActions {
  setMonthYear: (month: number, year: number) => void;
  setViewMode: (mode: ViewMode) => void;
  setWeekStart: (weekStart: Date) => void;
  setCountry: (code: string) => void;
  goToToday: () => void;
}

interface NavigationContextValue {
  state: NavigationState;
  actions: NavigationActions;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setMonthYear = useCallback((month: number, year: number) => {
    dispatch({ type: 'SET_MONTH_YEAR', month, year });
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', viewMode: mode });
  }, []);

  const setWeekStart = useCallback((weekStart: Date) => {
    dispatch({ type: 'SET_WEEK_START', weekStart });
  }, []);

  const setCountry = useCallback((code: string) => {
    dispatch({ type: 'SET_COUNTRY', countryCode: code });
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    dispatch({ type: 'SET_MONTH_YEAR', month: today.getMonth(), year: today.getFullYear() });
    dispatch({ type: 'SET_WEEK_START', weekStart: getMonday(today) });
  }, []);

  const actions = useMemo<NavigationActions>(
    () => ({ setMonthYear, setViewMode, setWeekStart, setCountry, goToToday }),
    [setMonthYear, setViewMode, setWeekStart, setCountry, goToToday],
  );

  return (
    <NavigationContext.Provider value={{ state, actions }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
