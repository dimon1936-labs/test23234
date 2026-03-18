import { IsArray, IsUUID, IsDateString, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderTasksDto {
  @ApiProperty({ example: ['uuid-1', 'uuid-2'], description: 'Task IDs in desired order' })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  taskIds!: string[];

  @ApiProperty({ example: '2026-03-16', description: 'Date of the tasks being reordered' })
  @IsDateString()
  date!: string;
}
