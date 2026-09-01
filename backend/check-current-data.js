const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const [employees, tasks, departments, teams, projects, activities] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.task.count({ where: { isActive: true } }),
    prisma.department.count({ where: { isActive: true } }),
    prisma.team.count({ where: { isActive: true } }),
    prisma.project.count({ where: { isActive: true } }),
    prisma.activity.count(),
  ]);
  console.log({ employees, tasks, departments, teams, projects, activities });
}
run().finally(() => prisma.$disconnect());
