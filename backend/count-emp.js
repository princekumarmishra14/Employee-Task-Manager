const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const c = await prisma.user.count({ where: { deletedAt: null } });
  console.log("Total users:", c);
}
run();
