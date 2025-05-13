import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { Response } from "supertest";
import { AppModule } from "../src/app.module";
import { LoggingInterceptor } from "../src/common/interceptors/logging.interceptor";
import { setupTestDatabase, cleanupTestDatabase } from "./test-database";
import { MockModule } from "./mocks/mock.module";

jest.setTimeout(60000); // Set timeout to 60 seconds

describe("AI Service (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MockModule],
    })
      .overrideProvider(AppModule)
      .useValue(MockModule)
      .compile();

    app = moduleFixture.createNestApplication();

    // Apply the same middleware and pipes as in main.ts
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new LoggingInterceptor());

    await app.init();
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await app.close();
  });

  describe("/search (GET)", () => {
    it("should return search results", () => {
      return request(app.getHttpServer())
        .get("/search")
        .query({ query: "hydrating toner" })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body).toBeDefined();
          expect(Array.isArray(res.body)).toBeTruthy();
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty("name");
          expect(res.body[0]).toHaveProperty("description");
        });
    });

    it("should validate search query parameters", () => {
      return request(app.getHttpServer())
        .get("/search")
        .query({ query: "" })
        .expect(400);
    });
  });

  describe("/search/products/similar (GET)", () => {
    it("should return similar products", () => {
      const mockProductId = "123e4567-e89b-12d3-a456-426614174000";
      return request(app.getHttpServer())
        .get("/search/products/similar")
        .query({ productId: mockProductId })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body).toBeDefined();
          expect(Array.isArray(res.body)).toBeTruthy();
          expect(res.body[0]).toHaveProperty("name");
          expect(res.body[0]).toHaveProperty("ingredients");
        });
    });
  });

  describe("/ingredients/:id/analyze (GET)", () => {
    it("should analyze an ingredient", () => {
      const mockIngredientId = "123e4567-e89b-12d3-a456-426614174000";
      return request(app.getHttpServer())
        .get(`/ingredients/${mockIngredientId}/analyze`)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body).toBeDefined();
          expect(res.body.analysis).toBeDefined();
          expect(res.body).toHaveProperty("name");
          expect(res.body).toHaveProperty("inciName");
          expect(res.body).toHaveProperty("category");
          expect(res.body.analysis).toHaveProperty("properties");
          expect(res.body.analysis).toHaveProperty("benefits");
          expect(res.body.analysis).toHaveProperty("concerns");
        });
    });
  });

  describe("/products/:id/analyze (GET)", () => {
    it("should analyze and tag a product", () => {
      const mockProductId = "123e4567-e89b-12d3-a456-426614174000";
      return request(app.getHttpServer())
        .get(`/products/${mockProductId}/analyze`)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body).toBeDefined();
          expect(res.body.tags).toBeDefined();
          expect(Array.isArray(res.body.tags)).toBeTruthy();
          expect(res.body).toHaveProperty("name");
          expect(res.body).toHaveProperty("ingredients");
        });
    });
  });

  describe("/products/:id/recommendations (GET)", () => {
    it("should get product recommendations", () => {
      const mockProductId = "123e4567-e89b-12d3-a456-426614174000";
      return request(app.getHttpServer())
        .get(`/products/${mockProductId}/recommendations`)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body).toBeDefined();
          expect(Array.isArray(res.body)).toBeTruthy();
          expect(res.body[0]).toHaveProperty("name");
          expect(res.body[0]).toHaveProperty("description");
        });
    });

    it("should handle limit parameter", () => {
      const mockProductId = "123e4567-e89b-12d3-a456-426614174000";
      const limit = 5;
      return request(app.getHttpServer())
        .get(`/products/${mockProductId}/recommendations`)
        .query({ limit })
        .expect(200)
        .expect((res: Response) => {
          expect(Array.isArray(res.body)).toBeTruthy();
          expect(res.body.length).toBeLessThanOrEqual(limit);
          expect(res.body[0]).toHaveProperty("name");
          expect(res.body[0]).toHaveProperty("description");
        });
    });
  });
});
