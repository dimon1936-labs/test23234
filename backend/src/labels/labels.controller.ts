import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';

@ApiTags('labels')
@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all labels' })
  @ApiResponse({ status: 200, description: 'List of labels sorted by color' })
  getAll() {
    return this.labelsService.getAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or upsert a label by color' })
  @ApiResponse({ status: 201, description: 'Label created/updated' })
  @ApiResponse({ status: 400, description: 'Invalid hex color' })
  create(@Body() dto: CreateLabelDto) {
    return this.labelsService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a label' })
  @ApiParam({ name: 'id', type: String, description: 'Label UUID' })
  @ApiResponse({ status: 204, description: 'Label deleted' })
  @ApiResponse({ status: 404, description: 'Label not found' })
  delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.labelsService.delete(id);
  }
}
