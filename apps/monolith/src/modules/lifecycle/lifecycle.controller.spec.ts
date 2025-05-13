import { Test, TestingModule } from '@nestjs/testing';
import { LifecycleController } from './lifecycle.controller';
import { LifecycleService } from './lifecycle.service';
import { CreateLifecycleDto, LifecycleStatus } from './dto/create-lifecycle.dto';
import { UpdateLifecycleDto } from './dto/update-lifecycle.dto';
import { NotFoundException } from '@nestjs/common';

describe('LifecycleController', () => {
  let controller: LifecycleController;
  let service: LifecycleService;

  const mockLifecycle = {
    id: '1',
    productId: 'product-1',
    status: LifecycleStatus.DRAFT,
    userId: 'user-1',
    comment: 'Initial draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    product: {
      id: 'product-1',
      name: 'Test Product',
    },
    user: {
      id: 'user-1',
      name: 'Test User',
    },
  };

  const mockLifecycleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getCurrentStatus: jest.fn(),
    transitionStatus: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LifecycleController],
      providers: [
        {
          provide: LifecycleService,
          useValue: mockLifecycleService,
        },
      ],
    }).compile();

    controller = module.get<LifecycleController>(LifecycleController);
    service = module.get<LifecycleService>(LifecycleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateLifecycleDto = {
      productId: 'product-1',
      status: LifecycleStatus.DRAFT,
      userId: 'user-1',
      comment: 'Initial draft',
    };

    it('should create a lifecycle entry', async () => {
      mockLifecycleService.create.mockResolvedValue(mockLifecycle);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockLifecycle);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockLifecycleService.create.mockRejectedValue(new NotFoundException('Product not found'));
      await expect(controller.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all lifecycle entries without filters', async () => {
      mockLifecycleService.findAll.mockResolvedValue([mockLifecycle]);
      const result = await controller.findAll();
      expect(result).toEqual([mockLifecycle]);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should return filtered lifecycle entries', async () => {
      const filters = { productId: 'product-1', status: LifecycleStatus.DRAFT };
      mockLifecycleService.findAll.mockResolvedValue([mockLifecycle]);
      const result = await controller.findAll(filters.productId, filters.status);
      expect(result).toEqual([mockLifecycle]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne', () => {
    it('should return a lifecycle entry by id', async () => {
      mockLifecycleService.findOne.mockResolvedValue(mockLifecycle);
      const result = await controller.findOne('1');
      expect(result).toEqual(mockLifecycle);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when lifecycle entry not found', async () => {
      mockLifecycleService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCurrentStatus', () => {
    it('should return current status of a product', async () => {
      mockLifecycleService.getCurrentStatus.mockResolvedValue(LifecycleStatus.DRAFT);
      const result = await controller.getCurrentStatus('product-1');
      expect(result).toBe(LifecycleStatus.DRAFT);
      expect(service.getCurrentStatus).toHaveBeenCalledWith('product-1');
    });

    it('should throw NotFoundException when no lifecycle entries found', async () => {
      mockLifecycleService.getCurrentStatus.mockRejectedValue(new NotFoundException());
      await expect(controller.getCurrentStatus('invalid-product')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transitionStatus', () => {
    const transitionData = {
      status: LifecycleStatus.IN_REVIEW,
      userId: 'user-1',
      comment: 'Ready for review',
    };

    it('should transition product status', async () => {
      mockLifecycleService.transitionStatus.mockResolvedValue({
        ...mockLifecycle,
        status: LifecycleStatus.IN_REVIEW,
      });

      const result = await controller.transitionStatus(
        'product-1',
        transitionData.status,
        transitionData.userId,
        transitionData.comment,
      );

      expect(result.status).toBe(LifecycleStatus.IN_REVIEW);
      expect(service.transitionStatus).toHaveBeenCalledWith(
        'product-1',
        transitionData.status,
        transitionData.userId,
        transitionData.comment,
      );
    });

    it('should throw NotFoundException when product not found', async () => {
      mockLifecycleService.transitionStatus.mockRejectedValue(new NotFoundException());
      await expect(
        controller.transitionStatus(
          'invalid-product',
          transitionData.status,
          transitionData.userId,
          transitionData.comment,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateLifecycleDto = {
      comment: 'Updated comment',
    };

    it('should update a lifecycle entry', async () => {
      const updatedLifecycle = { ...mockLifecycle, ...updateDto };
      mockLifecycleService.update.mockResolvedValue(updatedLifecycle);
      const result = await controller.update('1', updateDto);
      expect(result).toEqual(updatedLifecycle);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw NotFoundException when lifecycle entry not found', async () => {
      mockLifecycleService.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update('999', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a lifecycle entry', async () => {
      mockLifecycleService.remove.mockResolvedValue(mockLifecycle);
      const result = await controller.remove('1');
      expect(result).toEqual(mockLifecycle);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when lifecycle entry not found', async () => {
      mockLifecycleService.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
}); 