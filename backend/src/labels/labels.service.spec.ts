import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { PrismaService } from '../prisma/prisma.service';

const mockLabel = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  color: '#4A90D9',
  name: 'Blue',
};

describe('LabelsService', () => {
  let service: LabelsService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      label: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabelsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(LabelsService);
  });

  describe('getAll', () => {
    it('should return labels sorted by color', async () => {
      const labels = [mockLabel, { ...mockLabel, id: 'bbb', color: '#FF0000' }];
      prisma.label.findMany.mockResolvedValue(labels);

      const result = await service.getAll();

      expect(result).toEqual(labels);
      expect(prisma.label.findMany).toHaveBeenCalledWith({
        orderBy: { color: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should upsert label by color', async () => {
      prisma.label.upsert.mockResolvedValue(mockLabel);

      const result = await service.create({ color: '#4A90D9', name: 'Blue' });

      expect(result).toEqual(mockLabel);
      expect(prisma.label.upsert).toHaveBeenCalledWith({
        where: { color: '#4A90D9' },
        update: { name: 'Blue' },
        create: { color: '#4A90D9', name: 'Blue' },
      });
    });

    it('should default name to empty string when not provided', async () => {
      prisma.label.upsert.mockResolvedValue({ ...mockLabel, name: '' });

      await service.create({ color: '#4A90D9' });

      expect(prisma.label.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { name: '' },
          create: { color: '#4A90D9', name: '' },
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete existing label', async () => {
      prisma.label.findUnique.mockResolvedValue(mockLabel);
      prisma.label.delete.mockResolvedValue(mockLabel);

      await service.delete(mockLabel.id);

      expect(prisma.label.delete).toHaveBeenCalledWith({
        where: { id: mockLabel.id },
      });
    });

    it('should throw NotFoundException for non-existent label', async () => {
      prisma.label.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
