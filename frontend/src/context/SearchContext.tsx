import React, { createContext, useContext, useState, useCallback } from 'react';

interface SearchContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeLabels: Set<string>;
  toggleLabel: (color: string) => void;
  clearLabels: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQueryRaw] = useState('');
  const [activeLabels, setActiveLabels] = useState<Set<string>>(new Set());

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryRaw(query);
  }, []);

  const toggleLabel = useCallback((color: string) => {
    setActiveLabels((prev) => {
      const next = new Set(prev);
      if (next.has(color)) {
        next.delete(color);
      } else {
        next.add(color);
      }
      return next;
    });
  }, []);

  const clearLabels = useCallback(() => {
    setActiveLabels(new Set());
  }, []);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, activeLabels, toggleLabel, clearLabels }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
