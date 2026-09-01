const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const user = await prisma.user.findFirst({
    where: { email: { startsWith: 'test' } },
    include: { employee: true }
  });
  console.log(user);
}
run();
