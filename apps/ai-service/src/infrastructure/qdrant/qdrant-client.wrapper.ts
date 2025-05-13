import { QdrantClient } from '@qdrant/js-client-rest';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QdrantClientWrapper {
  private readonly client: QdrantClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>('VECTOR_DB_URL');
    this.client = new QdrantClient({ url });
  }

  async createCollection(name: string, dimension: number) {
    return this.client.createCollection(name, {
      vectors: {
        size: dimension,
        distance: 'Cosine',
      },
    });
  }

  async listCollections() {
    return this.client.getCollections();
  }

  async getCollection(name: string) {
    return this.client.getCollection(name);
  }

  async deleteCollection(name: string) {
    return this.client.deleteCollection(name);
  }

  async upsert(collectionName: string, points: Array<{ id: string | number; vector: number[]; payload?: Record<string, any> }>) {
    return this.client.upsert(collectionName, {
      points: points.map(point => ({
        id: point.id,
        vector: point.vector,
        payload: point.payload || {},
      })),
    });
  }

  async delete(collectionName: string, id: string | number) {
    return this.client.delete(collectionName, {
      points: [id],
    });
  }

  async search(collectionName: string, vector: number[], limit: number = 10) {
    return this.client.search(collectionName, {
      vector,
      limit,
    });
  }
} 