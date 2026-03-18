import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get tasks by month and year' })
  @ApiQuery({ name: 'month', type: Number, example: 3, description: '0-indexed month (0 = January)' })
  @ApiQuery({ name: 'year', type: Number, example: 2026 })
  @ApiResponse({ status: 200, description: 'Tasks grouped by date' })
  getTasksByMonth(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.tasksService.getTasksByMonth(month, year);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  createTask(@Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(dto);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder tasks within a date' })
  @ApiResponse({ status: 200, description: 'Tasks reordered' })
  reorderTasks(@Body() dto: ReorderTasksDto) {
    return this.tasksService.reorderTasks(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', type: String, description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateTask(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', type: String, description: 'Task UUID' })
  @ApiResponse({ status: 204, description: 'Task deleted' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  deleteTask(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.tasksService.deleteTask(id);
  }
}
