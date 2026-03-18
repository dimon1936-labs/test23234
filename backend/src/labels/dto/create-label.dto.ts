import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabelDto {
  @ApiProperty({ example: '#4A90D9', description: 'Hex color code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color!: string;

  @ApiPropertyOptional({ example: 'Blue', description: 'Label display name' })
  @IsOptional()
  @IsString()
  name?: string;
}
