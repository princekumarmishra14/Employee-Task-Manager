const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dept = await prisma.department.findUnique({
    where: { id: '06f5095d-3d04-4cac-82be-444d36cbff81' }
  });
  console.log("Department:", dept);
}

main().catch(console.error).finally(() => prisma.$disconnect());
