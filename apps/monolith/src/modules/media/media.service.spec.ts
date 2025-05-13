import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaType } from './entities/media.entity';

describe('MediaService', () => {
  let service: MediaService;
  let prisma: PrismaService;

  const mockPrismaService = {
    media: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createMediaDto: CreateMediaDto = {
      productId: 'product-1',
      tags: ['tag1', 'tag2'],
      dimensions: {
        width: 800,
        height: 600
      },
      filename: 'test.jpg',
      originalFilename: 'original.jpg',
      title: 'Test Image',
      alt: 'Test Alt Text',
      description: 'Test Description',
      type: MediaType.IMAGE,
      url: 'https://example.com/test.jpg',
      isFeatured: true,
      mimeType: 'image/jpeg',
      size: 1024000,
      sortOrder: 0,
      isPublic: true
    };

    it('should create a media item', async () => {
      const mockProduct = {
        id: 'product-1',
        name: 'Test Product',
      };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const mockMedia = {
        id: 'media-1',
        ...createMediaDto,
        dimensions: JSON.stringify(createMediaDto.dimensions),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockCreateResponse = {
        ...mockMedia,
        product: mockProduct
      };

      mockPrismaService.media.create.mockResolvedValue(mockCreateResponse);

      const result = await service.create(createMediaDto);

      // The service should parse the dimensions JSON string
      const expectedResult = {
        ...mockCreateResponse,
        dimensions: JSON.parse(mockCreateResponse.dimensions)
      };

      expect(result).toEqual(expectedResult);

      // Remove productId from expected data since it's handled separately
      const { productId, ...expectedData } = createMediaDto;
      
      expect(mockPrismaService.media.create).toHaveBeenCalledWith({
        data: {
          ...expectedData,
          dimensions: JSON.stringify(createMediaDto.dimensions),
          product: { connect: { id: createMediaDto.productId } }
        },
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      await expect(service.create(createMediaDto)).rejects.toThrow(
        `Product with ID ${createMediaDto.productId} not found`
      );
    });
  });

  describe('findAll', () => {
    const mockMedia = [
      {
        id: '1',
        type: MediaType.IMAGE,
        url: 'https://example.com/image1.jpg',
        dimensions: null,
        tags: [],
        product: { 
          id: 'product-1',
          name: 'Product 1' 
        }
      },
      {
        id: '2',
        type: MediaType.IMAGE,
        url: 'https://example.com/image2.jpg',
        dimensions: null,
        tags: [],
        product: { 
          id: 'product-2',
          name: 'Product 2' 
        }
      },
    ];

    it('should return paginated media list', async () => {
      mockPrismaService.media.findMany.mockResolvedValue(mockMedia);
      mockPrismaService.media.count.mockResolvedValue(2);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(result.items).toEqual(mockMedia);
      expect(result.total).toBe(2);
      expect(prisma.media.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          deletedAt: null
        },
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should apply filters when provided', async () => {
      await service.findAll({ 
        skip: 0, 
        take: 10,
        type: MediaType.IMAGE,
        productId: 'product-1'
      });

      expect(prisma.media.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          deletedAt: null,
          type: MediaType.IMAGE,
          productId: 'product-1'
        },
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('findOne', () => {
    const mockMedia = {
      id: '1',
      type: MediaType.IMAGE,
      url: 'https://example.com/image.jpg',
      dimensions: null,
      tags: [],
      product: { 
        id: 'product-1',
        name: 'Test Product' 
      }
    };

    it('should return a media item by id', async () => {
      mockPrismaService.media.findUnique.mockResolvedValue(mockMedia);

      const result = await service.findOne('1');

      expect(result).toEqual(mockMedia);
      expect(prisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException when media not found', async () => {
      mockPrismaService.media.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(
        'Media with ID "1" not found'
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateMediaDto = {
      filename: 'updated-image.jpg',
      alt: 'Updated Alt Text',
      title: 'Updated Title',
      productId: 'product-2'
    };

    it('should update a media item', async () => {
      const mockProduct = {
        id: 'product-2',
        name: 'Test Product 2'
      };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const expectedResult = {
        id: '1',
        ...updateDto,
        dimensions: null,
        tags: [],
        product: { 
          id: 'product-2',
          name: 'Test Product 2' 
        }
      };

      mockPrismaService.media.update.mockResolvedValue(expectedResult);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.media.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          filename: updateDto.filename,
          alt: updateDto.alt,
          title: updateDto.title,
          product: {
            connect: { id: updateDto.productId }
          }
        },
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateDto)).rejects.toThrow(
        `Product with ID "${updateDto.productId}" not found`
      );
    });
  });

  describe('softDelete', () => {
    const mediaId = '1';
    const mockMedia = {
      id: mediaId,
      type: MediaType.IMAGE,
      url: 'https://example.com/image.jpg',
      dimensions: null,
      tags: [],
      product: {
        id: 'product-1',
        name: 'Test Product'
      }
    };

    it('should soft delete a media entry', async () => {
      mockPrismaService.media.findUnique.mockResolvedValue(mockMedia);
      mockPrismaService.media.update.mockResolvedValue({
        ...mockMedia,
        deletedAt: new Date()
      });

      const result = await service.softDelete(mediaId);

      expect(result).toEqual({
        ...mockMedia,
        deletedAt: expect.any(Date)
      });
      expect(prisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: mediaId },
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      expect(prisma.media.update).toHaveBeenCalledWith({
        where: { id: mediaId },
        data: { deletedAt: expect.any(Date) },
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException when media not found', async () => {
      mockPrismaService.media.findUnique.mockResolvedValue(null);

      await expect(service.softDelete(mediaId)).rejects.toThrow(NotFoundException);
      expect(prisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: mediaId },
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    });
  });

  describe('hardDelete', () => {
    const mediaId = '1';
    const mockMedia = {
      id: mediaId,
      type: MediaType.IMAGE,
      url: 'https://example.com/image.jpg',
      dimensions: null,
      tags: [],
      product: {
        id: 'product-1',
        name: 'Test Product'
      }
    };

    it('should permanently delete a media item', async () => {
      mockPrismaService.media.findUnique.mockResolvedValue(mockMedia);
      mockPrismaService.media.delete.mockResolvedValue(mockMedia);

      const result = await service.hardDelete(mediaId);

      expect(result).toEqual(mockMedia);
      expect(prisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: mediaId },
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      expect(prisma.media.delete).toHaveBeenCalledWith({
        where: { id: mediaId }
      });
    });

    it('should throw NotFoundException when media to hard delete is not found', async () => {
      mockPrismaService.media.findUnique.mockResolvedValue(null);

      await expect(service.hardDelete(mediaId)).rejects.toThrow(NotFoundException);
      expect(prisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: mediaId },
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    });
  });
});