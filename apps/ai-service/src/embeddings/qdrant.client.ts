import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QdrantClient } from "@qdrant/js-client-rest";

export interface SearchResult {
  id: string;
  score: number;
}

export interface VectorPoint {
  id: string;
  vector: number[];
  payload?: Record<string, any>;
}

class MockQdrantClient {
  async createCollection(): Promise<void> {}
  async search(): Promise<{ id: string; score: number }[]> {
    return [
      { id: "mock-id-1", score: 0.9 },
      { id: "mock-id-2", score: 0.8 },
    ];
  }
  async upsert(): Promise<void> {}
  async delete(): Promise<void> {}
}

@Injectable()
export class QdrantClientWrapper {
  private client: QdrantClient | MockQdrantClient;
  private readonly isTestEnv: boolean;
  private readonly dimension: number;

  constructor(private readonly config: ConfigService) {
    this.isTestEnv = process.env.NODE_ENV === "test";
    this.client = this.isTestEnv
      ? new MockQdrantClient()
      : new QdrantClient({
          url: this.config.getOrThrow<string>("QDRANT_URL"),
          checkCompatibility: false,
        });
    this.dimension = this.config.get<number>("EMBEDDING_DIMENSION") || 384;
  }

  async initializeCollections() {
    // Initialize collections for products and ingredients
    await this.ensureCollection("products", this.dimension);
    await this.ensureCollection("ingredients", this.dimension);
  }

  async createCollection(name: string, dimension: number = 384) {
    if (this.isTestEnv) return;

    return (this.client as QdrantClient).createCollection(name, {
      vectors: {
        size: dimension,
        distance: "Cosine",
      },
    });
  }

  async ensureCollection(
    collectionName: string,
    dimension: number = 384,
  ): Promise<void> {
    if (this.isTestEnv) return;

    try {
      await this.createCollection(collectionName, dimension);
    } catch (error) {
      if (!error.message?.includes("already exists")) {
        throw error;
      }
    }
  }

  async listCollections() {
    if (this.isTestEnv) return [];
    return (this.client as QdrantClient).getCollections();
  }

  async getCollection(name: string) {
    if (this.isTestEnv) return null;
    return (this.client as QdrantClient).getCollection(name);
  }

  async deleteCollection(name: string) {
    if (this.isTestEnv) return;
    return (this.client as QdrantClient).deleteCollection(name);
  }

  async upsert(collectionName: string, points: VectorPoint[]) {
    if (this.isTestEnv) return;

    return (this.client as QdrantClient).upsert(collectionName, {
      points: points.map(point => ({
        id: point.id,
        vector: point.vector,
        payload: point.payload || {},
      })),
    });
  }

  async delete(collectionName: string, id: string | number) {
    if (this.isTestEnv) return;

    return (this.client as QdrantClient).delete(collectionName, {
      points: [id],
    });
  }

  async search(
    collectionName: string,
    vector: number[],
    limit: number = 10,
    withPayload: boolean = true
  ): Promise<SearchResult[]> {
    try {
      if (this.isTestEnv) {
        return (this.client as MockQdrantClient).search();
      }

      const response = await (this.client as QdrantClient).search(collectionName, {
        vector,
        limit,
        with_payload: withPayload,
      });

      return response.map((hit) => ({
        id: hit.id as string,
        score: hit.score,
      }));
    } catch (error) {
      console.error("Error searching vectors:", error);
      throw error;
    }
  }

  async searchSimilarProducts(vector: number[], limit: number = 5) {
    return this.search("products", vector, limit, true);
  }

  async searchSimilarIngredients(vector: number[], limit: number = 10) {
    return this.search("ingredients", vector, limit, true);
  }

  async upsertProductVectors(points: VectorPoint[]) {
    return this.upsert("products", points);
  }

  async upsertIngredientVectors(points: VectorPoint[]) {
    return this.upsert("ingredients", points);
  }

  async deleteProduct(id: string) {
    return this.delete("products", id);
  }

  async deleteIngredient(id: string) {
    return this.delete("ingredients", id);
  }
}
