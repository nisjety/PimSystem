import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('API Gateway (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token from Clerk (mock for testing)
    authToken = 'test_token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('services');
        });
    });
  });

  describe('Monolith Service', () => {
    it('/api/products (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('/api/categories (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('/api/ingredients (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/ingredients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('AI Service', () => {
    it('/api/ai/analyze (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/ai/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Test analysis' })
        .expect(200);
    });

    it('/api/ai/similar-products (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/ai/similar-products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ productId: '1' })
        .expect(200);
    });
  });

  describe('Authentication', () => {
    it('should reject requests without auth token', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .expect(401);
    });

    it('should reject requests with invalid auth token', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });
}); 