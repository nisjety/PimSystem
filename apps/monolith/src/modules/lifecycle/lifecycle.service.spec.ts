import { Test, TestingModule } from '@nestjs/testing';
import { LifecycleService } from './lifecycle.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LifecycleStatus } from './dto/create-lifecycle.dto';

describe('LifecycleService', () => {
  let service: LifecycleService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
    },
    productLifecycle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LifecycleService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LifecycleService>(LifecycleService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      productId: 'product1',
      status: LifecycleStatus.DRAFT,
      userId: 'user1',
      comment: 'Initial draft',
      scheduledDate: new Date('2024-03-20'),
    };

    it('should create a lifecycle entry successfully', async () => {
      const mockProduct = { id: 'product1', name: 'Test Product' };
      const mockLifecycle = {
        id: 'lifecycle1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: mockProduct,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.productLifecycle.create.mockResolvedValue(mockLifecycle);

      const result = await service.create(createDto);

      expect(result).toEqual(mockLifecycle);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product1' },
      });
      expect(mockPrismaService.productLifecycle.create).toHaveBeenCalledWith({
        data: {
          status: LifecycleStatus.DRAFT,
          comment: 'Initial draft',
          scheduledDate: createDto.scheduledDate,
          product: { connect: { id: 'product1' } },
          user: { connect: { id: 'user1' } },
        },
        include: {
          product: true,
        },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return filtered lifecycle entries', async () => {
      const mockEntries = [
        {
          id: 'lifecycle1',
          status: LifecycleStatus.DRAFT,
          productId: 'product1',
          userId: 'user1',
          comment: 'Draft state',
          scheduledDate: new Date('2024-03-20'),
          createdAt: new Date(),
          updatedAt: new Date(),
          product: { id: 'product1', name: 'Product 1' },
        },
        {
          id: 'lifecycle2',
          status: LifecycleStatus.IN_REVIEW,
          productId: 'product2',
          userId: 'user1',
          comment: 'In review',
          scheduledDate: new Date('2024-03-21'),
          createdAt: new Date(),
          updatedAt: new Date(),
          product: { id: 'product2', name: 'Product 2' },
        },
      ];

      mockPrismaService.productLifecycle.findMany.mockResolvedValue(mockEntries);

      const result = await service.findAll({
        productId: 'product1',
        status: LifecycleStatus.DRAFT,
      });

      expect(result).toEqual(mockEntries);
      expect(mockPrismaService.productLifecycle.findMany).toHaveBeenCalledWith({
        where: {
          productId: 'product1',
          status: LifecycleStatus.DRAFT,
        },
        include: {
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a lifecycle entry', async () => {
      const mockEntry = {
        id: 'lifecycle1',
        status: LifecycleStatus.DRAFT,
        productId: 'product1',
        userId: 'user1',
        comment: 'Draft state',
        scheduledDate: new Date('2024-03-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
        product: { id: 'product1', name: 'Product 1' },
      };

      mockPrismaService.productLifecycle.findUnique.mockResolvedValue(mockEntry);

      const result = await service.findOne('lifecycle1');

      expect(result).toEqual(mockEntry);
      expect(mockPrismaService.productLifecycle.findUnique).toHaveBeenCalledWith({
        where: { id: 'lifecycle1' },
        include: {
          product: true,
        },
      });
    });

    it('should throw NotFoundException when entry not found', async () => {
      mockPrismaService.productLifecycle.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCurrentStatus', () => {
    it('should return current status', async () => {
      const mockStatus = {
        status: LifecycleStatus.DRAFT,
        createdAt: new Date(),
      };

      mockPrismaService.productLifecycle.findFirst.mockResolvedValue(mockStatus);

      const result = await service.getCurrentStatus('product1');

      expect(result).toBe(LifecycleStatus.DRAFT);
      expect(mockPrismaService.productLifecycle.findFirst).toHaveBeenCalledWith({
        where: { productId: 'product1' },
        orderBy: { createdAt: 'desc' },
        select: { status: true },
      });
    });

    it('should throw NotFoundException when no entries found', async () => {
      mockPrismaService.productLifecycle.findFirst.mockResolvedValue(null);

      await expect(service.getCurrentStatus('product1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transitionStatus', () => {
    const transitionDto = {
      productId: 'product1',
      status: LifecycleStatus.IN_REVIEW,
      userId: 'user1',
      comment: 'Ready for review',
      scheduledDate: new Date('2024-03-21'),
    };

    it('should transition status successfully', async () => {
      const mockProduct = { id: 'product1', name: 'Test Product' };
      const newEntry = {
        id: 'lifecycle2',
        ...transitionDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: mockProduct,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.productLifecycle.create.mockResolvedValue(newEntry);

      const result = await service.transitionStatus(
        'product1',
        LifecycleStatus.IN_REVIEW,
        'user1',
        'Ready for review',
        transitionDto.scheduledDate,
      );

      expect(result).toEqual(newEntry);
      expect(mockPrismaService.productLifecycle.create).toHaveBeenCalledWith({
        data: {
          status: LifecycleStatus.IN_REVIEW,
          comment: 'Ready for review (User user1 changed status to IN_REVIEW)',
          scheduledDate: transitionDto.scheduledDate,
          product: { connect: { id: 'product1' } },
          user: { connect: { id: 'user1' } },
        },
        include: {
          product: true,
        },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.transitionStatus(
          'nonexistent',
          LifecycleStatus.IN_REVIEW,
          'user1',
          'Ready for review',
          new Date(),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update lifecycle entry successfully', async () => {
      const updateDto = { comment: 'Updated comment' };
      const mockEntry = { 
        id: 'lifecycle1',
        ...updateDto,
        product: { id: 'product1' },
      };

      mockPrismaService.productLifecycle.findUnique.mockResolvedValue(mockEntry);
      mockPrismaService.productLifecycle.update.mockResolvedValue(mockEntry);

      const result = await service.update('lifecycle1', updateDto);

      expect(result).toEqual(mockEntry);
      expect(mockPrismaService.productLifecycle.update).toHaveBeenCalledWith({
        where: { id: 'lifecycle1' },
        data: updateDto,
        include: {
          product: true,
        },
      });
    });

    it('should throw NotFoundException when entry not found', async () => {
      mockPrismaService.productLifecycle.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { comment: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove lifecycle entry successfully', async () => {
      const mockEntry = { 
        id: 'lifecycle1',
        status: LifecycleStatus.DRAFT,
        product: { id: 'product1' },
      };

      mockPrismaService.productLifecycle.findUnique.mockResolvedValue(mockEntry);
      mockPrismaService.productLifecycle.delete.mockResolvedValue(mockEntry);

      const result = await service.remove('lifecycle1');

      expect(result).toEqual(mockEntry);
      expect(mockPrismaService.productLifecycle.delete).toHaveBeenCalledWith({
        where: { id: 'lifecycle1' },
        include: {
          product: true,
        },
      });
    });

    it('should throw NotFoundException when entry not found', async () => {
      mockPrismaService.productLifecycle.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});