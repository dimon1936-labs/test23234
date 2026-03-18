import { apiClient } from './apiClient';
import type { Holiday } from '../types/holiday';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 20;

interface CacheEntry {
  data: Holiday[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function pruneCache() {
  if (cache.size <= MAX_CACHE_SIZE) return;
  const oldest = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
  while (cache.size > MAX_CACHE_SIZE) {
    cache.delete(oldest.shift()![0]);
  }
}

export async function fetchHolidays(year: number, countryCode: string): Promise<Holiday[]> {
  const key = `${year}-${countryCode}`;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const { data } = await apiClient.get<Holiday[]>('/holidays', {
      params: { year, countryCode },
    });
    cache.set(key, { data, timestamp: Date.now() });
    pruneCache();
    return data;
  } catch (e) {
    console.error('Failed to fetch holidays:', e);
    return [];
  }
}
