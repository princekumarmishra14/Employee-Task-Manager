const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { employee: true }
  });
  console.log(users.map(u => u.employee ? u.employee.fullName : u.email));
}
run();
