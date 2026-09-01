/**
 * src/server/testConnection.ts
 * Standalone database verification script.
 */

import dotenv from "dotenv";
dotenv.config();

import prisma from "./lib/prisma";

async function testConnection() {
  console.log("--------------------------------------------------");
  console.log("POSTGRESQL & PRISMA DATABASE CONNECTION AUDIT");
  console.log("--------------------------------------------------");
  try {
    const startTime = Date.now();
    const result = await prisma.$queryRaw<Array<{ current_database: string }>>`SELECT current_database()`;
    const elapsed = Date.now() - startTime;
    const dbName = result[0]?.current_database || "unknown";

    console.log(`✅ Prisma successfully connected to PostgreSQL in ${elapsed}ms!`);
    console.log(`Database Name : "${dbName}"`);
    console.log(`Schema Name   : "public"`);

    const userCount = await prisma.user.count();
    console.log(`✅ Table verification successful. Total users in DB: ${userCount}`);
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Database connection audit failed:", error);
    console.log("--------------------------------------------------");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
