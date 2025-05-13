import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaType } from './entities/media.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { NotFoundException } from '@nestjs/common';

describe('MediaController', () => {
  let controller: MediaController;
  let service: MediaService;

  const mockMedia = {
    id: '1',
    filename: 'product-image-1.jpg',
    originalFilename: 'original-product-image.jpg',
    title: 'Product Image',
    alt: 'Product image description',
    description: 'A detailed product image',
    productId: 'product1',
    type: MediaType.IMAGE,
    url: 'https://example.com/image.jpg',
    size: 1024000,
    mimeType: 'image/jpeg',
    sortOrder: 1,
    isPublic: true,
    isFeatured: true,
    dimensions: {
      width: 1200,
      height: 800
    },
    tags: ['product', 'featured'],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockMediaService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByProduct: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    hardDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a media entry', async () => {
      const createDto: CreateMediaDto = {
        filename: 'product-image-1.jpg',
        originalFilename: 'original-product-image.jpg',
        productId: 'product1',
        type: MediaType.IMAGE,
        url: 'https://example.com/image.jpg',
        size: 1024000,
        mimeType: 'image/jpeg',
        alt: 'Product image',
        title: 'Product Image',
        description: 'A detailed product image',
        sortOrder: 1,
        isPublic: true,
        isFeatured: true,
        tags: ['product', 'featured'],
        dimensions: {
          width: 1200,
          height: 800
        }
      };

      mockMediaService.create.mockResolvedValue(mockMedia);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockMedia);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all media entries with pagination', async () => {
      const media = [mockMedia];
      const skip = undefined;
      const take = 10;
      
      mockMediaService.findAll.mockResolvedValue(media);

      const result = await controller.findAll(skip, take);

      expect(result).toEqual(media);
      expect(service.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: 10,
        productId: undefined,
        type: undefined,
      });
    });

    it('should filter by productId and type', async () => {
      const productId = 'product1';
      const type = MediaType.IMAGE;

      await controller.findAll(undefined, undefined, productId, type);

      expect(service.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        productId,
        type,
      });
    });
  });

  describe('findOne', () => {
    it('should return a media entry by id', async () => {
      mockMediaService.findOne.mockResolvedValue(mockMedia);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockMedia);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findByProduct', () => {
    it('should return media entries for a product', async () => {
      const media = [mockMedia];
      mockMediaService.findByProduct.mockResolvedValue(media);

      const result = await controller.findByProduct('product1');

      expect(result).toEqual(media);
      expect(service.findByProduct).toHaveBeenCalledWith('product1');
    });
  });

  describe('update', () => {
    it('should update a media entry', async () => {
      const updateDto: UpdateMediaDto = {
        alt: 'Updated product image',
        title: 'Updated title',
        description: 'Updated description'
      };

      mockMediaService.update.mockResolvedValue({
        ...mockMedia,
        alt: 'Updated product image',
        title: 'Updated title',
        description: 'Updated description'
      });

      const result = await controller.update('1', updateDto);

      expect(result).toEqual({
        ...mockMedia,
        alt: 'Updated product image',
        title: 'Updated title',
        description: 'Updated description'
      });
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should soft delete a media entry', async () => {
      const softDeletedMedia = {
        ...mockMedia,
        deletedAt: new Date()
      };
      mockMediaService.softDelete.mockResolvedValue(softDeletedMedia);

      const result = await controller.remove('1');

      expect(result).toEqual(softDeletedMedia);
      expect(service.softDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when media to soft delete is not found', async () => {
      mockMediaService.softDelete.mockRejectedValue(new NotFoundException('Media not found'));

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(service.softDelete).toHaveBeenCalledWith('999');
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a media entry', async () => {
      mockMediaService.hardDelete.mockResolvedValue(mockMedia);

      const result = await controller.hardDelete('1');

      expect(result).toEqual(mockMedia);
      expect(service.hardDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when media to hard delete is not found', async () => {
      mockMediaService.hardDelete.mockRejectedValue(new NotFoundException('Media not found'));

      await expect(controller.hardDelete('999')).rejects.toThrow(NotFoundException);
      expect(service.hardDelete).toHaveBeenCalledWith('999');
    });
  });
});