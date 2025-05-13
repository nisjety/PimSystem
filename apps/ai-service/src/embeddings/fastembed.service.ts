import { Injectable, OnModuleInit } from '@nestjs/common';
import { EmbeddingModel, FlagEmbedding } from 'fastembed';

@Injectable()
export class FastEmbedService implements OnModuleInit {
  private embedder: FlagEmbedding;

  async onModuleInit() {
    this.embedder = await FlagEmbedding.init({
      model: EmbeddingModel.BGESmallEN
    });
  }

  async getEmbeddings(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) {
      throw new Error('No texts provided for embedding generation');
    }

    try {
      const embeddings: number[][] = [];
      for await (const batch of this.embedder.embed(texts)) {
        embeddings.push(...batch);
      }
      return embeddings;
    } catch (error) {
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  async generateSingleEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.getEmbeddings([text]);
    return embeddings[0];
  }

  async generateIngredientEmbedding(ingredient: { name: string; description?: string | null; category?: string | null }): Promise<number[]> {
    const text = [
      ingredient.name,
      ingredient.description || '',
      ingredient.category || ''
    ].filter(Boolean).join(' ');
    return this.generateSingleEmbedding(text);
  }

  async generateProductEmbedding(product: { name: string; description?: string | null; ingredients?: { name: string }[] }): Promise<number[]> {
    const text = [
      product.name,
      product.description || '',
      product.ingredients?.map(i => i.name).join(', ') || ''
    ].filter(Boolean).join(' ');
    return this.generateSingleEmbedding(text);
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return this.getEmbeddings(texts);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.generateSingleEmbedding(text);
  }
}
