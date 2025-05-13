import { Test, TestingModule } from '@nestjs/testing';
import { BundlesController } from './bundles.controller';
import { BundlesService } from './bundles.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';
import { ConfigService } from '@nestjs/config';
import { ClerkAuthGuard } from '../../infrastructure/guards/clerk-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';

describe('BundlesController', () => {
  let controller: BundlesController;
  let service: BundlesService;

  const mockBundle = {
    id: '1',
    name: 'Test Bundle',
    description: 'Test Description',
    isActive: true,
    products: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockBundlesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'CLERK_SECRET_KEY':
          return 'test-secret-key';
        case 'FRONTEND_URL':
          return 'http://localhost:3000';
        case 'MONOLITH_URL':
          return 'http://localhost:3001';
        case 'CLERK_ISSUER':
          return 'test-issuer';
        default:
          return undefined;
      }
    }),
  };

  const mockClerkAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BundlesController],
      providers: [
        {
          provide: BundlesService,
          useValue: mockBundlesService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue(mockClerkAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<BundlesController>(BundlesController);
    service = module.get<BundlesService>(BundlesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a bundle', async () => {
      const createDto: CreateBundleDto = {
        name: 'Test Bundle',
        description: 'Test Description',
        sku: 'TEST-SKU-001',
        price: 99.99,
        isActive: true,
        products: [
          {
            productId: '1',
            quantity: 2
          }
        ]
      };

      mockBundlesService.create.mockResolvedValue(mockBundle);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockBundle);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all bundles with default pagination', async () => {
      const paginatedResponse = {
        items: [mockBundle],
        total: 1,
        skip: 0,
        take: 10,
      };

      mockBundlesService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll();

      expect(result).toEqual(paginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle search parameters', async () => {
      const name = 'test';
      const isActive = true;
      const skip = 5;
      const take = 20;

      await controller.findAll(skip, take, name, isActive);

      expect(service.findAll).toHaveBeenCalledWith({
        skip: 5,
        take: 20,
        where: {
          name: { contains: name, mode: 'insensitive' },
          isActive: isActive,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a bundle by id', async () => {
      mockBundlesService.findOne.mockResolvedValue(mockBundle);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockBundle);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a bundle', async () => {
      const updateDto: UpdateBundleDto = {
        name: 'Updated Bundle',
        description: 'Updated Description',
      };

      mockBundlesService.update.mockResolvedValue({
        ...mockBundle,
        ...updateDto,
      });

      const result = await controller.update('1', updateDto);

      expect(result).toEqual({
        ...mockBundle,
        ...updateDto,
      });
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a bundle', async () => {
      mockBundlesService.remove.mockResolvedValue(mockBundle);

      const result = await controller.remove('1');

      expect(result).toEqual(mockBundle);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
}); 