import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { IngredientService } from "../../src/modules/ingredient/ingredient.service";
import { FastEmbedService } from "../../src/embeddings/fastembed.service";
import { QdrantClientWrapper } from "../../src/embeddings/qdrant.client";
import { OpenAIProvider } from "../../src/providers/openai.provider";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          SKINCARE_API_URL: "http://mock-skincare-api",
          FASTEMBED_API_URL: "http://mock-fastembed-api",
          QDRANT_URL: "http://mock-qdrant-api",
          DATABASE_URL: process.env.DATABASE_URL,
        }),
      ],
    }),
  ],
  providers: [
    {
      provide: FastEmbedService,
      useValue: {
        generateIngredientEmbedding: jest
          .fn()
          .mockResolvedValue(new Array(384).fill(0)),
        generateProductEmbedding: jest
          .fn()
          .mockResolvedValue(new Array(384).fill(0)),
        generateBatchEmbeddings: jest
          .fn()
          .mockResolvedValue([new Array(384).fill(0)]),
      },
    },
    {
      provide: QdrantClientWrapper,
      useValue: {
        ensureCollection: jest.fn().mockResolvedValue(undefined),
        searchSimilarIngredients: jest.fn().mockResolvedValue([
          { id: "mock-id-1", score: 0.9 },
          { id: "mock-id-2", score: 0.8 },
        ]),
        upsertIngredientVectors: jest.fn().mockResolvedValue(undefined),
      },
    },
    {
      provide: OpenAIProvider,
      useValue: {
        generateIngredientSummary: jest
          .fn()
          .mockResolvedValue("Mock ingredient summary"),
        generateProductTags: jest
          .fn()
          .mockResolvedValue(["mock-tag-1", "mock-tag-2"]),
      },
    },
    {
      provide: IngredientService,
      useValue: {
        findSimilar: jest.fn().mockResolvedValue([
          {
            id: "mock-id-1",
            name: "Mock Ingredient 1",
            inciName: "Mock INCI 1",
            category: "hydrator",
          },
          {
            id: "mock-id-2",
            name: "Mock Ingredient 2",
            inciName: "Mock INCI 2",
            category: "antioxidant",
          },
        ]),
        analyze: jest.fn().mockResolvedValue({
          id: "mock-id",
          name: "Mock Ingredient",
          inciName: "Mock INCI",
          category: "hydrator",
          analysis: {
            name: "Mock Ingredient",
            properties: ["Hydrating", "Soothing"],
            benefits: ["Moisturization", "Skin barrier support"],
            concerns: ["None known"],
          },
        }),
        batchAnalyze: jest.fn().mockResolvedValue([
          {
            id: "mock-id-1",
            name: "Mock Ingredient 1",
            analysis: {
              name: "Mock Ingredient 1",
              properties: ["Hydrating"],
              benefits: ["Moisturization"],
              concerns: [],
            },
          },
          {
            id: "mock-id-2",
            name: "Mock Ingredient 2",
            analysis: {
              name: "Mock Ingredient 2",
              properties: ["Antioxidant"],
              benefits: ["Anti-aging"],
              concerns: [],
            },
          },
        ]),
      },
    },
  ],
  exports: [
    IngredientService,
    FastEmbedService,
    QdrantClientWrapper,
    OpenAIProvider,
  ],
})
export class MockModule {}
