const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.update({
    where: { email: 'superadmin@etm.com' },
    data: {
      isActive: true,
      deletedAt: null
    }
  });
  console.log("Updated User:", updated);
}

main().catch(console.error).finally(() => prisma.$disconnect());
