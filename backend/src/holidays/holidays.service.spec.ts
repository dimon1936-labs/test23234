import { Test, TestingModule } from '@nestjs/testing';
import { HolidaysService } from './holidays.service';

const mockHolidays = [
  { date: '2026-01-01', localName: "Новий рік", name: "New Year's Day", countryCode: 'UA' },
  { date: '2026-01-07', localName: 'Різдво', name: 'Christmas Day', countryCode: 'UA' },
];

describe('HolidaysService', () => {
  let service: HolidaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HolidaysService],
    }).compile();

    service = module.get(HolidaysService);
    jest.restoreAllMocks();
  });

  describe('getHolidays', () => {
    it('should fetch holidays from nager.at API', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockHolidays,
      } as Response);

      const result = await service.getHolidays(2026, 'UA');

      expect(result).toEqual(mockHolidays);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://date.nager.at/api/v3/PublicHolidays/2026/UA',
      );
    });

    it('should return cached data on second call', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockHolidays,
      } as Response);

      await service.getHolidays(2026, 'UA');
      const result = await service.getHolidays(2026, 'UA');

      expect(result).toEqual(mockHolidays);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return cached data when API returns error', async () => {
      // First call succeeds
      jest.spyOn(global, 'fetch')
        .mockResolvedValueOnce({ ok: true, json: async () => mockHolidays } as Response)
        // Expire cache manually
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response);

      await service.getHolidays(2026, 'UA');

      // Force cache expiry by accessing private field
      const cache = (service as any).cache as Map<string, any>;
      const entry = cache.get('2026-UA')!;
      entry.expiresAt = 0;

      const result = await service.getHolidays(2026, 'UA');
      expect(result).toEqual(mockHolidays);
    });

    it('should return empty array when API fails and no cache', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await service.getHolidays(2026, 'UA');
      expect(result).toEqual([]);
    });

    it('should prune cache when max size exceeded', async () => {
      jest.spyOn(global, 'fetch').mockImplementation(async (url) => ({
        ok: true,
        json: async () => [{ date: '2026-01-01', localName: 'Test', name: 'Test', countryCode: 'XX' }],
      } as Response));

      // Fill cache beyond limit
      for (let i = 0; i < 55; i++) {
        const cache = (service as any).cache as Map<string, any>;
        cache.set(`key-${i}`, { data: [], expiresAt: Date.now() + i * 1000 });
      }

      await service.getHolidays(2099, 'US');

      const cache = (service as any).cache as Map<string, any>;
      expect(cache.size).toBeLessThan(55);
    });
  });
});
