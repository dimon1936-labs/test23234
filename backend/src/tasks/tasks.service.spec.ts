import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

const mockTask = {
  id: '11111111-1111-1111-1111-111111111111',
  title: 'Test task',
  date: new Date('2026-03-16'),
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  labels: [],
};

describe('TasksService', () => {
  let service: TasksService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      task: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        aggregate: jest.fn(),
      },
      taskLabel: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TasksService);
  });

  describe('getTasksByMonth', () => {
    it('should query tasks within the correct date range', async () => {
      prisma.task.findMany.mockResolvedValue([mockTask]);

      const result = await service.getTasksByMonth(3, 2026);

      expect(result).toEqual([mockTask]);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          date: {
            gte: new Date(2026, 2, 1),
            lte: new Date(2026, 3, 0),
          },
        },
        include: { labels: { include: { label: true } } },
        orderBy: [{ date: 'asc' }, { order: 'asc' }],
      });
    });

    it('should return empty array when no tasks exist', async () => {
      prisma.task.findMany.mockResolvedValue([]);
      const result = await service.getTasksByMonth(1, 2026);
      expect(result).toEqual([]);
    });
  });

  describe('createTask', () => {
    it('should create a task with auto-incremented order', async () => {
      prisma.task.aggregate.mockResolvedValue({ _max: { order: 2 } });
      prisma.task.create.mockResolvedValue({ ...mockTask, order: 3 });

      const result = await service.createTask({ title: 'Test task', date: '2026-03-16' });

      expect(result.order).toBe(3);
      expect(prisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Test task',
            order: 3,
          }),
        }),
      );
    });

    it('should start order at 0 when no tasks exist for date', async () => {
      prisma.task.aggregate.mockResolvedValue({ _max: { order: null } });
      prisma.task.create.mockResolvedValue({ ...mockTask, order: 0 });

      await service.createTask({ title: 'First', date: '2026-03-16' });

      expect(prisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ order: 0 }),
        }),
      );
    });

    it('should create task with label associations', async () => {
      const labelId = '22222222-2222-2222-2222-222222222222';
      prisma.task.aggregate.mockResolvedValue({ _max: { order: null } });
      prisma.task.create.mockResolvedValue({ ...mockTask, labels: [{ labelId }] });

      await service.createTask({
        title: 'With label',
        date: '2026-03-16',
        labelIds: [labelId],
      });

      expect(prisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            labels: { create: [{ labelId }] },
          }),
        }),
      );
    });
  });

  describe('updateTask', () => {
    it('should throw NotFoundException when task does not exist', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTask('nonexistent-id', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update task within a transaction', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);
      const updatedTask = { ...mockTask, title: 'Updated' };
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          taskLabel: { deleteMany: jest.fn(), createMany: jest.fn() },
          task: { update: jest.fn().mockResolvedValue(updatedTask) },
        };
        return fn(tx);
      });

      const result = await service.updateTask(mockTask.id, { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should replace labels when labelIds provided', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);
      const newLabelId = '33333333-3333-3333-3333-333333333333';
      const mockTx = {
        taskLabel: { deleteMany: jest.fn(), createMany: jest.fn() },
        task: { update: jest.fn().mockResolvedValue(mockTask) },
      };
      prisma.$transaction.mockImplementation(async (fn: any) => fn(mockTx));

      await service.updateTask(mockTask.id, { labelIds: [newLabelId] });

      expect(mockTx.taskLabel.deleteMany).toHaveBeenCalledWith({
        where: { taskId: mockTask.id },
      });
      expect(mockTx.taskLabel.createMany).toHaveBeenCalledWith({
        data: [{ taskId: mockTask.id, labelId: newLabelId }],
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.task.delete.mockResolvedValue(mockTask);

      await service.deleteTask(mockTask.id);

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: mockTask.id },
      });
    });

    it('should throw NotFoundException when task does not exist', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.deleteTask('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reorderTasks', () => {
    it('should update order for all tasks in transaction', async () => {
      const taskIds = ['id-1', 'id-2', 'id-3'];
      const reorderedTasks = taskIds.map((id, i) => ({ ...mockTask, id, order: i }));

      prisma.$transaction.mockResolvedValue(reorderedTasks);
      prisma.task.findMany.mockResolvedValue(reorderedTasks);

      const result = await service.reorderTasks({
        taskIds,
        date: '2026-03-16',
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      // $transaction receives an array of Prisma promises (one update per task)
      const txArg = prisma.$transaction.mock.calls[0][0];
      expect(txArg).toHaveLength(3);
      expect(result).toEqual(reorderedTasks);
    });
  });
});
