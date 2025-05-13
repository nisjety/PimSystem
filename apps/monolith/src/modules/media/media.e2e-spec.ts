import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MediaType } from './entities/media.entity';

describe('MediaController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testProductId: string;
  let testMediaId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Create a test product
    const testProduct = await prismaService.product.create({
      data: {
        name: 'Test Product',
        description: 'Test product for media e2e tests',
        sku: 'TEST-SKU-MEDIA', // Added required field
        price: 99.99, // Added required field
      },
    });
    testProductId = testProduct.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prismaService.media.deleteMany({
      where: { productId: testProductId },
    });
    await prismaService.product.delete({
      where: { id: testProductId },
    });
    await app.close();
  });

  describe('/media (POST)', () => {
    it('should create a new media entry', () => {
      return request(app.getHttpServer())
        .post('/media')
        .send({
          name: 'test-image.jpg',
          url: 'https://example.com/test.jpg',
          type: MediaType.IMAGE,
          size: 1024,
          mimeType: 'image/jpeg',
          productId: testProductId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('test-image.jpg');
          expect(res.body.type).toBe(MediaType.IMAGE);
          testMediaId = res.body.id;
        });
    });

    it('should fail to create media entry for non-existent product', () => {
      return request(app.getHttpServer())
        .post('/media')
        .send({
          name: 'test-image.jpg',
          url: 'https://example.com/test.jpg',
          type: MediaType.IMAGE,
          size: 1024,
          mimeType: 'image/jpeg',
          productId: 'non-existent',
        })
        .expect(404);
    });
  });

  describe('/media (GET)', () => {
    it('should return paginated media entries', () => {
      return request(app.getHttpServer())
        .get('/media')
        .query({ skip: 0, take: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.items)).toBe(true);
        });
    });

    it('should filter media entries by product ID', () => {
      return request(app.getHttpServer())
        .get('/media')
        .query({ productId: testProductId })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.items)).toBe(true);
          res.body.items.forEach((item) => {
            expect(item.productId).toBe(testProductId);
          });
        });
    });

    it('should filter media entries by type', () => {
      return request(app.getHttpServer())
        .get('/media')
        .query({ type: MediaType.IMAGE })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.items)).toBe(true);
          res.body.items.forEach((item) => {
            expect(item.type).toBe(MediaType.IMAGE);
          });
        });
    });
  });

  describe('/media/:id (GET)', () => {
    it('should return a specific media entry', () => {
      return request(app.getHttpServer())
        .get(`/media/${testMediaId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testMediaId);
          expect(res.body.type).toBe(MediaType.IMAGE);
        });
    });

    it('should return 404 for non-existent media entry', () => {
      return request(app.getHttpServer())
        .get('/media/non-existent')
        .expect(404);
    });
  });

  describe('/media/product/:productId (GET)', () => {
    it('should return media entries for a product', () => {
      return request(app.getHttpServer())
        .get(`/media/product/${testProductId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((item) => {
            expect(item.productId).toBe(testProductId);
          });
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/media/product/non-existent')
        .expect(404);
    });
  });

  describe('/media/:id (PATCH)', () => {
    it('should update a media entry', () => {
      const updatedName = 'updated-image.jpg';
      return request(app.getHttpServer())
        .patch(`/media/${testMediaId}`)
        .send({ name: updatedName })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testMediaId);
          expect(res.body.name).toBe(updatedName);
        });
    });

    it('should return 404 for non-existent media entry', () => {
      return request(app.getHttpServer())
        .patch('/media/non-existent')
        .send({ name: 'test' })
        .expect(404);
    });
  });

  describe('/media/:id (DELETE)', () => {
    it('should delete a media entry', () => {
      return request(app.getHttpServer())
        .delete(`/media/${testMediaId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testMediaId);
        });
    });

    it('should return 404 for non-existent media entry', () => {
      return request(app.getHttpServer())
        .delete('/media/non-existent')
        .expect(404);
    });
  });
});
