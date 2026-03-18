import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Labels (e2e)', () => {
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
    await prisma.label.deleteMany();
    await app.close();
  });

  let createdLabelId: string;

  describe('POST /api/labels', () => {
    it('should create a label', () => {
      return request(app.getHttpServer())
        .post('/api/labels')
        .send({ color: '#E2E2E2', name: 'E2E Label' })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.color).toBe('#E2E2E2');
          expect(res.body.name).toBe('E2E Label');
          createdLabelId = res.body.id;
        });
    });

    it('should upsert label with same color', () => {
      return request(app.getHttpServer())
        .post('/api/labels')
        .send({ color: '#E2E2E2', name: 'Updated Name' })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBe(createdLabelId);
          expect(res.body.name).toBe('Updated Name');
        });
    });

    it('should reject invalid hex color', () => {
      return request(app.getHttpServer())
        .post('/api/labels')
        .send({ color: 'red' })
        .expect(400);
    });
  });

  describe('GET /api/labels', () => {
    it('should return all labels', () => {
      return request(app.getHttpServer())
        .get('/api/labels')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('DELETE /api/labels/:id', () => {
    it('should delete label', () => {
      return request(app.getHttpServer())
        .delete(`/api/labels/${createdLabelId}`)
        .expect(204);
    });

    it('should return 404 for non-existent label', () => {
      return request(app.getHttpServer())
        .delete('/api/labels/00000000-0000-4000-a000-000000000000')
        .expect(404);
    });
  });
});
