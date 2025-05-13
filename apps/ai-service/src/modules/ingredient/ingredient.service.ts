import { Injectable, HttpException, HttpStatus, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenAIProvider } from "../../providers/openai.provider";
import { QdrantClientWrapper } from "../../embeddings/qdrant.client";
import { FastEmbedService } from "../../embeddings/fastembed.service";
import {
  SimilarityResult,
  IngredientAnalysis,
} from "../../types/ingredient.types";
import { PrismaService } from "../../prisma/prisma.service";
import type { Ingredient as PrismaIngredient } from ".prisma/client";
import axios from "axios";

interface SimpleIngredient {
  name: string;
  inciName: string;
  description?: string;
  category?: string;
  commonUses?: string[];
}

interface IngredientWithAnalysis extends PrismaIngredient {
  analysis: {
    safetyLevel?: string;
    scientificName?: string;
    summary: string;
    benefits: string[];
    concerns: string[];
  };
}

@Injectable()
export class IngredientService implements OnModuleInit {
  private readonly collectionName = "ingredients";
  private readonly skincareApiUrl: string;
  private readonly cosmeticApiKey: string;

  constructor(
    private readonly openai: OpenAIProvider,
    private readonly qdrant: QdrantClientWrapper,
    private readonly embedService: FastEmbedService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.skincareApiUrl = this.config.get<string>("SKINCARE_API_URL") || "";
    this.cosmeticApiKey = this.config.get<string>("COSMETIC_API_KEY") || "";
  }

  async onModuleInit() {
    await this.qdrant.ensureCollection(this.collectionName);
  }

  private toSimpleIngredient(ingredient: PrismaIngredient): SimpleIngredient {
    return {
      name: ingredient.name,
      inciName: ingredient.inciName,
      description: ingredient.description || undefined,
      category: ingredient.category || undefined,
      commonUses: ingredient.commonUses,
    };
  }

  async analyzeIngredient(id: string): Promise<
    PrismaIngredient & {
      summary: string;
      similarIngredients: PrismaIngredient[];
      externalData: {
        skincare: any;
        cosmetic: any;
      };
    }
  > {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!ingredient) {
      throw new HttpException("Ingredient not found", HttpStatus.NOT_FOUND);
    }

    // Get similar ingredients using vector search
    const similarIngredients = await this.findSimilarIngredients(id, 5);

    // Enrich with external API data
    const [skincareData, cosmeticData] = await Promise.all([
      this.fetchSkincareApiData(ingredient.inciName),
      this.fetchCosmeticApiData(ingredient.inciName),
    ]);

    // Generate AI summary
    const summary = await this.openai.generateIngredientSummary(
      this.toSimpleIngredient(ingredient),
      similarIngredients.map(this.toSimpleIngredient),
    );

    return {
      ...ingredient,
      summary,
      similarIngredients,
      externalData: {
        skincare: skincareData,
        cosmetic: cosmeticData,
      },
    };
  }

  private async fetchSkincareApiData(inciName: string) {
    try {
      const response = await axios.get(`${this.skincareApiUrl}/ingredient`, {
        params: { q: inciName },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch from Skincare API:", error);
      return null;
    }
  }

  private async fetchCosmeticApiData(inciName: string) {
    try {
      const response = await axios.get(
        "https://cosmetic-ingredients2.p.rapidapi.com/ingredient",
        {
          params: { name: inciName },
          headers: {
            "X-RapidAPI-Key": this.cosmeticApiKey,
            "X-RapidAPI-Host": "cosmetic-ingredients2.p.rapidapi.com",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch from Cosmetic API:", error);
      return null;
    }
  }

  async updateIngredient(
    id: string,
    data: Partial<PrismaIngredient>,
  ): Promise<PrismaIngredient> {
    const updatedIngredient = await this.prisma.ingredient.update({
      where: { id },
      data: {
        ...data,
        embedding: await this.embedService.generateIngredientEmbedding(
          this.toSimpleIngredient({ ...data, id } as PrismaIngredient)
        ),
      },
    });

    return updatedIngredient;
  }

  async batchAnalyzeIngredients(ingredientIds: string[]) {
    const ingredients = await this.prisma.ingredient.findMany({
      where: {
        id: { in: ingredientIds },
      },
    });

    const embeddings = await Promise.all(
      ingredients.map(ingredient => 
        this.embedService.generateIngredientEmbedding(this.toSimpleIngredient(ingredient))
      )
    );

    // Update vectors in database
    await Promise.all(
      ingredients.map((ingredient, index) => 
        this.prisma.ingredient.update({
          where: { id: ingredient.id },
          data: { embedding: embeddings[index] },
        })
      )
    );

    return ingredients;
  }

  async findSimilarIngredients(id: string, limit: number = 5): Promise<PrismaIngredient[]> {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      throw new Error("Ingredient not found");
    }

    if (!ingredient.embedding) {
      throw new Error("Ingredient has no embedding");
    }

    // Search for similar ingredients in database
    const similarIngredients = await this.prisma.ingredient.findMany({
      take: limit,
      where: {
        id: { not: id }, // Exclude the current ingredient
        embedding: { not: null },
      },
      orderBy: {
        // Order by cosine similarity of embeddings
        embedding: {
          similarity: ingredient.embedding,
        },
      },
    });

    return similarIngredients;
  }

  async analyze(id: string): Promise<IngredientWithAnalysis> {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      throw new Error("Ingredient not found");
    }

    try {
      // Get ingredient analysis from OpenAI
      const analysis = await this.openai.analyzeIngredient(this.toSimpleIngredient(ingredient));

      return {
        ...ingredient,
        analysis: {
          summary: analysis.summary || "",
          benefits: analysis.benefits || [],
          concerns: analysis.concerns || [],
          safetyLevel: analysis.safetyLevel,
          scientificName: analysis.scientificName,
        },
      };
    } catch (error) {
      console.error("Error analyzing ingredient:", error);
      throw new Error(`Failed to analyze ingredient: ${error.message}`);
    }
  }

  async updateEmbedding(id: string): Promise<PrismaIngredient> {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      throw new Error("Ingredient not found");
    }

    const embedding = await this.embedService.generateIngredientEmbedding(
      this.toSimpleIngredient(ingredient)
    );

    return this.prisma.ingredient.update({
      where: { id },
      data: { embedding },
    });
  }
}
