/**
 * src/server/verifyUser.ts
 * CLI tool to verify if a user exists inside PostgreSQL database.
 * Usage: npx ts-node --project tsconfig.seed.json src/server/verifyUser.ts <email>
 */

import prisma from "./lib/prisma";

async function verifyUser(email: string) {
  if (!email) {
    console.log("❌ Error: Please provide an email address.");
    console.log("Usage: npx ts-node --project tsconfig.seed.json src/server/verifyUser.ts <email>");
    process.exit(1);
  }

  try {
    console.log(`Querying PostgreSQL for user: "${email}"...`);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { employee: true, role: true },
    });

    if (user) {
      console.log("--------------------------------------------------");
      console.log("✅ USER RECORD FOUND IN POSTGRESQL");
      console.log("--------------------------------------------------");
      console.log(`User ID      : ${user.id}`);
      console.log(`Email        : ${user.email}`);
      console.log(`Role         : ${user.role?.name || user.roleId}`);
      console.log(`Name         : ${user.employee?.fullName || "N/A"}`);
      console.log(`Code         : ${user.employee?.employeeCode || "N/A"}`);
      console.log(`Designation  : ${user.employee?.title || "N/A"}`);
      console.log(`Account State: ${user.isActive ? "ACTIVE" : "INACTIVE"}`);
      console.log(`Last Login   : ${user.lastLoginAt ? user.lastLoginAt.toLocaleString() : "Never"}`);
      console.log("--------------------------------------------------");
    } else {
      console.log(`❌ No user found with email "${email}" in PostgreSQL.`);
    }
  } catch (error) {
    console.error("❌ Verification query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

const targetEmail = process.argv[2] || "";
verifyUser(targetEmail);
