import { Controller, Get, Query, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from '../services/search.service';
import { SearchQueryDto, SearchEntityType, SearchResultDto } from '../dto/search-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search across entities' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return search results',
    type: SearchResultDto,
  })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'entityType', required: false, enum: SearchEntityType })
  async search(@Query() searchQueryDto: SearchQueryDto): Promise<SearchResultDto<any>> {
    return this.searchService.search(searchQueryDto);
  }

  @Get('products/similar/:id')
  @ApiOperation({ summary: 'Find similar products to the one specified' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return similar products',
    type: [Object],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findSimilarProducts(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    return this.searchService.findSimilarProducts(id, limit);
  }
}