import { Test, TestingModule } from '@nestjs/testing';
import { PackagingController } from './packaging.controller';
import { PackagingService } from './packaging.service';
import { CreatePackagingDto } from './dto/create-packaging.dto';
import { UpdatePackagingDto } from './dto/update-packaging.dto';
import { ClerkAuthGuard } from '../../infrastructure/guards/clerk-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';

describe('PackagingController', () => {
  let controller: PackagingController;
  let service: PackagingService;

  const mockPackagingService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByProduct: jest.fn(),
    findRecyclable: jest.fn(),
    hardRemove: jest.fn(),
  };

  const mockClerkAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackagingController],
      providers: [
        {
          provide: PackagingService,
          useValue: mockPackagingService,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue(mockClerkAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<PackagingController>(PackagingController);
    service = module.get<PackagingService>(PackagingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreatePackagingDto = {
      name: 'Test Packaging',
      productId: 'test-id',
      type: 'box',
      dimensions: '10x10x10',
      weight: 1.5,
      isRecyclable: true,
      materialComposition: 'cardboard',
    };

    it('should create packaging', async () => {
      const expectedResult = { id: '456', ...createDto };
      mockPackagingService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    const mockPackaging = [
      { id: '1', type: 'Glass Bottle' },
      { id: '2', type: 'Plastic Container' },
    ];

    it('should return paginated packaging list', async () => {
      const expectedResult = {
        items: mockPackaging,
        total: 2,
        skip: undefined,
        take: 10,
      };
      mockPackagingService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(undefined, 10);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: 10,
        productId: undefined,
        type: undefined,
        isRecyclable: undefined,
        isReusable: undefined
      });
    });

    it('should apply filters when provided', async () => {
      await controller.findAll(undefined, 10, '123', 'box', true, false);

      expect(service.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: 10,
        productId: '123',
        type: 'box',
        isRecyclable: true,
        isReusable: false
      });
    });
  });

  describe('findOne', () => {
    const mockPackaging = {
      id: '1',
      type: 'Glass Bottle',
    };

    it('should return packaging by id', async () => {
      mockPackagingService.findOne.mockResolvedValue(mockPackaging);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockPackaging);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findByProduct', () => {
    const mockPackaging = [
      { id: '1', type: 'Glass Bottle' },
      { id: '2', type: 'Plastic Container' },
    ];

    it('should return packaging for product', async () => {
      mockPackagingService.findByProduct.mockResolvedValue(mockPackaging);

      const result = await controller.findByProduct('123');

      expect(result).toEqual(mockPackaging);
      expect(service.findByProduct).toHaveBeenCalledWith('123');
    });
  });

  describe('findRecyclable', () => {
    const mockPackaging = [
      { id: '1', type: 'Glass Bottle', isRecyclable: true },
      { id: '2', type: 'Glass Container', isRecyclable: true },
    ];

    it('should return recyclable packaging', async () => {
      mockPackagingService.findRecyclable.mockResolvedValue(mockPackaging);

      const result = await controller.findRecyclable(true);

      expect(result).toEqual(mockPackaging);
      expect(service.findRecyclable).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdatePackagingDto = {
      type: 'Updated Type',
      weight: 200,
    };

    it('should update packaging', async () => {
      const expectedResult = { id: '1', ...updateDto };
      mockPackagingService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove packaging', async () => {
      const expectedResult = { id: '1', type: 'Glass Bottle' };
      mockPackagingService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('hardRemove', () => {
    it('should permanently remove packaging', async () => {
      const expectedResult = { id: '1', type: 'Glass Bottle' };
      mockPackagingService.hardRemove.mockResolvedValue(expectedResult);

      const result = await controller.hardRemove('1');

      expect(result).toEqual(expectedResult);
      expect(service.hardRemove).toHaveBeenCalledWith('1');
    });
  });
}); 