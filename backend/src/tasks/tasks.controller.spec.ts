import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

const mockTask = {
  id: '11111111-1111-1111-1111-111111111111',
  title: 'Test',
  date: new Date('2026-03-16'),
  order: 0,
  labels: [],
};

describe('TasksController', () => {
  let controller: TasksController;
  let service: jest.Mocked<TasksService>;

  beforeEach(async () => {
    const mockService = {
      getTasksByMonth: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      reorderTasks: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockService }],
    }).compile();

    controller = module.get(TasksController);
    service = module.get(TasksService);
  });

  describe('getTasksByMonth', () => {
    it('should delegate to service with parsed params', async () => {
      service.getTasksByMonth.mockResolvedValue([mockTask] as any);
      const result = await controller.getTasksByMonth(3, 2026);
      expect(service.getTasksByMonth).toHaveBeenCalledWith(3, 2026);
      expect(result).toEqual([mockTask]);
    });
  });

  describe('createTask', () => {
    it('should delegate to service and return created task', async () => {
      service.createTask.mockResolvedValue(mockTask as any);
      const dto = { title: 'Test', date: '2026-03-16' };
      const result = await controller.createTask(dto);
      expect(service.createTask).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('should delegate to service with id and dto', async () => {
      service.updateTask.mockResolvedValue({ ...mockTask, title: 'Updated' } as any);
      const result = await controller.updateTask(mockTask.id, { title: 'Updated' });
      expect(service.updateTask).toHaveBeenCalledWith(mockTask.id, { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });
  });

  describe('deleteTask', () => {
    it('should delegate to service', async () => {
      service.deleteTask.mockResolvedValue(undefined);
      await controller.deleteTask(mockTask.id);
      expect(service.deleteTask).toHaveBeenCalledWith(mockTask.id);
    });
  });

  describe('reorderTasks', () => {
    it('should delegate to service', async () => {
      service.reorderTasks.mockResolvedValue([mockTask] as any);
      const dto = { taskIds: [mockTask.id], date: '2026-03-16' };
      const result = await controller.reorderTasks(dto);
      expect(service.reorderTasks).toHaveBeenCalledWith(dto);
      expect(result).toEqual([mockTask]);
    });
  });
});
