import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./apiClient', () => {
  const client = {
    get: vi.fn(),
  };
  return { apiClient: client };
});

import { fetchHolidays } from './holidaysApi';
import { apiClient } from './apiClient';

describe('holidaysApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch holidays from API', async () => {
    const holidays = [{ date: '2026-01-01', localName: 'NY', name: 'New Year', countryCode: 'UA' }];
    (apiClient.get as any).mockResolvedValue({ data: holidays });

    const result = await fetchHolidays(2026, 'UA');

    expect(result).toEqual(holidays);
    expect(apiClient.get).toHaveBeenCalledWith('/holidays', {
      params: { year: 2026, countryCode: 'UA' },
    });
  });

  it('should return cached data on second call', async () => {
    const holidays = [{ date: '2026-01-01', localName: 'NY', name: 'New Year', countryCode: 'US' }];
    (apiClient.get as any).mockResolvedValue({ data: holidays });

    await fetchHolidays(2026, 'US');
    const result = await fetchHolidays(2026, 'US');

    expect(result).toEqual(holidays);
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });

  it('should return empty array on error', async () => {
    (apiClient.get as any).mockRejectedValue(new Error('Network'));

    const result = await fetchHolidays(9999, 'ZZ');
    expect(result).toEqual([]);
  });
});
