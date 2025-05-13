import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

// Load test environment variables
config({ path: resolve(__dirname, "./test.env") });

// Create test database if it doesn't exist
const createTestDatabase = async () => {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
  } catch (error) {
    if (error.message.includes("does not exist")) {
      // Database doesn't exist, create it using Prisma
      const url = process.env.DATABASE_URL?.replace("/pim_test_db", "/postgres");
      const prisma = new PrismaClient({ datasourceUrl: url });
      await prisma.$executeRawUnsafe("CREATE DATABASE pim_test_db;");
      await prisma.$disconnect();
      
      // Run migrations on the test database
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
    } else {
      throw error;
    }
  }
};

// Run database setup
createTestDatabase();

// Additional test setup can be added here
