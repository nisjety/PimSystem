import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenAIProvider } from "../../providers/openai.provider";
import { QdrantClientWrapper } from "../../embeddings/qdrant.client";
import { FastEmbedService } from "../../embeddings/fastembed.service";
import type { Product as PrismaProduct, Ingredient as PrismaIngredient } from ".prisma/client";
import { ProductAnalysisResultDto } from "./dto/product-analysis-result.dto";
import { ProductRecommendationDto } from "./dto/product-recommendation.dto";
import { PrismaService } from "../../prisma/prisma.service";
import { v4 as uuidv4 } from 'uuid';

interface EmbeddingIngredient {
  name: string;
}

interface EmbeddingProduct {
  name: string;
  description?: string;
  ingredients?: EmbeddingIngredient[];
  categories?: string[];
}

interface OpenAIProduct {
  name: string;
  description?: string;
  ingredients: { name: string; inciName: string }[];
}

interface ProductWithIngredients extends PrismaProduct {
  ingredients: PrismaIngredient[];
}

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly collectionName = 'products';

  constructor(
    private readonly openai: OpenAIProvider,
    private readonly qdrant: QdrantClientWrapper,
    private readonly fastEmbed: FastEmbedService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private toEmbeddingProduct(product: ProductWithIngredients): EmbeddingProduct {
    return {
      name: product.name,
      description: product.description || undefined,
      ingredients: product.ingredients?.map(i => ({ name: i.name })),
      categories: product.categories,
    };
  }

  private toOpenAIProduct(product: ProductWithIngredients): OpenAIProduct {
    return {
      name: product.name,
      description: product.description || undefined,
      ingredients: product.ingredients?.map(i => ({ name: i.name, inciName: i.inciName })) || [],
    };
  }

  private generateProductText(product: ProductWithIngredients): string {
    const parts = [
      product.name,
      product.description,
      product.ingredients.map((i: PrismaIngredient) => i.name).join(', '),
    ];
    return parts.filter(Boolean).join('\n');
  }

  async analyzeAndTagProduct(productId: string): Promise<ProductAnalysisResultDto> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: {
          ingredients: true,
        },
      });

      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      const similarProducts = await this.getSimilarProducts(productId);

      const analysis = await this.openai.analyzeProduct({
        name: product.name,
        description: product.description || '',
        ingredients: product.ingredients.map(i => i.name),
        similarProducts: similarProducts.map(p => p.name),
      });

      const embedding = await this.fastEmbed.generateProductEmbedding(this.toEmbeddingProduct(product));

      await this.prisma.product.update({
        where: { id: product.id },
        data: { embedding },
      });

      const result: ProductAnalysisResultDto = {
        id: uuidv4(),
        productId: product.id,
        timestamp: new Date(),
        analysis,
      };

      return result;
    } catch (error) {
      this.logger.error(`Error analyzing product ${productId}:`, error);
      throw error;
    }
  }

  async getSimilarProducts(productId: string, limit: number = 5): Promise<ProductWithIngredients[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        ingredients: true,
      },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
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

    return similarProducts;
  }

  async getRecommendations(productId: string, limit: number = 5): Promise<ProductRecommendationDto[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { ingredients: true },
    });

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const similarProducts = await this.getSimilarProducts(productId, limit);

    return similarProducts.map(p => ({
      productId: p.id,
      name: p.name,
      brand: p.brand || null,
      similarity: this.calculateSimilarity(product, p),
      matchingIngredients: p.ingredients
        .filter(i => product.ingredients.some(pi => pi.id === i.id))
        .map(i => i.name),
      recommendationType: this.calculateSimilarity(product, p) > 0.9 ? 'VERY_SIMILAR' : 'SIMILAR',
    }));
  }

  private calculateSimilarity(product1: ProductWithIngredients, product2: ProductWithIngredients): number {
    const matchingIngredients = product2.ingredients.filter(i => 
      product1.ingredients.some(pi => pi.id === i.id)
    ).length;
    
    const totalIngredients = Math.max(product1.ingredients.length, product2.ingredients.length);
    return totalIngredients > 0 ? matchingIngredients / totalIngredients : 0;
  }

  async updateEmbedding(id: string): Promise<PrismaProduct> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { ingredients: true },
    });

    if (!product) {
      throw new Error(`Product not found: ${id}`);
    }

    const embedding = await this.fastEmbed.generateProductEmbedding(
      this.toEmbeddingProduct(product)
    );

    return this.prisma.product.update({
      where: { id },
      data: { embedding },
    });
  }

  async batchAnalyzeProducts(products: PrismaProduct[]): Promise<PrismaProduct[]> {
    const productsWithIngredients = await Promise.all(
      products.map(product => 
        this.prisma.product.findUnique({
          where: { id: product.id },
          include: { ingredients: true },
        })
      )
    );

    const validProducts = productsWithIngredients.filter((p): p is ProductWithIngredients => p !== null);

    await Promise.all(
      validProducts.map(async (product) => {
        const embedding = await this.fastEmbed.generateProductEmbedding(
          this.toEmbeddingProduct(product)
        );
        
        return this.prisma.product.update({
          where: { id: product.id },
          data: { embedding },
        });
      })
    );

    return products;
  }

  async getProductsByIds(ids: string[]): Promise<ProductWithIngredients[]> {
    return this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: {
        ingredients: true,
      },
    });
  }
}
