import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpStatus,
  HttpCode
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth
} from "@nestjs/swagger";
import { ProductService } from "./product.service";
import { BatchAnalyzeProductsDto } from "./dto/batch-analyze-products.dto";
import { ProductAnalysisResultDto } from "./dto/product-analysis-result.dto";
import { ProductRecommendationDto } from "./dto/product-recommendation.dto";

@ApiTags("AI Products")
@Controller("products")
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(":id/analyze")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Analyze and tag a product", 
    description: "Performs AI analysis on a product to extract tags, categories, and other insights"
  })
  @ApiParam({ 
    name: "id", 
    description: "Product ID to analyze",
    required: true, 
    type: String 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: "Analysis completed successfully",
    type: ProductAnalysisResultDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: "Product not found"
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: "Invalid product ID"
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: "Unauthorized"
  })
  async analyzeAndTagProduct(@Param("id") id: string): Promise<ProductAnalysisResultDto> {
    return this.productService.analyzeAndTagProduct(id);
  }

  @Post("batch-analyze")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Analyze a batch of products",
    description: "Performs AI analysis on multiple products at once" 
  })
  @ApiBody({ type: BatchAnalyzeProductsDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: "Batch analysis completed successfully",
    schema: {
      type: "object",
      properties: {
        results: {
          type: "array",
          items: { 
            type: "object",
            properties: {
              productId: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              categories: { type: "array", items: { type: "string" } },
              sentiment: { type: "string" },
              keyIngredients: { type: "array", items: { type: "string" } },
              suggestedDescription: { type: "string" }
            }
          }
        },
        processingTimeMs: { type: "number" },
        totalProducts: { type: "number" }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: "Invalid request format or product IDs"
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: "Unauthorized"
  })
  async batchAnalyzeProducts(@Body() batchDto: BatchAnalyzeProductsDto): Promise<any> {
    const products = await this.productService.getProductsByIds(
      batchDto.productIds,
    );
    return this.productService.batchAnalyzeProducts(products);
  }

  @Get(":id/recommendations")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Get product recommendations",
    description: "Returns AI-powered product recommendations based on similarity analysis" 
  })
  @ApiParam({ 
    name: "id", 
    description: "Product ID for which to get recommendations",
    required: true, 
    type: String 
  })
  @ApiQuery({ 
    name: "limit", 
    description: "Maximum number of recommendations to return",
    required: false, 
    type: Number 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: "Product recommendations retrieved successfully",
    type: [ProductRecommendationDto]
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: "Product not found"
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: "Invalid product ID or query parameters"
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: "Unauthorized"
  })
  async getRecommendations(
    @Param("id") id: string,
    @Query("limit") limit?: number,
  ): Promise<ProductRecommendationDto[]> {
    return this.productService.getRecommendations(id, limit);
  }

  @Get(":id/similar")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Find similar products using vector embedding",
    description: "Uses AI vector embeddings to find semantically similar products" 
  })
  @ApiParam({ 
    name: "id", 
    description: "Product ID for which to find similar products",
    required: true, 
    type: String 
  })
  @ApiQuery({ 
    name: "limit", 
    description: "Maximum number of similar products to return",
    required: false, 
    type: Number 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: "Similar products found successfully",
    schema: {
      type: "object",
      properties: {
        productId: { type: "string" },
        similarProducts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              similarity: { type: "number" },
              commonTags: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: "Product not found"
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: "Invalid product ID or query parameters"
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: "Unauthorized"
  })
  async getSimilarProducts(
    @Param("id") id: string,
    @Query("limit") limit = 5,
  ): Promise<any> {
    return this.productService.getSimilarProducts(id, limit);
  }
}
