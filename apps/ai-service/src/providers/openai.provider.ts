import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";

interface SimpleIngredient {
  name: string;
  inciName: string;
}

interface SimpleProduct {
  name: string;
  description?: string;
  ingredients: SimpleIngredient[];
}

export type ModelType = "standard" | "extended" | "embeddings";

export interface IngredientAnalysis {
  name: string;
  category: string;
  description: string;
  benefits: string[];
  concerns: string[];
  commonUses: string[];
}

export interface ProductAnalysis {
  categories: { name: string; confidence: number }[];
  tags: { name: string; confidence: number }[];
  claims: { claim: string; confidence: number }[];
  ingredients: {
    name: string;
    confidence: number;
    category?: string;
    concerns?: string[];
  }[];
}

@Injectable()
export class OpenAIProvider {
  private readonly openai: OpenAI;
  private readonly models: Record<ModelType, string>;
  private readonly logger = new Logger(OpenAIProvider.name);

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not defined");
    }
    this.openai = new OpenAI({ apiKey });

    // Initialize models from environment variables
    this.models = {
      standard: this.config.getOrThrow<string>("OPENAI_MODEL_standard"),
      extended: this.config.getOrThrow<string>("OPENAI_MODEL_extended"),
      embeddings: this.config.getOrThrow<string>("OPENAI_MODEL_embeddings"),
    };
  }

  private getModel(type: ModelType = "standard"): string {
    return this.models[type];
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.getModel("embeddings"),
      input: text,
    });

    return response.data[0].embedding;
  }

  async generateIngredientSummary(
    ingredient: SimpleIngredient & { category?: string; commonUses?: string[] },
    similarIngredients: Array<SimpleIngredient & { category?: string; commonUses?: string[] }>,
    modelType: ModelType = "standard",
  ): Promise<string> {
    const prompt = `
      Analyze this skincare ingredient and its similar ingredients:
      
      Main Ingredient:
      Name: ${ingredient.name}
      INCI: ${ingredient.inciName}
      Category: ${ingredient.category || "Not specified"}
      Common Uses: ${ingredient.commonUses?.join(", ") || "Not specified"}
      
      Similar Ingredients:
      ${similarIngredients
        .map(
          (i) =>
            `- ${i.name} (${i.category || "Not specified"}): ${i.commonUses?.join(", ") || "Not specified"}`,
        )
        .join("\n")}
      
      Please provide a ${modelType === "standard" ? "concise" : "detailed"} summary of the ingredient's properties, benefits, and how it compares to similar ingredients.
    `;

    const response = await this.openai.chat.completions.create({
      model: this.getModel(modelType),
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content || "";
  }

  async generateProductTags(
    product: SimpleProduct,
    modelType: ModelType = "standard",
  ): Promise<string[]> {
    const prompt = `
      Analyze this skincare product and generate relevant tags:
      
      Name: ${product.name}
      Description: ${product.description || "Not specified"}
      Ingredients: ${product.ingredients.map((i) => i.name).join(", ")}
      
      Please provide a comma-separated list of ${modelType === "standard" ? "basic" : "comprehensive"} tags for this product (e.g., hydrating, anti-aging, sensitive-skin-safe).
    `;

    const response = await this.openai.chat.completions.create({
      model: this.getModel(modelType),
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content || "";
    return content.split(",").map((tag: string) => tag.trim().toLowerCase());
  }

  async normalizeProductName(
    name: string,
    brand: string,
    modelType: ModelType = "standard",
  ): Promise<string> {
    const prompt = `
      Normalize the following skincare product name:
      
      Brand: ${brand}
      Name: ${name}
      
      Rules:
      1. Remove unnecessary special characters
      2. Standardize capitalization
      3. Keep essential product identifiers
      4. Remove redundant brand mentions
      5. Ensure consistency with industry standards
      ${modelType === "extended" ? "6. Preserve important variant information\n7. Maintain regulatory compliance indicators" : ""}
      
      Return ONLY the normalized name.
    `;

    const response = await this.openai.chat.completions.create({
      model: this.getModel(modelType),
      messages: [
        {
          role: "system",
          content:
            "You are a product name normalizer that follows strict naming conventions.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 50,
    });

    return response.choices[0].message.content?.trim() || name;
  }

  async analyzeIngredient(inciName: string): Promise<IngredientAnalysis> {
    try {
      const prompt = `Analyze the following cosmetic ingredient (INCI name):
${inciName}

Please provide a detailed analysis in the following JSON format:
{
  "name": "Common name",
  "category": "Main category (e.g., emollient, humectant, preservative)",
  "description": "Brief description of what it is and its origin",
  "benefits": ["Benefit 1", "Benefit 2", ...],
  "concerns": ["Potential concern 1", "Potential concern 2", ...] or [],
  "commonUses": ["Common use 1", "Common use 2", ...]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a cosmetic ingredient analysis expert. Provide accurate, scientific analysis of ingredients in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return JSON.parse(content) as IngredientAnalysis;
    } catch (error) {
      this.logger.error(`Error analyzing ingredient ${inciName}:`, error);
      throw error;
    }
  }

  async analyzeProduct(data: {
    name: string;
    description: string;
    ingredients: string[];
    similarProducts: string[];
  }): Promise<ProductAnalysis> {
    try {
      const prompt = `Analyze the following skincare product:
Name: ${data.name}
Description: ${data.description}
Ingredients: ${data.ingredients.join(', ')}
Similar Products: ${data.similarProducts.join(', ')}

Please provide a detailed analysis in the following JSON format:
{
  "categories": [{"name": "Category name", "confidence": 0.95}],
  "tags": [{"name": "Tag", "confidence": 0.90}],
  "claims": [{"claim": "Product claim", "confidence": 0.85}],
  "ingredients": [
    {
      "name": "Ingredient name",
      "confidence": 0.95,
      "category": "Optional category",
      "concerns": ["Optional concern 1", "Optional concern 2"]
    }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a skincare product analysis expert. Provide accurate, scientific analysis of products in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return JSON.parse(content) as ProductAnalysis;
    } catch (error) {
      this.logger.error(`Error analyzing product ${data.name}:`, error);
      throw error;
    }
  }
}
