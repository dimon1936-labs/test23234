import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Holidays (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/holidays', () => {
    it('should return holidays for valid params', () => {
      return request(app.getHttpServer())
        .get('/api/holidays')
        .query({ year: 2026, countryCode: 'UA' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('date');
            expect(res.body[0]).toHaveProperty('localName');
            expect(res.body[0]).toHaveProperty('name');
          }
        });
    });

    it('should reject invalid country code', () => {
      return request(app.getHttpServer())
        .get('/api/holidays')
        .query({ year: 2026, countryCode: 'XX' })
        .expect(400);
    });

    it('should reject missing year', () => {
      return request(app.getHttpServer())
        .get('/api/holidays')
        .query({ countryCode: 'UA' })
        .expect(400);
    });

    it('should accept lowercase country code', () => {
      return request(app.getHttpServer())
        .get('/api/holidays')
        .query({ year: 2026, countryCode: 'ua' })
        .expect(200);
    });
  });
});
