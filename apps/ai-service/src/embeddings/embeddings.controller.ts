import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FastEmbedService } from './fastembed.service';
import { QdrantClientWrapper } from './qdrant.client';
import { GenerateEmbeddingDto } from './dto/generate-embedding.dto';
import { ProductEmbeddingDto } from './dto/product-embedding.dto';
import { IngredientEmbeddingDto } from './dto/ingredient-embedding.dto';
import { SimilaritySearchDto, SimilaritySearchResultDto } from './dto/similarity-search.dto';
import { UpsertVectorsDto, VectorPoint } from './dto/vector-operations.dto';
import { CollectionInfoDto, CreateCollectionDto } from './dto/collection-operations.dto';
import { GetEmbeddingsDto } from './dto/get-embeddings.dto';
import { GenerateEmbeddingsDto, GenerateProductEmbeddingDto, GenerateIngredientEmbeddingDto } from './dto/generate-embeddings.dto';

class TextsDto {
  texts: string[];
}

@ApiTags('Embeddings')
@Controller('embeddings')
export class EmbeddingsController {
  constructor(
    private readonly fastEmbedService: FastEmbedService,
    private readonly qdrantClient: QdrantClientWrapper,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Get embeddings for multiple texts' })
  async getEmbeddings(@Body() body: { texts: string[] }): Promise<{ embeddings: number[][] }> {
    const embeddings = await this.fastEmbedService.getEmbeddings(body.texts);
    return { embeddings };
  }

  @Get('product/:id')
  @ApiOperation({ summary: 'Get embeddings for a product' })
  async getProductEmbeddings(@Param('id') id: string) {
    const productText = await this.getProductText(id);
    const [embedding] = await this.fastEmbedService.getEmbeddings([productText]);
    return { embedding };
  }

  @Get('ingredient/:id')
  @ApiOperation({ summary: 'Get embeddings for an ingredient' })
  async getIngredientEmbeddings(@Param('id') id: string) {
    const ingredientText = await this.getIngredientText(id);
    const [embedding] = await this.fastEmbedService.getEmbeddings([ingredientText]);
    return { embedding };
  }

  private async getProductText(id: string): Promise<string> {
    // TODO: Implement product text generation
    return `Product ${id} description`;
  }

  private async getIngredientText(id: string): Promise<string> {
    // TODO: Implement ingredient text generation
    return `Ingredient ${id} description`;
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate embeddings for multiple texts' })
  @ApiResponse({ status: 200, description: 'Returns array of embeddings' })
  async generateEmbeddings(@Body() dto: GenerateEmbeddingsDto): Promise<number[][]> {
    try {
      return await this.fastEmbedService.getEmbeddings(dto.texts);
    } catch (error) {
      throw new BadRequestException(`Failed to generate embeddings: ${error.message}`);
    }
  }

  @Post('product')
  @ApiOperation({ summary: 'Generate embedding for a product' })
  @ApiResponse({ status: 200, description: 'Returns product embedding' })
  async generateProductEmbedding(@Body() dto: GenerateProductEmbeddingDto): Promise<number[]> {
    try {
      const productText = this.generateProductText(dto);
      return await this.fastEmbedService.generateSingleEmbedding(productText);
    } catch (error) {
      throw new BadRequestException(`Failed to generate product embedding: ${error.message}`);
    }
  }

  @Post('ingredient')
  @ApiOperation({ summary: 'Generate embedding for an ingredient' })
  @ApiResponse({ status: 200, description: 'Returns ingredient embedding' })
  async generateIngredientEmbedding(@Body() dto: GenerateIngredientEmbeddingDto): Promise<number[]> {
    try {
      const ingredientText = this.generateIngredientText(dto);
      return await this.fastEmbedService.generateSingleEmbedding(ingredientText);
    } catch (error) {
      throw new BadRequestException(`Failed to generate ingredient embedding: ${error.message}`);
    }
  }

  private generateProductText(dto: GenerateProductEmbeddingDto): string {
    const parts = [
      dto.name,
      dto.description,
      dto.category,
      dto.benefits?.join('. '),
      dto.ingredients?.join(', '),
      dto.usage,
      dto.skinType?.join(', '),
      dto.concerns?.join(', ')
    ];

    return parts.filter(Boolean).join(' | ');
  }

  private generateIngredientText(dto: GenerateIngredientEmbeddingDto): string {
    const parts = [
      dto.name,
      dto.description,
      dto.benefits?.join('. '),
      dto.category,
      dto.source,
      dto.ewgScore ? `EWG Score: ${dto.ewgScore}` : null,
      dto.concerns?.join(', '),
      dto.skinTypes?.join(', ')
    ];

    return parts.filter(Boolean).join(' | ');
  }

  @Post('collections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new vector collection',
    description: 'Create a new collection in the vector database for storing embeddings',
  })
  @ApiBody({ type: CreateCollectionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Collection created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Collection created successfully' },
        name: { type: 'string', example: 'products' },
      },
    },
  })
  async createCollection(
    @Body() createCollectionDto: CreateCollectionDto,
  ) {
    const { name, dimension = 384 } = createCollectionDto;
    await this.qdrantClient.createCollection(name, dimension);
    return { 
      message: 'Collection created successfully',
      name,
    };
  }

  @Get('collections')
  @ApiOperation({
    summary: 'List all collections',
    description: 'Get a list of all vector collections in the database',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of collections',
    type: [CollectionInfoDto],
  })
  async listCollections() {
    // Implementation would depend on QdrantClient's capabilities
    // This is a placeholder - real implementation would get collection info
    const collections = await this.qdrantClient.listCollections();
    return collections;
  }

  @Get('collections/:name')
  @ApiOperation({
    summary: 'Get collection info',
    description: 'Get information about a specific vector collection',
  })
  @ApiParam({
    name: 'name',
    description: 'Collection name',
    example: 'products',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Collection information',
    type: CollectionInfoDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Collection not found',
  })
  async getCollection(
    @Param('name') name: string,
  ) {
    // Implementation would depend on QdrantClient's capabilities
    // This is a placeholder - real implementation would get collection info
    const collectionInfo = await this.qdrantClient.getCollection(name);
    return collectionInfo;
  }

  @Delete('collections/:name')
  @ApiOperation({
    summary: 'Delete a collection',
    description: 'Delete a vector collection and all its vectors from the database',
  })
  @ApiParam({
    name: 'name',
    description: 'Collection name',
    example: 'products',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Collection deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Collection deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Collection not found',
  })
  async deleteCollection(
    @Param('name') name: string,
  ) {
    await this.qdrantClient.deleteCollection(name);
    return { message: 'Collection deleted successfully' };
  }

  @Post('vectors')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upsert vectors',
    description: 'Insert or update vectors in a collection',
  })
  @ApiBody({ type: UpsertVectorsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vectors upserted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Vectors upserted successfully' },
        count: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Collection not found',
  })
  async upsertVectors(
    @Body() upsertVectorsDto: UpsertVectorsDto,
  ) {
    const { collectionName, points } = upsertVectorsDto;
    await this.qdrantClient.upsert(collectionName, points);
    return { 
      message: 'Vectors upserted successfully',
      count: points.length,
    };
  }

  @Delete('vectors/:collectionName/:id')
  @ApiOperation({
    summary: 'Delete a vector by ID',
    description: 'Remove a vector from a collection by its ID',
  })
  @ApiParam({
    name: 'collectionName',
    description: 'Collection name',
    example: 'products',
  })
  @ApiParam({
    name: 'id',
    description: 'Vector ID',
    example: 'product-123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vector deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Vector deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Collection or vector not found',
  })
  async deleteVector(
    @Param('collectionName') collectionName: string,
    @Param('id') id: string,
  ) {
    await this.qdrantClient.delete(collectionName, id);
    return { message: 'Vector deleted successfully' };
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search for similar vectors',
    description: 'Find vectors similar to the provided vector embedding',
  })
  @ApiBody({ type: SimilaritySearchDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results',
    type: SimilaritySearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Collection not found',
  })
  async searchSimilar(
    @Body() similaritySearchDto: SimilaritySearchDto,
  ) {
    const { collectionName, vector, limit = 10 } = similaritySearchDto;
    const results = await this.qdrantClient.search(collectionName, vector, limit);
    return { results };
  }
}