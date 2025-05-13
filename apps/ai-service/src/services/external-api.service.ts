import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";

@Injectable()
export class ExternalApiService {
  private readonly skincareApi: AxiosInstance;
  private readonly cosmeticApi: AxiosInstance;

  constructor(private readonly config: ConfigService) {
    // Initialize Skincare API client
    this.skincareApi = axios.create({
      baseURL: this.config.getOrThrow<string>("SKINCARE_API_URL"),
    });

    // Initialize Cosmetic API client with RapidAPI configuration
    this.cosmeticApi = axios.create({
      baseURL: this.config.getOrThrow<string>("COSMETIC_API_URL"),
      headers: {
        "x-rapidapi-host": this.config.getOrThrow<string>("RAPIDAPI_HOST"),
        "x-rapidapi-key": this.config.getOrThrow<string>("RAPIDAPI_KEY"),
      },
    });
  }

  async getSkincareIngredient(ingredientName: string) {
    try {
      const response = await this.skincareApi.get(
        `/ingredients/${encodeURIComponent(ingredientName)}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch skincare ingredient: ${error.message}`);
    }
  }

  async getCosmeticIngredient(ingredientName: string) {
    try {
      const response = await this.cosmeticApi.get("", {
        params: {
          name: ingredientName,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch cosmetic ingredient: ${error.message}`);
    }
  }

  async searchIngredients(query: string) {
    try {
      // Search in both APIs concurrently
      const [skincareResults, cosmeticResults] = await Promise.all([
        this.skincareApi.get(`/ingredients/search`, {
          params: { q: query },
        }),
        this.cosmeticApi.get("", {
          params: { search: query },
        }),
      ]);

      // Combine and deduplicate results
      const combinedResults = {
        skincare: skincareResults.data,
        cosmetic: cosmeticResults.data,
      };

      return combinedResults;
    } catch (error) {
      throw new Error(`Failed to search ingredients: ${error.message}`);
    }
  }
}
