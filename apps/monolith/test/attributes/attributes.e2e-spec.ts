import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AttributeType } from '@prisma/client';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { AttributesModule } from '../../src/modules/attributes/attributes.module';
import { ClerkAuthGuard } from '../../src/common/guards/clerk-auth.guard';

describe('AttributesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Mock ClerkAuthGuard to always allow requests in tests
  const mockClerkAuthGuard = { canActivate: () => true };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AttributesModule],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue(mockClerkAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    // Apply global pipes and middleware
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    await app.init();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.$transaction([
      prisma.attributeValue.deleteMany(),
      prisma.attribute.deleteMany(),
      prisma.attributeGroup.deleteMany(),
    ]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/attribute-groups', () => {
    describe('POST /attribute-groups', () => {
      it('should create an attribute group', async () => {
        const createGroupDto = {
          name: 'Physical Properties',
          code: 'physical-properties',
          description: 'Physical properties of the product',
          active: true,
          sortOrder: 0,
        };

        const response = await request(app.getHttpServer())
          .post('/attribute-groups')
          .send(createGroupDto)
          .expect(201);

        expect(response.body).toMatchObject({
          name: createGroupDto.name,
          code: createGroupDto.code,
          description: createGroupDto.description,
          active: true,
          sortOrder: 0,
        });
        expect(response.body.id).toBeDefined();
      });

      it('should validate attribute group creation', async () => {
        const invalidDto = {
          code: 'invalid-group',
          invalidField: 'should be stripped',
        };

        const response = await request(app.getHttpServer())
          .post('/attribute-groups')
          .send(invalidDto)
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([
            'property invalidField should not exist',
            'name must be a string',
          ])
        );
      });
    });

    describe('GET /attribute-groups', () => {
      it('should get all attribute groups with their attributes', async () => {
        // Create test data
        const group = await prisma.attributeGroup.create({
          data: {
            name: 'Test Group',
            code: 'test-group-1',
            description: 'Test description',
            attributes: {
              create: [
                {
                  name: 'Test Attribute',
                  code: 'test-attr-1',
                  type: AttributeType.TEXT,
                },
              ],
            },
          },
          include: {
            attributes: true,
          },
        });

        const response = await request(app.getHttpServer())
          .get('/attribute-groups')
          .expect(200);

        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: group.id,
              name: group.name,
              code: group.code,
              attributes: expect.arrayContaining([
                expect.objectContaining({
                  id: group.attributes[0].id,
                  name: group.attributes[0].name,
                  code: group.attributes[0].code,
                }),
              ]),
            }),
          ]),
        );
      });
    });
  });

  describe('/attributes', () => {
    let groupId: string;

    beforeEach(async () => {
      const group = await prisma.attributeGroup.create({
        data: {
          name: 'Test Group',
          code: `test-group-${Date.now()}`,
          description: 'Test description',
        },
      });
      groupId = group.id;
    });

    describe('POST /attributes', () => {
      it('should create an attribute with all fields', async () => {
        const createAttributeDto = {
          name: 'Weight',
          code: `weight-${Date.now()}`,
          type: AttributeType.NUMBER,
          description: 'Product weight',
          groupId,
          required: true,
          isFilterable: true,
          isSearchable: true,
          validation: { min: 0, max: 1000 },
          options: { unit: 'kg' },
        };

        const response = await request(app.getHttpServer())
          .post('/attributes')
          .send(createAttributeDto)
          .expect(201);

        expect(response.body).toMatchObject({
          ...createAttributeDto,
          active: true,
        });
        expect(response.body.id).toBeDefined();
      });

      it('should validate attribute creation', async () => {
        const invalidDto = {
          name: 'Invalid',
          code: `invalid-${Date.now()}`,
          type: 'INVALID_TYPE',
          groupId,
          invalidField: 'should be stripped',
        };

        const response = await request(app.getHttpServer())
          .post('/attributes')
          .send(invalidDto)
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([
            'property invalidField should not exist',
            'type must be one of the following values: TEXT, NUMBER, BOOLEAN, DATE, SELECT, MULTI_SELECT, RICH_TEXT, COLOR, FILE',
          ])
        );
      });
    });

    describe('PATCH /attributes/:id', () => {
      it('should update an attribute', async () => {
        const attribute = await prisma.attribute.create({
          data: {
            name: 'Original Name',
            code: `original-code-${Date.now()}`,
            type: AttributeType.TEXT,
            groupId,
          },
        });

        const updateDto = {
          name: 'Updated Name',
          description: 'Updated description',
          isFilterable: true,
        };

        const response = await request(app.getHttpServer())
          .patch(`/attributes/${attribute.id}`)
          .send(updateDto)
          .expect(200);

        expect(response.body).toMatchObject({
          id: attribute.id,
          code: attribute.code,
          type: attribute.type,
          groupId: attribute.groupId,
          name: updateDto.name,
          description: updateDto.description,
          isFilterable: updateDto.isFilterable,
        });

        // Verify dates are valid ISO strings
        expect(Date.parse(response.body.createdAt)).not.toBeNaN();
        expect(Date.parse(response.body.updatedAt)).not.toBeNaN();
      });
    });

    describe('Attribute Values', () => {
      let attributeId: string;

      beforeEach(async () => {
        const attribute = await prisma.attribute.create({
          data: {
            name: 'Test Attribute',
            code: `test-attr-${Date.now()}`,
            type: AttributeType.NUMBER,
            groupId,
          },
        });
        attributeId = attribute.id;
      });

      it('should set and retrieve attribute values with localization', async () => {
        const entityId = 'product-123';
        const entityType = 'product';
        const value = { value: 500 };

        // Set value for English
        await request(app.getHttpServer())
          .post(`/attributes/values/${entityId}`)
          .query({
            entityType,
            attributeId,
            locale: 'en',
            channel: 'web',
          })
          .send({ value })
          .expect(201);

        // Set value for Swedish
        await request(app.getHttpServer())
          .post(`/attributes/values/${entityId}`)
          .query({
            entityType,
            attributeId,
            locale: 'sv',
            channel: 'web',
          })
          .send({ value: { value: 500, unit: 'kg' } })
          .expect(201);

        // Get all values
        const response = await request(app.getHttpServer())
          .get(`/attributes/values/${entityId}`)
          .query({ entityType })
          .expect(200);

        expect(response.body).toHaveLength(2);
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              locale: 'en',
              value: { value: 500 },
            }),
            expect.objectContaining({
              locale: 'sv',
              value: { value: 500, unit: 'kg' },
            }),
          ]),
        );
      });
    });
  });
}); 