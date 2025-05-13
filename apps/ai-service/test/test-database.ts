import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const setupTestDatabase = async () => {
  // Create test data
  const ingredient = await prisma.ingredient.create({
    data: {
      name: "Hyaluronic Acid",
      inciName: "Sodium Hyaluronate",
      description:
        "A powerful humectant that can hold up to 1000x its weight in water",
      category: "hydrator",
      commonUses: ["Hydration", "Anti-aging"],
      potentialReactions: "Generally well-tolerated",
    },
  });

  await prisma.product.create({
    data: {
      name: "Hydrating Toner",
      description: "A gentle, hydrating toner suitable for all skin types",
      ingredients: {
        connect: [{ id: ingredient.id }],
      },
      categories: ["Toners"],
      tags: ["hydrating", "gentle", "alcohol-free"],
    },
  });
};

export const cleanupTestDatabase = async () => {
  await prisma.ingredient.deleteMany();
  await prisma.product.deleteMany();
};

export const getTestPrismaClient = () => prisma;
