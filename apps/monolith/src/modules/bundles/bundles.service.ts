import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';
import { Bundle } from './entities/bundle.entity';
import { Prisma, PrismaClient } from '@prisma/client';

// Define a type that includes the bundle and bundleProduct properties
type PrismaClientWithBundles = PrismaClient & {
  bundle: any;
  bundleProduct: any;
};

@Injectable()
export class BundlesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBundleDto: CreateBundleDto): Promise<Bundle> {
    const { products, ...bundleData } = createBundleDto;

    return this.prisma.$transaction(async (tx) => {
      // Type assertion to add the missing properties
      const prisma = tx as unknown as PrismaClientWithBundles;
      
      const bundle = await prisma.bundle.create({
        data: {
          ...bundleData
        }
      });
      
      // Create bundle product relationships
      if (products && products.length > 0) {
        await Promise.all(
          products.map(product => 
            prisma.bundleProduct.create({
              data: {
                bundleId: bundle.id,
                productId: product.productId,
                quantity: product.quantity
              }
            })
          )
        );
      }
      
      // Return the bundle with related products
      return prisma.bundle.findUnique({
        where: { id: bundle.id },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  }) {
    const { skip, take, where, orderBy } = params;
    
    // Type assertion to add the missing properties
    const prismaWithBundles = this.prisma as unknown as PrismaClientWithBundles;
    
    const total = await prismaWithBundles.bundle.count({ where });
    const bundles = await prismaWithBundles.bundle.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    });

    return {
      items: bundles,
      total,
      page: skip / take + 1,
      limit: take,
      hasMore: skip + take < total
    };
  }

  async findOne(id: string): Promise<Bundle> {
    // Type assertion to add the missing properties
    const prismaWithBundles = this.prisma as unknown as PrismaClientWithBundles;
    
    const bundle = await prismaWithBundles.bundle.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    });

    if (!bundle) {
      throw new NotFoundException(`Bundle with ID ${id} not found`);
    }

    return bundle as unknown as Bundle;
  }

  async update(id: string, updateBundleDto: UpdateBundleDto): Promise<Bundle> {
    const { products, ...bundleData } = updateBundleDto;
    
    return this.prisma.$transaction(async (tx) => {
      // Type assertion to add the missing properties
      const prisma = tx as unknown as PrismaClientWithBundles;
      
      // Check if bundle exists
      const existingBundle = await prisma.bundle.findUnique({
        where: { id },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });

      if (!existingBundle) {
        throw new NotFoundException(`Bundle with ID ${id} not found`);
      }
      
      // First, update the bundle itself
      const updatedBundle = await prisma.bundle.update({
        where: { id },
        data: bundleData,
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });
      
      // If products are provided, update the bundle products
      if (products && products.length > 0) {
        // Delete existing relationships
        await prisma.bundleProduct.deleteMany({
          where: { bundleId: id }
        });
        
        // Create new relationships
        await Promise.all(
          products.map(product => 
            prisma.bundleProduct.create({
              data: {
                bundleId: id,
                productId: product.productId,
                quantity: product.quantity
              }
            })
          )
        );
      }
      
      // Return the updated bundle with fresh product data
      return prisma.bundle.findUnique({
        where: { id },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });
    });
  }

  async remove(id: string): Promise<Bundle> {
    return this.prisma.$transaction(async (tx) => {
      // Type assertion to add the missing properties
      const prisma = tx as unknown as PrismaClientWithBundles;
      
      // Get the bundle before deletion
      const bundle = await prisma.bundle.findUnique({
        where: { id },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });
      
      if (!bundle) {
        throw new NotFoundException(`Bundle with ID ${id} not found`);
      }
      
      // Delete associated bundle products first
      await prisma.bundleProduct.deleteMany({
        where: { bundleId: id }
      });
      
      // Then delete the bundle
      await prisma.bundle.delete({
        where: { id }
      });
      
      return bundle as unknown as Bundle;
    });
  }
}