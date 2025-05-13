import { Test, TestingModule } from "@nestjs/testing";
import { SearchService } from "./search.service";
import { QdrantClientWrapper } from "../../embeddings/qdrant.client";
import { FastEmbedService } from "../../embeddings/fastembed.service";
import { ProductService } from "../product/product.service";
import { IngredientService } from "../ingredient/ingredient.service";
import { PrismaService } from "../../prisma/prisma.service";

// Define interfaces for our services
interface Product {
  id: string;
  name: string;
  [key: string]: any;
}

interface Ingredient {
  id: string;
  name: string;
  [key: string]: any;
}

interface SearchPoint {
  id: string;
  score: number;
}

interface SearchResponse {
  points: SearchPoint[];
}

interface SearchResult {
  id: string;
  score: number;
}

// Create mock implementations
class MockQdrantClient {
  async searchSimilarProducts(): Promise<{ id: string; score: number }[]> {
    return [];
  }

  async searchSimilarIngredients(): Promise<{ id: string; score: number }[]> {
    return [];
  }
}

class MockProductService {
  async findByIds(ids: string[]): Promise<Product[]> {
    return [];
  }
}

class MockIngredientService {
  async findByIds(ids: string[]): Promise<Ingredient[]> {
    return [];
  }
}

class MockFastEmbedService {
  async generateProductEmbedding(data: { name: string }): Promise<number[]> {
    return [0, 0, 0];
  }
}

class MockPrismaService {
  product = {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
  };
  ingredient = {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
  };
}

describe("SearchService", () => {
  let service: SearchService;
  let qdrantClient: MockQdrantClient;
  let fastEmbedService: MockFastEmbedService;
  let productService: MockProductService;
  let ingredientService: MockIngredientService;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: QdrantClientWrapper,
          useClass: MockQdrantClient,
        },
        {
          provide: FastEmbedService,
          useClass: MockFastEmbedService,
        },
        {
          provide: ProductService,
          useClass: MockProductService,
        },
        {
          provide: IngredientService,
          useClass: MockIngredientService,
        },
        {
          provide: PrismaService,
          useClass: MockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    qdrantClient = module.get(QdrantClientWrapper);
    fastEmbedService = module.get(FastEmbedService);
    productService = module.get(ProductService);
    ingredientService = module.get(IngredientService);
    prismaService = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("search", () => {
    it("should search products and ingredients", async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockProductResults = [{ id: "product1", score: 0.9 }];
      const mockIngredientResults = [{ id: "ingredient1", score: 0.8 }];
      const mockProduct = { id: "product1", name: "Test Product" };
      const mockIngredient = { id: "ingredient1", name: "Test Ingredient" };

      jest
        .spyOn(fastEmbedService, "generateProductEmbedding")
        .mockResolvedValue(mockEmbedding);
      jest
        .spyOn(qdrantClient, "searchSimilarProducts")
        .mockResolvedValue(mockProductResults);
      jest
        .spyOn(qdrantClient, "searchSimilarIngredients")
        .mockResolvedValue(mockIngredientResults);

      // Update mock implementations for Prisma service
      prismaService.product.findMany.mockResolvedValue([mockProduct]);
      prismaService.ingredient.findMany.mockResolvedValue([mockIngredient]);

      const result = await service.search("test query");

      expect(result).toEqual({
        products: [{ id: "product1", name: "Test Product", score: 0.9 }],
        ingredients: [
          { id: "ingredient1", name: "Test Ingredient", score: 0.8 },
        ],
      });
    });

    it("should handle empty search results", async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockEmptyResults: SearchResult[] = [];

      jest
        .spyOn(fastEmbedService, "generateProductEmbedding")
        .mockResolvedValue(mockEmbedding);
      jest
        .spyOn(qdrantClient, "searchSimilarProducts")
        .mockResolvedValue(mockEmptyResults);
      jest
        .spyOn(qdrantClient, "searchSimilarIngredients")
        .mockResolvedValue(mockEmptyResults);

      const result = await service.search("no results");

      expect(result).toEqual({
        products: [],
        ingredients: [],
      });
    });

    it("should handle search errors", async () => {
      jest
        .spyOn(fastEmbedService, "generateProductEmbedding")
        .mockRejectedValue(new Error("Embedding failed"));

      await expect(service.search("error query")).rejects.toThrow(
        "Embedding failed",
      );
    });
  });
});
