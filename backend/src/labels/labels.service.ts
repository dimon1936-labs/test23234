import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabelDto } from './dto/create-label.dto';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.label.findMany({
      orderBy: { color: 'asc' },
    });
  }

  async create(dto: CreateLabelDto) {
    return this.prisma.label.upsert({
      where: { color: dto.color },
      update: { name: dto.name ?? '' },
      create: { color: dto.color, name: dto.name ?? '' },
    });
  }

  async delete(id: string): Promise<void> {
    const label = await this.prisma.label.findUnique({ where: { id } });
    if (!label) {
      throw new NotFoundException(`Label with id "${id}" not found`);
    }
    await this.prisma.label.delete({ where: { id } });
  }
}
