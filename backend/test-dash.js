const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const [tasks, recent, activities] = await Promise.all([
    prisma.task.groupBy({ by: ['status'], _count: true, where: { isActive: true } }),
    prisma.task.findMany({ orderBy: { createdAt: 'desc' }, take: 3, select: { title: true, status: true, priority: true } }),
    prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 3, select: { actorName: true, title: true, type: true } }),
  ]);
  console.log('Status Distribution:'); tasks.forEach(t => console.log(' ', t.status, ':', t._count));
  console.log('\nRecent Tasks:'); recent.forEach(t => console.log(' ', t.title.substring(0, 40), `[${t.status}]`));
  console.log('\nRecent Activities:'); activities.forEach(a => console.log(' ', a.actorName, '-', a.title.substring(0, 50)));
}
run().finally(() => prisma.$disconnect());
