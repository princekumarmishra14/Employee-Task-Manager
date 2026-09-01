const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const u = await prisma.user.findUnique({
    where: { email: 'princemishra14@gmail.com' },
    include: { employee: true }
  });
  console.log("Found:", u ? u.email : 'No');
}
run();
