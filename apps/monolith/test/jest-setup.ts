import { config } from 'dotenv';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

// Load test environment variables
config({ path: join(__dirname, 'test.env') });

const prisma = new PrismaClient();

// Global setup
beforeAll(async () => {
  // Clean up database before all tests
  await prisma.$transaction([
    prisma.attributeValue.deleteMany(),
    prisma.attribute.deleteMany(),
    prisma.attributeGroup.deleteMany(),
  ]);
});

// Global teardown
afterAll(async () => {
  // Clean up database after all tests
  await prisma.$transaction([
    prisma.attributeValue.deleteMany(),
    prisma.attribute.deleteMany(),
    prisma.attributeGroup.deleteMany(),
  ]);
  
  await prisma.$disconnect();
}); 