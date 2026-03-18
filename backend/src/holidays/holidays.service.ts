import { Injectable, Logger } from '@nestjs/common';

export interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
}

interface CacheEntry {
  data: Holiday[];
  expiresAt: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 50;

@Injectable()
export class HolidaysService {
  private readonly logger = new Logger(HolidaysService.name);
  private readonly cache = new Map<string, CacheEntry>();

  async getHolidays(year: number, countryCode: string): Promise<Holiday[]> {
    const key = `${year}-${countryCode}`;
    const cached = this.cache.get(key);

    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
      );

      if (!response.ok) {
        this.logger.warn(
          `Nager API returned ${response.status} for ${year}/${countryCode}`,
        );
        return cached?.data ?? [];
      }

      const data = (await response.json()) as Holiday[];
      this.pruneCache();
      this.cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch holidays for ${year}/${countryCode}`,
        error instanceof Error ? error.stack : String(error),
      );
      return cached?.data ?? [];
    }
  }

  private pruneCache(): void {
    if (this.cache.size < MAX_CACHE_SIZE) return;

    const entries = [...this.cache.entries()].sort(
      (a, b) => a[1].expiresAt - b[1].expiresAt,
    );

    const toRemove = entries.slice(0, Math.ceil(this.cache.size / 2));
    for (const [key] of toRemove) {
      this.cache.delete(key);
    }
  }
}
