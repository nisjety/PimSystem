import { Test, TestingModule } from '@nestjs/testing';
import { BundlesController } from '../bundles.controller';
import { BundlesService } from '../bundles.service';
import { CreateBundleDto } from '../dto/create-bundle.dto';
import { UpdateBundleDto } from '../dto/update-bundle.dto';
import { Bundle } from '../entities/bundle.entity';
import { ConfigService } from '@nestjs/config';
import { ClerkAuthGuard } from '../../../infrastructure/guards/clerk-auth.guard';

describe('BundlesController', () => {
  let controller: BundlesController;
  let service: BundlesService;

  const mockBundle: Bundle = {
    id: '1',
    name: 'Test Bundle',
    description: 'Test Description',
    sku: 'TEST-SKU-001',
    price: 99.99,
    isActive: true,
    products: [
      {
        id: '1',
        bundleId: '1',
        productId: '1',
        quantity: 2,
        bundle: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
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
        ClerkAuthGuard,
      ],
    }).compile();

    controller = module.get<BundlesController>(BundlesController);
    service = module.get<BundlesService>(BundlesService);
  });

  describe('create', () => {
    const createBundleDto: CreateBundleDto = {
      name: 'Test Bundle',
      description: 'Test Description',
      sku: 'TEST-SKU-001',
      price: 99.99,
      isActive: true,
      products: [
        {
          productId: '1',
          quantity: 2,
        },
      ],
    };

    it('should create a bundle', async () => {
      mockBundlesService.create.mockResolvedValue(mockBundle);

      const result = await controller.create(createBundleDto);

      expect(result).toEqual(mockBundle);
      expect(mockBundlesService.create).toHaveBeenCalledWith(createBundleDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of bundles', async () => {
      mockBundlesService.findAll.mockResolvedValue([mockBundle]);

      const result = await controller.findAll();

      expect(result).toEqual([mockBundle]);
      expect(mockBundlesService.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('findOne', () => {
    it('should return a bundle by id', async () => {
      mockBundlesService.findOne.mockResolvedValue(mockBundle);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockBundle);
      expect(mockBundlesService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    const updateBundleDto: UpdateBundleDto = {
      name: 'Updated Bundle',
      products: [
        {
          productId: '2',
          quantity: 3,
        },
      ],
    };

    it('should update a bundle', async () => {
      const updatedBundle = { ...mockBundle, ...updateBundleDto };
      mockBundlesService.update.mockResolvedValue(updatedBundle);

      const result = await controller.update('1', updateBundleDto);

      expect(result).toEqual(updatedBundle);
      expect(mockBundlesService.update).toHaveBeenCalledWith('1', updateBundleDto);
    });
  });

  describe('remove', () => {
    it('should delete a bundle', async () => {
      mockBundlesService.remove.mockResolvedValue(mockBundle);

      const result = await controller.remove('1');

      expect(result).toEqual(mockBundle);
      expect(mockBundlesService.remove).toHaveBeenCalledWith('1');
    });
  });
}); 