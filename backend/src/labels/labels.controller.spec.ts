import { Test, TestingModule } from '@nestjs/testing';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';

const mockLabel = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  color: '#4A90D9',
  name: 'Blue',
};

describe('LabelsController', () => {
  let controller: LabelsController;
  let service: jest.Mocked<LabelsService>;

  beforeEach(async () => {
    const mockService = {
      getAll: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelsController],
      providers: [{ provide: LabelsService, useValue: mockService }],
    }).compile();

    controller = module.get(LabelsController);
    service = module.get(LabelsService);
  });

  it('getAll should return all labels', async () => {
    service.getAll.mockResolvedValue([mockLabel] as any);
    const result = await controller.getAll();
    expect(result).toEqual([mockLabel]);
  });

  it('create should delegate to service', async () => {
    service.create.mockResolvedValue(mockLabel as any);
    const dto = { color: '#4A90D9', name: 'Blue' };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockLabel);
  });

  it('delete should delegate to service', async () => {
    service.delete.mockResolvedValue(undefined);
    await controller.delete(mockLabel.id);
    expect(service.delete).toHaveBeenCalledWith(mockLabel.id);
  });
});
