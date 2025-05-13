import { Controller, Get, Query, HttpStatus, HttpCode } from "@nestjs/common";
import { 
  ApiTags, 
  ApiOperation, 
  ApiQuery, 
  ApiResponse,
  ApiBearerAuth
} from "@nestjs/swagger";
import { SearchService } from "./search.service";
import { SearchQueryDto } from "./dto/search-query.dto";
import { SearchResultDto } from "./dto/search-result.dto";
import { SimilarProductDto } from "./dto/similar-product.dto";
import { SimilarIngredientDto } from "./dto/similar-ingredient.dto";

@ApiTags("Search")
@Controller("search")
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Search products and ingredients", 
    description: "Performs semantic search across products and ingredients using AI-powered vector search"
  })
  @ApiQuery({ 
    name: "query", 
    description: "Search query text",
    required: true, 
    type: String 
  })
  @ApiQuery({ 
    name: "limit", 
    description: "Maximum number of results to return",
    required: false, 
    type: Number 
  })
  @ApiQuery({ 
    name: "type", 
    description: "Type of entities to search for",
    required: false, 
    enum: ["products", "ingredients", "all"],
    type: String 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: "Search completed successfully",
    type: SearchResultDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: "Invalid search parameters"
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: "Unauthorized"
  })
  async search(
    @Query() queryDto: SearchQueryDto,
    @Query("type") type: "products" | "ingredients" | "all" = "all"
  ): Promise<SearchResultDto> {
    return this.searchService.search(queryDto.query, queryDto.limit, type);
  }

  @Get("products/similar")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Get similar products", 
    description: "Finds products similar to a specified product using AI vector similarity"
  })
  @ApiQuery({ 
    name: "productId", 
    description: "Product ID to find similar products for",
    required: true, 
    type: String 
  })
  @ApiQuery({ 
    name: "limit", 
    description: "Maximum number of similar products to return",
    required: false, 
    type: Number 
  })
  @ApiQuery({ 
    name: "threshold", 
    description: "Minimum similarity score threshold (0-1)",
    required: false, 
    type: Number 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: "Similar products found successfully",
    type: [SimilarProductDto]
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
    @Query("productId") productId: string,
    @Query("limit") limit = 5,
    @Query("threshold") threshold = 0.7
  ): Promise<SimilarProductDto[]> {
    return this.searchService.getSimilarProducts(productId, limit, threshold);
  }

  @Get("ingredients/similar")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Get similar ingredients", 
    description: "Finds ingredients similar to a specified ingredient using AI vector similarity" 
  })
  @ApiQuery({ 
    name: "ingredientId", 
    description: "Ingredient ID to find similar ingredients for",
    required: true, 
    type: String 
  })
  @ApiQuery({ 
    name: "limit", 
    description: "Maximum number of similar ingredients to return",
    required: false, 
    type: Number 
  })
  @ApiQuery({ 
    name: "threshold", 
    description: "Minimum similarity score threshold (0-1)",
    required: false, 
    type: Number 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: "Similar ingredients found successfully",
    type: [SimilarIngredientDto]
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: "Ingredient not found"
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: "Invalid ingredient ID or query parameters"
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: "Unauthorized"
  })
  async getSimilarIngredients(
    @Query("ingredientId") ingredientId: string,
    @Query("limit") limit = 5,
    @Query("threshold") threshold = 0.7
  ): Promise<SimilarIngredientDto[]> {
    return this.searchService.getSimilarIngredients(ingredientId, limit, threshold);
  }

  @Get("semantic")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Perform semantic search", 
    description: "Searches for products and ingredients using natural language understanding" 
  })
  @ApiQuery({ 
    name: "query", 
    description: "Natural language search query",
    required: true, 
    type: String 
  })
  @ApiQuery({ 
    name: "limit", 
    description: "Maximum number of results to return",
    required: false, 
    type: Number 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: "Semantic search completed successfully",
    schema: {
      type: "object",
      properties: {
        results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string", enum: ["product", "ingredient"] },
              name: { type: "string" },
              relevance: { type: "number" },
              matchReason: { type: "string" }
            }
          }
        },
        queryInterpretation: { 
          type: "object",
          properties: {
            intent: { type: "string" },
            entities: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  text: { type: "string" },
                  type: { type: "string" }
                }
              } 
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: "Invalid search parameters"
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: "Unauthorized"
  })
  async semanticSearch(
    @Query("query") query: string,
    @Query("limit") limit = 10
  ): Promise<any> {
    return this.searchService.semanticSearch(query, limit);
  }
}
