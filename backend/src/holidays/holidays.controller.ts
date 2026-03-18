import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { HolidaysService } from './holidays.service';

const VALID_COUNTRY_CODES = new Set([
  'UA', 'US', 'GB', 'DE', 'PL', 'FR', 'CZ', 'AT',
  'CA', 'AU', 'NL', 'IT', 'ES', 'SE', 'NO', 'DK',
  'FI', 'BE', 'CH', 'JP', 'KR', 'BR', 'MX', 'IE',
]);

@ApiTags('holidays')
@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Get()
  @ApiOperation({ summary: 'Get public holidays for a country and year' })
  @ApiQuery({ name: 'year', type: Number, example: 2026 })
  @ApiQuery({ name: 'countryCode', type: String, example: 'UA', description: 'ISO 3166-1 alpha-2 country code' })
  @ApiResponse({ status: 200, description: 'List of public holidays' })
  @ApiResponse({ status: 400, description: 'Invalid country code' })
  getHolidays(
    @Query('year', ParseIntPipe) year: number,
    @Query('countryCode') countryCode: string,
  ) {
    const code = countryCode?.toUpperCase();
    if (!code || !VALID_COUNTRY_CODES.has(code)) {
      throw new BadRequestException(
        `Invalid countryCode "${countryCode}". Must be a valid ISO 3166-1 alpha-2 code.`,
      );
    }
    return this.holidaysService.getHolidays(year, code);
  }
}
