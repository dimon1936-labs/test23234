import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { HolidaysController } from './holidays.controller';
import { HolidaysService } from './holidays.service';

describe('HolidaysController', () => {
  let controller: HolidaysController;
  let service: jest.Mocked<HolidaysService>;

  beforeEach(async () => {
    const mockService = {
      getHolidays: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HolidaysController],
      providers: [{ provide: HolidaysService, useValue: mockService }],
    }).compile();

    controller = module.get(HolidaysController);
    service = module.get(HolidaysService);
  });

  it('should return holidays for valid country code', async () => {
    const holidays = [{ date: '2026-01-01', localName: 'NY', name: 'New Year', countryCode: 'UA' }];
    service.getHolidays.mockResolvedValue(holidays);

    const result = await controller.getHolidays(2026, 'UA');

    expect(result).toEqual(holidays);
    expect(service.getHolidays).toHaveBeenCalledWith(2026, 'UA');
  });

  it('should accept lowercase country code', async () => {
    await controller.getHolidays(2026, 'ua');
    expect(service.getHolidays).toHaveBeenCalledWith(2026, 'UA');
  });

  it('should throw BadRequestException for invalid country code', async () => {
    expect(() => controller.getHolidays(2026, 'XX')).toThrow(BadRequestException);
  });

  it('should throw BadRequestException for empty country code', async () => {
    expect(() => controller.getHolidays(2026, '')).toThrow(BadRequestException);
  });

  it('should throw BadRequestException for undefined country code', async () => {
    expect(() => controller.getHolidays(2026, undefined as any)).toThrow(BadRequestException);
  });
});
