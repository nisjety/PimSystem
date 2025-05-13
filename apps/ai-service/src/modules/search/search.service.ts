import { Injectable } from "@nestjs/common";
import { QdrantClientWrapper } from "../../embeddings/qdrant.client";
import { FastEmbedService } from "../../embeddings/fastembed.service";
import { PrismaService } from "../../prisma/prisma.service";
import { SearchResultDto } from "./dto/search-result.dto";
import { SimilarProductDto } from "./dto/similar-product.dto";
import { SimilarIngredientDto } from "./dto/similar-ingredient.dto";
import type { Product as PrismaProduct, Ingredient as PrismaIngredient } from ".prisma/client";

interface ProductWithIngredients extends PrismaProduct {
  ingredients: PrismaIngredient[];
}

@Injectable()
export class SearchService {
  constructor(
    private readonly qdrant: QdrantClientWrapper,
    private readonly fastEmbed: FastEmbedService,
    private readonly prisma: PrismaService,
  ) {}

  async search(query: string, limit: number = 10): Promise<SearchResultDto[]> {
    const embedding = await this.fastEmbed.generateSingleEmbedding(query);
    
    // Search products and ingredients using Prisma's similarity search
    const [products, ingredients] = await Promise.all([
      this.prisma.product.findMany({
        take: limit,
        where: {
          embedding: { not: null },
        },
        orderBy: {
          embedding: {
            similarity: embedding,
          },
        },
      }),
      this.prisma.ingredient.findMany({
        take: limit,
        where: {
          embedding: { not: null },
        },
        orderBy: {
          embedding: {
            similarity: embedding,
          },
        },
      }),
    ]);

    // Calculate similarity scores
    const productScores = products.map(p => ({
      ...p,
      score: this.calculateCosineSimilarity(embedding, p.embedding || []),
    }));

    const ingredientScores = ingredients.map(i => ({
      ...i,
      score: this.calculateCosineSimilarity(embedding, i.embedding || []),
    }));

    // Combine and format results
    const results: SearchResultDto[] = [
      ...productScores.map(p => ({
        id: p.id,
        name: p.name,
        type: 'product' as const,
        score: p.score,
      })),
      ...ingredientScores.map(i => ({
        id: i.id,
        name: i.name,
        type: 'ingredient' as const,
        score: i.score,
      })),
    ];

    // Sort by score and limit
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getSimilarProducts(productId: string, limit: number = 5): Promise<SimilarProductDto[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { ingredients: true },
    });

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    if (!product.embedding) {
      throw new Error(`Product ${productId} has no embedding`);
    }

    const similarProducts = await this.prisma.product.findMany({
      take: limit,
      where: {
        id: { not: productId },
        embedding: { not: null },
      },
      include: {
        ingredients: true,
      },
      orderBy: {
        embedding: {
          similarity: product.embedding,
        },
      },
    });

    return similarProducts.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand || null,
      similarity: this.calculateCosineSimilarity(product.embedding || [], p.embedding || []),
      ingredients: p.ingredients.map(i => i.name),
    }));
  }

  async getSimilarIngredients(ingredientId: string, limit: number = 10): Promise<SimilarIngredientDto[]> {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      throw new Error(`Ingredient not found: ${ingredientId}`);
    }

    if (!ingredient.embedding) {
      throw new Error(`Ingredient ${ingredientId} has no embedding`);
    }

    const similarIngredients = await this.prisma.ingredient.findMany({
      take: limit,
      where: {
        id: { not: ingredientId },
        embedding: { not: null },
      },
      orderBy: {
        embedding: {
          similarity: ingredient.embedding,
        },
      },
    });

    return similarIngredients.map(i => ({
      id: i.id,
      name: i.name,
      inciName: i.inciName,
      similarity: this.calculateCosineSimilarity(ingredient.embedding || [], i.embedding || []),
    }));
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same length');
    }

    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

    return dotProduct / (mag1 * mag2);
  }

  async semanticSearch(query: string, limit: number = 10): Promise<SearchResultDto[]> {
    return this.search(query, limit);
  }
}
