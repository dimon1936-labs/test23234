import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.taskLabel.deleteMany();
    await prisma.task.deleteMany();
    await prisma.label.deleteMany();
    await app.close();
  });

  let createdTaskId: string;

  describe('POST /api/tasks', () => {
    it('should create a task', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .send({ title: 'E2E Task', date: '2026-03-16' })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.title).toBe('E2E Task');
          expect(res.body.order).toBe(0);
          createdTaskId = res.body.id;
        });
    });

    it('should reject invalid body', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .send({ title: '', date: 'bad' })
        .expect(400);
    });

    it('should reject missing title', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .send({ date: '2026-03-16' })
        .expect(400);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return tasks for month', () => {
      return request(app.getHttpServer())
        .get('/api/tasks')
        .query({ month: 3, year: 2026 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
          expect(res.body[0].labels).toBeDefined();
        });
    });

    it('should reject missing query params', () => {
      return request(app.getHttpServer())
        .get('/api/tasks')
        .expect(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task title', () => {
      return request(app.getHttpServer())
        .put(`/api/tasks/${createdTaskId}`)
        .send({ title: 'Updated E2E Task' })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated E2E Task');
        });
    });

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .put('/api/tasks/00000000-0000-4000-a000-000000000000')
        .send({ title: 'Nope' })
        .expect(404);
    });

    it('should reject invalid UUID', () => {
      return request(app.getHttpServer())
        .put('/api/tasks/not-a-uuid')
        .send({ title: 'Nope' })
        .expect(400);
    });
  });

  describe('PUT /api/tasks/reorder', () => {
    it('should reorder tasks', async () => {
      // Create a second task
      const res = await request(app.getHttpServer())
        .post('/api/tasks')
        .send({ title: 'E2E Task 2', date: '2026-03-16' })
        .expect(201);

      const secondId = res.body.id;

      return request(app.getHttpServer())
        .put('/api/tasks/reorder')
        .send({ taskIds: [secondId, createdTaskId], date: '2026-03-16' })
        .expect(200)
        .expect((res) => {
          expect(res.body[0].id).toBe(secondId);
          expect(res.body[0].order).toBe(0);
          expect(res.body[1].id).toBe(createdTaskId);
          expect(res.body[1].order).toBe(1);
        });
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task', () => {
      return request(app.getHttpServer())
        .delete(`/api/tasks/${createdTaskId}`)
        .expect(204);
    });

    it('should return 404 after deletion', () => {
      return request(app.getHttpServer())
        .put(`/api/tasks/${createdTaskId}`)
        .send({ title: 'Should fail' })
        .expect(404);
    });
  });
});
