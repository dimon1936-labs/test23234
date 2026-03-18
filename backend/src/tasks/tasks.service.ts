import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';

const TASK_INCLUDE = {
  labels: { include: { label: true } },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTasksByMonth(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.prisma.task.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      include: TASK_INCLUDE,
      orderBy: [{ date: 'asc' }, { order: 'asc' }],
    });
  }

  async createTask(dto: CreateTaskDto) {
    const date = new Date(dto.date);

    const maxOrder = await this.prisma.task.aggregate({
      _max: { order: true },
      where: { date },
    });

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        date,
        order: (maxOrder._max.order ?? -1) + 1,
        labels: dto.labelIds?.length
          ? { create: dto.labelIds.map((labelId) => ({ labelId })) }
          : undefined,
      },
      include: TASK_INCLUDE,
    });

    this.logger.log(`Task created: ${task.id} on ${dto.date}`);
    return task;
  }

  async updateTask(id: string, dto: UpdateTaskDto) {
    await this.findTaskOrThrow(id);

    return this.prisma.$transaction(async (tx) => {
      if (dto.labelIds !== undefined) {
        await tx.taskLabel.deleteMany({ where: { taskId: id } });
        if (dto.labelIds.length > 0) {
          await tx.taskLabel.createMany({
            data: dto.labelIds.map((labelId) => ({ taskId: id, labelId })),
          });
        }
      }

      const data: Prisma.TaskUpdateInput = {};
      if (dto.title !== undefined) data.title = dto.title;
      if (dto.order !== undefined) data.order = dto.order;
      if (dto.date !== undefined) data.date = new Date(dto.date);

      return tx.task.update({
        where: { id },
        data,
        include: TASK_INCLUDE,
      });
    });
  }

  async deleteTask(id: string): Promise<void> {
    await this.findTaskOrThrow(id);
    await this.prisma.task.delete({ where: { id } });
    this.logger.log(`Task deleted: ${id}`);
  }

  async reorderTasks(dto: ReorderTasksDto) {
    const date = new Date(dto.date);

    await this.prisma.$transaction(
      dto.taskIds.map((taskId, index) =>
        this.prisma.task.update({
          where: { id: taskId },
          data: { order: index, date },
        }),
      ),
    );

    this.logger.log(
      `Tasks reordered for ${dto.date}: ${dto.taskIds.length} tasks`,
    );

    return this.prisma.task.findMany({
      where: { date },
      include: TASK_INCLUDE,
      orderBy: { order: 'asc' },
    });
  }

  private async findTaskOrThrow(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    return task;
  }
}
