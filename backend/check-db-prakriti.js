const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { 
      employee: { fullName: { contains: "Prakriti" } }
    },
    include: { employee: true }
  });
  console.log("Users with Prakriti:", users.map(u => ({ id: u.id, email: u.email, fullName: u.employee.fullName })));
}
main().finally(() => prisma.$disconnect());
