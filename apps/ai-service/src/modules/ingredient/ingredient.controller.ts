import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode
} from "@nestjs/common";
import { 
  ApiTags, 
  ApiOperation, 
  ApiParam, 
  ApiBody,
  ApiResponse,
  ApiBearerAuth
} from "@nestjs/swagger";
import { IngredientService } from "./ingredient.service";
import { BatchAnalyzeDto } from "./dto/batch-analyze.dto";
import { IngredientAnalysisDto } from "./dto/ingredient-analysis.dto";

@ApiTags("AI Ingredients")
@Controller("ingredients")
@ApiBearerAuth()
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get(":id/analyze")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Analyze an ingredient", 
    description: "Performs AI analysis on an ingredient to identify properties, uses, and safety information"
  })
  @ApiParam({ 
    name: "id", 
    description: "Ingredient ID to analyze",
    required: true, 
    type: String 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: "Ingredient analysis completed successfully",
    type: IngredientAnalysisDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: "Ingredient not found"
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: "Invalid ingredient ID"
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: "Unauthorized"
  })
  async analyzeIngredient(@Param("id") id: string): Promise<IngredientAnalysisDto> {
    return this.ingredientService.analyzeIngredient(id);
  }

  @Post("batch/analyze")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Batch analyze ingredients", 
    description: "Performs AI analysis on multiple ingredients at once"
  })
  @ApiBody({ type: BatchAnalyzeDto })
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
              ingredientId: { type: "string" },
              name: { type: "string" },
              inciName: { type: "string" },
              analysis: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  properties: { 
                    type: "array", 
                    items: { type: "string" } 
                  },
                  commonUses: { 
                    type: "array", 
                    items: { type: "string" } 
                  },
                  potentialConcerns: { 
                    type: "array", 
                    items: { type: "string" } 
                  },
                  benefitsDescription: { type: "string" }
                }
              },
              status: { 
                type: "string", 
                enum: ["completed", "partial", "failed"]
              },
              error: { type: "string" }
            }
          }
        },
        totalProcessed: { type: "number" },
        successful: { type: "number" },
        failed: { type: "number" },
        processingTimeMs: { type: "number" }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: "Invalid request format"
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: "Unauthorized"
  })
  async batchAnalyzeIngredients(
    @Body() batchDto: BatchAnalyzeDto,
  ): Promise<any> {
    return this.ingredientService.batchAnalyzeIngredients(
      batchDto.ingredientIds,
    );
  }

  @Get(":id/similar")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Find similar ingredients", 
    description: "Finds ingredients with similar properties and functions using vector embeddings"
  })
  @ApiParam({ 
    name: "id", 
    description: "Ingredient ID to find similar ingredients for",
    required: true, 
    type: String 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: "Similar ingredients found successfully",
    schema: {
      type: "object",
      properties: {
        ingredientId: { type: "string" },
        name: { type: "string" },
        similarIngredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              inciName: { type: "string" },
              similarity: { type: "number" },
              commonProperties: { 
                type: "array", 
                items: { type: "string" } 
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: "Ingredient not found"
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: "Invalid ingredient ID"
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: "Unauthorized"
  })
  async getSimilarIngredients(@Param("id") id: string): Promise<any> {
    return this.ingredientService.getSimilarIngredients(id);
  }
}
