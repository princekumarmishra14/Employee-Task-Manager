const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  console.log("Before:", user.email);

  // Attempt to update
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        email: "test.changed@example.com"
      }
    }),
    prisma.employee.update({
      where: { userId: user.id },
      data: {
        fullName: "Changed Name"
      }
    })
  ]);

  const updatedUser = await prisma.user.findUnique({ where: { id: user.id }, include: { employee: true } });
  console.log("After:", updatedUser.email, updatedUser.employee.fullName);

  // Revert back
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { email: user.email }
    }),
    prisma.employee.update({
      where: { userId: user.id },
      data: { fullName: "Super Administrator" }
    })
  ]);
}
main().finally(() => prisma.$disconnect());
