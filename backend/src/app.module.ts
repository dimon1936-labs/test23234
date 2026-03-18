import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { HolidaysModule } from './holidays/holidays.module';
import { LabelsModule } from './labels/labels.module';

@Module({
  imports: [PrismaModule, TasksModule, HolidaysModule, LabelsModule],
})
export class AppModule {}
