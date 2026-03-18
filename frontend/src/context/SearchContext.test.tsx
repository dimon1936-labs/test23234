import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { SearchProvider, useSearch } from './SearchContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return <SearchProvider>{children}</SearchProvider>;
}

describe('SearchContext', () => {
  it('should throw when used outside provider', () => {
    expect(() => renderHook(() => useSearch())).toThrow(
      'useSearch must be used within SearchProvider',
    );
  });

  it('should have empty defaults', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    expect(result.current.searchQuery).toBe('');
    expect(result.current.activeLabels.size).toBe(0);
  });

  it('should update search query', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => result.current.setSearchQuery('test'));
    expect(result.current.searchQuery).toBe('test');
  });

  it('should toggle label on and off', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });

    act(() => result.current.toggleLabel('#FF0000'));
    expect(result.current.activeLabels.has('#FF0000')).toBe(true);

    act(() => result.current.toggleLabel('#FF0000'));
    expect(result.current.activeLabels.has('#FF0000')).toBe(false);
  });

  it('should support multiple active labels', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => {
      result.current.toggleLabel('#FF0000');
      result.current.toggleLabel('#00FF00');
    });
    expect(result.current.activeLabels.size).toBe(2);
  });

  it('should clear all labels', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => {
      result.current.toggleLabel('#FF0000');
      result.current.toggleLabel('#00FF00');
    });
    act(() => result.current.clearLabels());
    expect(result.current.activeLabels.size).toBe(0);
  });
});
