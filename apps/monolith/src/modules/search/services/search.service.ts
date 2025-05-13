import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { SearchQueryDto, SearchEntityType, SearchSortField, SearchSortDirection, SearchResultDto } from '../dto/search-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Perform a unified search across multiple entities
   */
  async search(searchQueryDto: SearchQueryDto): Promise<SearchResultDto<any>> {
    this.logger.log(`Searching for "${searchQueryDto.query}"`);
    
    // Determine which entities to search based on entityType
    const entitiesToSearch = this.getEntitiesToSearch(searchQueryDto.entityType);
    
    // If searching multiple entity types, search them in parallel and combine results
    if (entitiesToSearch.length > 1) {
      const combinedResults = await this.searchMultipleEntities(searchQueryDto, entitiesToSearch);
      return combinedResults;
    } else if (entitiesToSearch.length === 1) {
      // If searching a single entity type, use the specific search method
      const entityType = entitiesToSearch[0];
      
      switch (entityType) {
        case SearchEntityType.PRODUCT:
          return this.searchProducts(searchQueryDto);
        case SearchEntityType.CATEGORY:
          return this.searchCategories(searchQueryDto);
        case SearchEntityType.INGREDIENT:
          return this.searchIngredients(searchQueryDto);
        case SearchEntityType.BUNDLE:
          return this.searchBundles(searchQueryDto);
      }
    }
    
    // Fallback empty result
    return {
      items: [],
      total: 0,
      page: searchQueryDto.page,
      limit: searchQueryDto.limit,
      totalPages: 0,
      entityType: [],
    };
  }
  
  /**
   * Search specifically for products
   */
  async searchProducts(searchQueryDto: SearchQueryDto): Promise<SearchResultDto<any>> {
    const { query, page = 1, limit = 10, sortBy, sortDirection } = searchQueryDto;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build the where clause for full-text search
    const where: Prisma.ProductWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
      ],
      isActive: true,
      deletedAt: null,
    };
    
    // Add category filter if specified
    if (searchQueryDto.categories?.length) {
      where.categories = {
        some: {
          categoryId: {
            in: searchQueryDto.categories,
          },
        },
      };
    }
    
    // Add ingredient filter if specified
    if (searchQueryDto.ingredients?.length) {
      where.ingredients = {
        some: {
          ingredientId: {
            in: searchQueryDto.ingredients,
          },
        },
      };
    }
    
    // Add tag filter if specified
    if (searchQueryDto.tags?.length) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: searchQueryDto.tags,
            },
          },
        },
      };
    }

    // Determine sort order
    const orderBy = this.buildOrderBy(sortBy, sortDirection);

    try {
      // Execute the search query with pagination
      const [items, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            categories: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            media: {
              where: {
                isFeatured: true,
              },
              take: 1,
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
            tags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      // Transform results to be more frontend-friendly
      const transformedItems = items.map(product => ({
        ...product,
        categories: product.categories?.map(c => c.category),
        featuredImage: product.media?.[0] || null,
        tags: product.tags?.map(t => t.tag),
      }));

      return {
        items: transformedItems,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        entityType: [SearchEntityType.PRODUCT],
      };
    } catch (error) {
      this.logger.error(`Error searching products: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search specifically for categories
   */
  async searchCategories(searchQueryDto: SearchQueryDto): Promise<SearchResultDto<any>> {
    const { query, page = 1, limit = 10, sortBy, sortDirection } = searchQueryDto;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build the where clause for full-text search
    const where: Prisma.CategoryWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
      ],
      isActive: true,
      deletedAt: null,
    };

    // Determine sort order
    const orderBy = this.buildOrderBy(sortBy, sortDirection);

    try {
      // Execute the search query with pagination
      const [items, total] = await Promise.all([
        this.prisma.category.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                children: true,
                products: true,
              },
            },
          },
        }),
        this.prisma.category.count({ where }),
      ]);

      // Transform results for consistent output
      const transformedItems = items.map(category => ({
        ...category,
        childrenCount: category._count?.children || 0,
        productsCount: category._count?.products || 0,
        _count: undefined,
      }));

      return {
        items: transformedItems,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        entityType: [SearchEntityType.CATEGORY],
      };
    } catch (error) {
      this.logger.error(`Error searching categories: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search specifically for ingredients
   */
  async searchIngredients(searchQueryDto: SearchQueryDto): Promise<SearchResultDto<any>> {
    const { query, page = 1, limit = 10, sortBy, sortDirection } = searchQueryDto;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build the where clause for full-text search
    const where: Prisma.IngredientWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
      isActive: true,
    };

    // Determine sort order
    const orderBy = this.buildOrderBy(sortBy, sortDirection);

    try {
      // Execute the search query with pagination
      const [items, total] = await Promise.all([
        this.prisma.ingredient.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        }),
        this.prisma.ingredient.count({ where }),
      ]);

      // Transform results for consistent output
      const transformedItems = items.map(ingredient => ({
        ...ingredient,
        productsCount: ingredient._count?.products || 0,
        _count: undefined,
      }));

      return {
        items: transformedItems,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        entityType: [SearchEntityType.INGREDIENT],
      };
    } catch (error) {
      this.logger.error(`Error searching ingredients: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search specifically for bundles
   */
  async searchBundles(searchQueryDto: SearchQueryDto): Promise<SearchResultDto<any>> {
    const { query, page = 1, limit = 10, sortBy, sortDirection } = searchQueryDto;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build the where clause for full-text search
    const where: Prisma.BundleWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
      ],
      isActive: true,
      deletedAt: null,
    };

    // Determine sort order
    const orderBy = this.buildOrderBy(sortBy, sortDirection);

    try {
      // Execute the search query with pagination
      const [items, total] = await Promise.all([
        this.prisma.bundle.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            products: {
              take: 5,
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.bundle.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        entityType: [SearchEntityType.BUNDLE],
      };
    } catch (error) {
      this.logger.error(`Error searching bundles: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search across multiple entity types and combine results
   */
  private async searchMultipleEntities(
    searchQueryDto: SearchQueryDto,
    entityTypes: SearchEntityType[],
  ): Promise<SearchResultDto<any>> {
    // Execute all searches in parallel
    const searchPromises = entityTypes.map(entityType => {
      const clonedQuery = { ...searchQueryDto, entityType };
      
      switch (entityType) {
        case SearchEntityType.PRODUCT:
          return this.searchProducts(clonedQuery);
        case SearchEntityType.CATEGORY:
          return this.searchCategories(clonedQuery);
        case SearchEntityType.INGREDIENT:
          return this.searchIngredients(clonedQuery);
        case SearchEntityType.BUNDLE:
          return this.searchBundles(clonedQuery);
        default:
          return null;
      }
    });

    // Wait for all searches to complete
    const results = await Promise.all(searchPromises.filter(Boolean));
    
    // Combine all results
    const allItems = results.flatMap(result => 
      result.items.map(item => ({
        ...item,
        entityType: result.entityType[0], // Add the entity type to each item
      }))
    );
    
    const totalResults = results.reduce((sum, result) => sum + result.total, 0);
    
    // Calculate the proper page size for the combined results
    // This is a simplified approach for combining paginated results
    return {
      items: allItems.slice(0, searchQueryDto.limit),
      total: totalResults,
      page: searchQueryDto.page,
      limit: searchQueryDto.limit,
      totalPages: Math.ceil(totalResults / searchQueryDto.limit),
      entityType: entityTypes,
    };
  }

  /**
   * Determine which entities to search based on entityType
   */
  private getEntitiesToSearch(entityType: SearchEntityType): SearchEntityType[] {
    if (entityType === SearchEntityType.ALL) {
      return [
        SearchEntityType.PRODUCT,
        SearchEntityType.CATEGORY,
        SearchEntityType.INGREDIENT,
        SearchEntityType.BUNDLE,
      ];
    }
    return [entityType];
  }

  /**
   * Build the orderBy clause based on sort parameters
   */
  private buildOrderBy(sortBy: SearchSortField, sortDirection: SearchSortDirection): any {
    // If sorting by relevance in a database without native relevance scoring,
    // we'll default to name as a reasonable alternative
    if (sortBy === SearchSortField.RELEVANCE) {
      return { name: sortDirection === SearchSortDirection.ASC ? 'asc' : 'desc' };
    }
    
    return { [sortBy]: sortDirection === SearchSortDirection.ASC ? 'asc' : 'desc' };
  }

  /**
   * Get similar or related products based on a product ID
   */
  async findSimilarProducts(productId: string, limit: number = 5): Promise<any[]> {
    // Get the source product
    const sourceProduct = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: {
          select: {
            categoryId: true,
          },
        },
        ingredients: {
          select: {
            ingredientId: true,
          },
        },
        tags: {
          select: {
            tagId: true,
          },
        },
      },
    });

    if (!sourceProduct) {
      return [];
    }

    // Extract related data
    const categoryIds = sourceProduct.categories.map(c => c.categoryId);
    const ingredientIds = sourceProduct.ingredients.map(i => i.ingredientId);
    const tagIds = sourceProduct.tags.map(t => t.tagId);

    // Find similar products based on shared categories, ingredients, or tags
    const similarProducts = await this.prisma.product.findMany({
      where: {
        id: { not: productId }, // Exclude the source product
        isActive: true,
        deletedAt: null,
        OR: [
          // Products in the same categories
          {
            categories: {
              some: {
                categoryId: {
                  in: categoryIds,
                },
              },
            },
          },
          // Products with the same ingredients
          {
            ingredients: {
              some: {
                ingredientId: {
                  in: ingredientIds,
                },
              },
            },
          },
          // Products with the same tags
          {
            tags: {
              some: {
                tagId: {
                  in: tagIds,
                },
              },
            },
          },
        ],
      },
      include: {
        media: {
          where: { isFeatured: true },
          take: 1,
          select: {
            id: true,
            url: true,
            alt: true,
          },
        },
      },
      take: limit,
    });

    return similarProducts.map(product => ({
      ...product,
      featuredImage: product.media?.[0] || null,
    }));
  }
}