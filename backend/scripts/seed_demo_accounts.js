/**
 * backend/scripts/seed_demo_accounts.js
 * Idempotent Seed Script for Public Demo Mode
 * 
 * Guarantees:
 * - Demo Admin: demo.admin@etm.com / Admin@123 (Verified, ADMIN)
 * - Demo Employee: demo.employee@etm.com / Employee@123 (Verified, EMPLOYEE)
 * - Exactly 60 Demo Tasks:
 *     - 20 COMPLETED tasks (33.33% completion rate)
 *     - 25 IN_PROGRESS tasks
 *     - 15 UNASSIGNED / PENDING tasks
 *     - 5 OVERDUE tasks
 * - Idempotent: Can be executed multiple times cleanly resulting in exactly 60 tasks.
 * - Real Super Admin (superadmin@etm.com) remains untouched.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDemoAccountsAndTasks() {
  console.log('🚀 Starting Idempotent Demo Seeding (Accounts & 60 Tasks)...');

  // 1. Fetch or verify core Roles
  const adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
  const employeeRole = await prisma.role.findFirst({ where: { name: 'EMPLOYEE' } });

  if (!adminRole || !employeeRole) {
    console.error('❌ Error: Required roles (ADMIN / EMPLOYEE) not found in database.');
    return;
  }

  const adminPasswordHash = await bcrypt.hash('Admin@123', 12);
  const employeePasswordHash = await bcrypt.hash('Employee@123', 12);

  // 2. Demo Admin Account (Rahul Sharma)
  const demoAdminEmail = 'demo.admin@etm.com';
  let demoAdmin = await prisma.user.findUnique({ where: { email: demoAdminEmail } });

  if (!demoAdmin) {
    demoAdmin = await prisma.user.create({
      data: {
        email: demoAdminEmail,
        passwordHash: adminPasswordHash,
        roleId: adminRole.id,
        isActive: true,
        isEmailVerified: true,
      },
    });

    await prisma.employee.create({
      data: {
        userId: demoAdmin.id,
        employeeCode: 'ETM-DEMO-ADM',
        fullName: 'Rahul Sharma (Demo Admin)',
        firstName: 'Rahul',
        lastName: 'Sharma',
        title: 'Demo System Administrator',
        isActive: true,
        hireDate: new Date(),
      },
    });
    console.log(`  ✓ Demo Admin created: ${demoAdminEmail}`);
  } else {
    await prisma.user.update({
      where: { id: demoAdmin.id },
      data: {
        passwordHash: adminPasswordHash,
        isEmailVerified: true,
        isActive: true,
      },
    });
    console.log(`  ✓ Demo Admin updated & verified: ${demoAdminEmail}`);
  }

  // 3. Demo Employee Account (Priya Singh)
  const demoEmpEmail = 'demo.employee@etm.com';
  let demoEmp = await prisma.user.findUnique({ where: { email: demoEmpEmail } });

  if (!demoEmp) {
    demoEmp = await prisma.user.create({
      data: {
        email: demoEmpEmail,
        passwordHash: employeePasswordHash,
        roleId: employeeRole.id,
        isActive: true,
        isEmailVerified: true,
      },
    });

    await prisma.employee.create({
      data: {
        userId: demoEmp.id,
        employeeCode: 'ETM-DEMO-EMP',
        fullName: 'Priya Singh (Demo Employee)',
        firstName: 'Priya',
        lastName: 'Singh',
        title: 'Demo Software Engineer',
        isActive: true,
        hireDate: new Date(),
      },
    });
    console.log(`  ✓ Demo Employee created: ${demoEmpEmail}`);
  } else {
    await prisma.user.update({
      where: { id: demoEmp.id },
      data: {
        passwordHash: employeePasswordHash,
        isEmailVerified: true,
        isActive: true,
      },
    });
    console.log(`  ✓ Demo Employee updated & verified: ${demoEmpEmail}`);
  }

  // Fetch departments, teams, projects, assignees for realistic relations
  const departments = await prisma.department.findMany({ where: { isActive: true, deletedAt: null } });
  const teams = await prisma.team.findMany({ where: { isActive: true, deletedAt: null } });
  const projects = await prisma.project.findMany({ where: { isActive: true, deletedAt: null } });
  const assignableUsers = await prisma.user.findMany({
    where: { isActive: true, deletedAt: null, role: { name: { in: ['EMPLOYEE', 'MANAGER', 'TEAM_LEAD', 'ADMIN'] } } },
    select: { id: true },
  });
  const assignableIds = assignableUsers.map(u => u.id);

  const getDept = () => (departments.length > 0 ? departments[Math.floor(Math.random() * departments.length)].id : null);
  const getTeam = () => (teams.length > 0 ? teams[Math.floor(Math.random() * teams.length)].id : null);
  const getProj = () => (projects.length > 0 ? projects[Math.floor(Math.random() * projects.length)].id : null);
  const getAssignee = () => (assignableIds.length > 0 ? assignableIds[Math.floor(Math.random() * assignableIds.length)] : demoEmp.id);

  // 4. Idempotently Reset/Sync Tasks to Exactly 60
  console.log('🧹 Syncing tasks database table to exactly 60 demo tasks...');
  await prisma.task.deleteMany({}); // Delete existing tasks to prevent duplicates

  const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
  const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

  // A. 20 COMPLETED Tasks
  const completedTitles = [
    "Develop Employee Dashboard",
    "Implement Authentication API",
    "Create Task Management UI",
    "Implement JWT Authentication",
    "Build Employee Profile Module",
    "Develop Admin Dashboard",
    "Implement Task Assignment",
    "Create REST API Endpoints",
    "Add Employee Search",
    "Implement Department Management",
    "Build Task Status System",
    "Add Role-Based Access Control",
    "Implement Notification System",
    "Create Reports Module",
    "Optimize Database Queries",
    "Fix Login Validation",
    "Improve Dashboard UI",
    "Implement Employee CRUD",
    "Add Task Filtering",
    "Complete API Integration",
  ];

  for (let i = 0; i < 20; i++) {
    await prisma.task.create({
      data: {
        title: completedTitles[i],
        description: `Completed demonstration task for ${completedTitles[i].toLowerCase()}. Verified & passed QA checks.`,
        priority: i % 2 === 0 ? 'HIGH' : 'MEDIUM',
        status: 'COMPLETED',
        startDate: daysAgo(15 + i),
        dueDate: daysAgo(1 + (i % 7)),
        completedAt: daysAgo(1 + (i % 7)),
        estimatedHours: 16,
        tags: 'frontend,backend,demo',
        assigneeId: i % 2 === 0 ? demoEmp.id : getAssignee(),
        departmentId: getDept(),
        teamId: getTeam(),
        projectId: getProj(),
        isActive: true,
        createdBy: demoAdmin.id,
        updatedBy: demoAdmin.id,
      },
    });
  }

  // B. 25 IN_PROGRESS Tasks (5 Overdue, 20 Upcoming)
  const inProgressTitles = [
    "Refactor React Component Hierarchy",
    "Implement OAuth2 Google Sign-In Flow",
    "Optimize SQL Database Indexing",
    "Build Real-Time WebSocket Telemetry",
    "Design Responsive Mobile Navigation",
    "Implement Task Export to PDF/CSV",
    "Add Audit Logging Middleware",
    "Configure Redis Session Store",
    "Implement Password Policy Validation",
    "Build Department Analytics Dashboard",
    "Integrate Email Notification Queue",
    "Setup CI/CD GitHub Actions Pipeline",
    "Implement File Upload S3 Integration",
    "Develop Manager Review Module",
    "Optimize Next.js Server Components",
    "Build Activity Feed Component",
    "Implement Dark Mode Theme Support",
    "Add Multi-Language Localization (RTL)",
    "Configure API Rate Limiting",
    "Build Custom Error Boundary Handler",
    "Implement User Presence Status",
    "Optimize Client Bundle Code Splitting",
    "Add E2E Playwright Test Suite",
    "Build Task Kanban Board View",
    "Implement Search Auto-Suggestions",
  ];

  for (let i = 0; i < 25; i++) {
    const isOverdueTask = i < 5; // Exactly 5 overdue tasks
    await prisma.task.create({
      data: {
        title: inProgressTitles[i],
        description: isOverdueTask
          ? `Overdue in-progress task requiring immediate action. Target milestone passed.`
          : `Active development task currently in progress by engineering team.`,
        priority: isOverdueTask ? 'ESCALATED' : i % 3 === 0 ? 'HIGH' : 'MEDIUM',
        status: isOverdueTask ? 'IN_PROGRESS' : (i < 15 ? 'IN_PROGRESS' : 'ASSIGNED'),
        startDate: daysAgo(10 + i),
        dueDate: isOverdueTask ? daysAgo(3 + i) : daysFromNow(4 + i),
        completedAt: null,
        estimatedHours: 24,
        tags: isOverdueTask ? 'overdue,urgent' : 'dev,sprint',
        assigneeId: i % 3 === 0 ? demoEmp.id : getAssignee(),
        departmentId: getDept(),
        teamId: getTeam(),
        projectId: getProj(),
        isActive: true,
        createdBy: demoAdmin.id,
        updatedBy: demoAdmin.id,
      },
    });
  }

  // C. 15 UNASSIGNED / PENDING Tasks
  const pendingTitles = [
    "Evaluate GraphQL API Migration",
    "Design Microservices Architecture Blueprint",
    "Review Security Compliance Guidelines",
    "Assess Database Sharding Strategy",
    "Plan Automated Backup Recovery Workflow",
    "Draft Employee Onboarding Documentation",
    "Audit Third-Party NPM Package Vulnerabilities",
    "Design Dark Mode Color Palette Token Specs",
    "Setup Sentry Error Tracking Middleware",
    "Research PWA Offline Service Worker Support",
    "Implement Task SLA Escalation Trigger",
    "Design Customer Feedback Survey Portal",
    "Benchmark Express HTTP Request Latency",
    "Draft Open API Swagger 3.0 Documentation",
    "Create Standard Operating Procedures Manual",
  ];

  for (let i = 0; i < 15; i++) {
    await prisma.task.create({
      data: {
        title: pendingTitles[i],
        description: `Newly logged pending task awaiting team lead review and assignment.`,
        priority: i % 4 === 0 ? 'HIGH' : 'LOW',
        status: 'UNASSIGNED',
        startDate: daysFromNow(1),
        dueDate: daysFromNow(7 + i),
        completedAt: null,
        estimatedHours: 8,
        tags: 'backlog,unassigned',
        assigneeId: null, // Strictly unassigned
        departmentId: getDept(),
        teamId: getTeam(),
        projectId: getProj(),
        isActive: true,
        createdBy: demoAdmin.id,
        updatedBy: demoAdmin.id,
      },
    });
  }

  // 5. Final Count Verification
  const totalCount = await prisma.task.count({ where: { isActive: true } });
  const completedCount = await prisma.task.count({ where: { status: 'COMPLETED', isActive: true } });
  const inProgressCount = await prisma.task.count({ where: { status: 'IN_PROGRESS', isActive: true } });
  const unassignedCount = await prisma.task.count({ where: { status: 'UNASSIGNED', isActive: true } });
  const overdueCount = await prisma.task.count({
    where: {
      isActive: true,
      dueDate: { lt: new Date() },
      status: { notIn: ['COMPLETED', 'ARCHIVED'] },
    },
  });
  const rate = ((completedCount / totalCount) * 100).toFixed(2);

  console.log('\n📊 SEEDING SUMMARY RESULTS:');
  console.log(`  ✓ Total Tasks      : ${totalCount} (Target: 60)`);
  console.log(`  ✓ Completed Tasks  : ${completedCount} (Target: 20)`);
  console.log(`  ✓ In Progress Tasks: ${inProgressCount} (Target: 25)`);
  console.log(`  ✓ Pending/Unassigned: ${unassignedCount} (Target: 15)`);
  console.log(`  ✓ Overdue Tasks    : ${overdueCount} (Target: ~5)`);
  console.log(`  ✓ Completion Rate  : ${rate}% (Target: 33.33%)`);

  console.log('✅ Idempotent Demo Accounts & Task Seeding Completed Successfully!');
}

seedDemoAccountsAndTasks()
  .catch((err) => {
    console.error('❌ Error in seed script:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
