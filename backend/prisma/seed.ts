/**
 * prisma/seed.ts
 * Enterprise Seed Data — Employee Task Manager
 *
 * Seeds:
 *   5  Departments
 *   10 Teams (2 per dept)
 *   20 Projects (4 per dept)
 *   50 Users + Employee profiles
 *   100 Tasks
 *   50 Audit Logs
 *   50 Activities
 *   ~200 Comments
 *   Notifications
 */

import { PrismaClient, TaskStatus, TaskPriority, AuditAction, AuditEntity, ActivityType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: [
    "dashboard:view",
    "employees:view", "employees:create", "employees:update", "employees:delete",
    "departments:view", "departments:create", "departments:update",
    "teams:view", "teams:create", "teams:update",
    "projects:view", "projects:create", "projects:update",
    "tasks:view", "tasks:create", "tasks:update", "tasks:delete", "tasks:assign",
    "reports:view",
    "audit_logs:view",
    "settings:view", "settings:update",
    "roles:view", "roles:manage",
    "security:manage"
  ],
  ADMIN: [
    "dashboard:view",
    "employees:view", "employees:create", "employees:update", "employees:delete",
    "departments:view", "departments:create", "departments:update",
    "teams:view", "teams:create", "teams:update",
    "projects:view", "projects:create", "projects:update",
    "tasks:view", "tasks:create", "tasks:update", "tasks:delete", "tasks:assign",
    "reports:view",
    "roles:view"
  ],
  MANAGER: [
    "dashboard:view",
    "employees:view", "employees:create", "employees:update",
    "teams:view",
    "projects:view",
    "tasks:view", "tasks:create", "tasks:update", "tasks:delete", "tasks:assign",
    "reports:view"
  ],
  TEAM_LEAD: [
    "dashboard:view",
    "teams:view",
    "tasks:view", "tasks:update", "tasks:assign",
    "reports:view"
  ],
  EMPLOYEE: [
    "dashboard:view",
    "tasks:view", "tasks:update"
  ],
  VIEWER: [
    "dashboard:view",
    "employees:view",
    "tasks:view",
    "projects:view",
    "reports:view"
  ],
};

const DEPARTMENTS = [
  { name: "Engineering", description: "Product development, infrastructure, and platform teams" },
  { name: "Human Resources", description: "Talent acquisition, people operations, and culture" },
  { name: "Operations", description: "Business operations, logistics, and process management" },
  { name: "Finance", description: "Financial planning, accounting, and compliance" },
  { name: "Marketing", description: "Brand, growth, digital marketing, and communications" },
];

const TEAMS_BY_DEPT: Record<string, { name: string; description: string }[]> = {
  "Engineering": [
    { name: "Backend Team", description: "API development, database architecture, and microservices" },
    { name: "Frontend Team", description: "UI/UX implementation, design systems, and web performance" },
  ],
  "Human Resources": [
    { name: "Talent Acquisition", description: "Recruiting, hiring, and onboarding" },
    { name: "People Operations", description: "Employee experience, benefits, and culture programs" },
  ],
  "Operations": [
    { name: "Business Operations", description: "Process optimization and cross-functional coordination" },
    { name: "Logistics Team", description: "Supply chain, vendor management, and procurement" },
  ],
  "Finance": [
    { name: "Financial Planning", description: "Budgeting, forecasting, and investor reporting" },
    { name: "Accounting", description: "General ledger, payroll, and compliance" },
  ],
  "Marketing": [
    { name: "Growth Team", description: "User acquisition, SEO, and performance marketing" },
    { name: "Brand & Comms", description: "Brand identity, PR, and content strategy" },
  ],
};

const PROJECTS_BY_DEPT: Record<string, string[]> = {
  "Engineering": [
    "Platform API v3 Redesign",
    "Mobile Application Launch",
    "Infrastructure Migration to K8s",
    "Security Audit & Hardening",
  ],
  "Human Resources": [
    "Annual Performance Review Cycle",
    "Employee Onboarding Portal",
    "Compensation Benchmarking",
    "Culture & Engagement Survey",
  ],
  "Operations": [
    "ERP System Implementation",
    "Process Automation Initiative",
    "Vendor Contract Renegotiation",
    "Office Expansion Project",
  ],
  "Finance": [
    "Q3 Financial Reporting",
    "Tax Compliance Overhaul",
    "Budget Forecasting Tool",
    "Audit Preparation 2026",
  ],
  "Marketing": [
    "Brand Refresh Campaign",
    "SEO & Content Strategy",
    "Product Launch Marketing",
    "Annual Marketing Summit",
  ],
};

interface EmployeeData {
  firstName: string;
  lastName: string;
  title: string;
  role: string;
  phone: string;
}

const EMPLOYEES: EmployeeData[] = [
  // SUPER_ADMIN (1)
  { firstName: "Amira", lastName: "Al-Harbi", title: "Chief Executive Officer", role: "SUPER_ADMIN", phone: "+1-555-0001" },
  // ADMIN (3)
  { firstName: "Marcus", lastName: "Sterling", title: "Chief Technology Officer", role: "ADMIN", phone: "+1-555-0002" },
  { firstName: "Diana", lastName: "Okafor", title: "Chief People Officer", role: "ADMIN", phone: "+1-555-0003" },
  { firstName: "James", lastName: "Whitfield", title: "Chief Financial Officer", role: "ADMIN", phone: "+1-555-0004" },
  // MANAGER (8)
  { firstName: "Sofia", lastName: "Reyes", title: "VP of Engineering", role: "MANAGER", phone: "+1-555-0005" },
  { firstName: "Nathan", lastName: "Brooks", title: "Head of HR Operations", role: "MANAGER", phone: "+1-555-0006" },
  { firstName: "Priya", lastName: "Sharma", title: "Director of Operations", role: "MANAGER", phone: "+1-555-0007" },
  { firstName: "Carlos", lastName: "Mendez", title: "Finance Director", role: "MANAGER", phone: "+1-555-0008" },
  { firstName: "Yuki", lastName: "Tanaka", title: "Marketing Director", role: "MANAGER", phone: "+1-555-0009" },
  { firstName: "Alexander", lastName: "Petrov", title: "Engineering Manager", role: "MANAGER", phone: "+1-555-0010" },
  { firstName: "Fatima", lastName: "Hassan", title: "Operations Manager", role: "MANAGER", phone: "+1-555-0011" },
  { firstName: "Liam", lastName: "O'Brien", title: "Product Manager", role: "MANAGER", phone: "+1-555-0012" },
  // EMPLOYEE (35)
  { firstName: "Sarah", lastName: "Jenkins", title: "Senior Backend Engineer", role: "EMPLOYEE", phone: "+1-555-0013" },
  { firstName: "Kevin", lastName: "Park", title: "Frontend Engineer", role: "EMPLOYEE", phone: "+1-555-0014" },
  { firstName: "Aisha", lastName: "Mohammed", title: "Full-Stack Engineer", role: "EMPLOYEE", phone: "+1-555-0015" },
  { firstName: "Tom", lastName: "Fischer", title: "DevOps Engineer", role: "EMPLOYEE", phone: "+1-555-0016" },
  { firstName: "Elena", lastName: "Kozlov", title: "Database Administrator", role: "EMPLOYEE", phone: "+1-555-0017" },
  { firstName: "Michael", lastName: "Torres", title: "Security Engineer", role: "EMPLOYEE", phone: "+1-555-0018" },
  { firstName: "Grace", lastName: "Liu", title: "QA Engineer", role: "EMPLOYEE", phone: "+1-555-0019" },
  { firstName: "Omar", lastName: "Abdullah", title: "Mobile Engineer", role: "EMPLOYEE", phone: "+1-555-0020" },
  { firstName: "Rebecca", lastName: "Walsh", title: "HR Business Partner", role: "EMPLOYEE", phone: "+1-555-0021" },
  { firstName: "Daniel", lastName: "Kim", title: "Talent Acquisition Specialist", role: "EMPLOYEE", phone: "+1-555-0022" },
  { firstName: "Nadia", lastName: "Patel", title: "HR Coordinator", role: "EMPLOYEE", phone: "+1-555-0023" },
  { firstName: "Chris", lastName: "Anderson", title: "Recruiter", role: "EMPLOYEE", phone: "+1-555-0024" },
  { firstName: "Mei", lastName: "Zhang", title: "Learning & Development Specialist", role: "EMPLOYEE", phone: "+1-555-0025" },
  { firstName: "Paul", lastName: "Evans", title: "Operations Analyst", role: "EMPLOYEE", phone: "+1-555-0026" },
  { firstName: "Samantha", lastName: "Clark", title: "Business Analyst", role: "EMPLOYEE", phone: "+1-555-0027" },
  { firstName: "Ahmed", lastName: "Al-Rashid", title: "Supply Chain Analyst", role: "EMPLOYEE", phone: "+1-555-0028" },
  { firstName: "Jessica", lastName: "Brown", title: "Project Coordinator", role: "EMPLOYEE", phone: "+1-555-0029" },
  { firstName: "David", lastName: "Wilson", title: "Operations Specialist", role: "EMPLOYEE", phone: "+1-555-0030" },
  { firstName: "Isabelle", lastName: "Martin", title: "Financial Analyst", role: "EMPLOYEE", phone: "+1-555-0031" },
  { firstName: "Ryan", lastName: "Mitchell", title: "Accountant", role: "EMPLOYEE", phone: "+1-555-0032" },
  { firstName: "Chloe", lastName: "Bennett", title: "Senior Accountant", role: "EMPLOYEE", phone: "+1-555-0033" },
  { firstName: "Ethan", lastName: "Cooper", title: "Tax Specialist", role: "EMPLOYEE", phone: "+1-555-0034" },
  { firstName: "Natalie", lastName: "Foster", title: "Financial Controller", role: "EMPLOYEE", phone: "+1-555-0035" },
  { firstName: "Raj", lastName: "Gupta", title: "Content Marketing Manager", role: "EMPLOYEE", phone: "+1-555-0036" },
  { firstName: "Hannah", lastName: "Scott", title: "SEO Specialist", role: "EMPLOYEE", phone: "+1-555-0037" },
  { firstName: "Tyler", lastName: "Reed", title: "Growth Hacker", role: "EMPLOYEE", phone: "+1-555-0038" },
  { firstName: "Laila", lastName: "Nasser", title: "Brand Designer", role: "EMPLOYEE", phone: "+1-555-0039" },
  { firstName: "Connor", lastName: "Murphy", title: "Social Media Manager", role: "EMPLOYEE", phone: "+1-555-0040" },
  { firstName: "Zoe", lastName: "Hughes", title: "Marketing Analyst", role: "EMPLOYEE", phone: "+1-555-0041" },
  { firstName: "Victor", lastName: "Larsson", title: "Backend Engineer", role: "EMPLOYEE", phone: "+1-555-0042" },
  { firstName: "Mia", lastName: "Johansson", title: "UI/UX Designer", role: "EMPLOYEE", phone: "+1-555-0043" },
  { firstName: "Jake", lastName: "Thompson", title: "Data Engineer", role: "EMPLOYEE", phone: "+1-555-0044" },
  { firstName: "Lily", lastName: "Watson", title: "Platform Engineer", role: "EMPLOYEE", phone: "+1-555-0045" },
  { firstName: "Aaron", lastName: "Price", title: "Cloud Architect", role: "EMPLOYEE", phone: "+1-555-0046" },
  { firstName: "Sandra", lastName: "Coleman", title: "Compliance Officer", role: "EMPLOYEE", phone: "+1-555-0047" },
  // VIEWER (3)
  { firstName: "Robert", lastName: "Hayes", title: "Board Advisor", role: "VIEWER", phone: "+1-555-0048" },
  { firstName: "Patricia", lastName: "Morgan", title: "External Auditor", role: "VIEWER", phone: "+1-555-0049" },
  { firstName: "Leonard", lastName: "Grant", title: "Strategic Consultant", role: "VIEWER", phone: "+1-555-0050" },
];

const TASK_TITLES = [
  "Implement OAuth 2.0 authentication flow for enterprise SSO integration",
  "Refactor legacy database schema to support horizontal sharding",
  "Design and build responsive dashboard for executive reporting suite",
  "Conduct security penetration testing on all public-facing API endpoints",
  "Migrate CI/CD pipeline from Jenkins to GitHub Actions",
  "Build automated employee onboarding workflow with e-signature integration",
  "Create performance benchmarking framework for backend services",
  "Implement real-time notification system using WebSockets",
  "Design multi-tenant architecture for enterprise customer isolation",
  "Develop comprehensive API documentation with OpenAPI 3.0 specification",
  "Optimize PostgreSQL query performance for employee search functionality",
  "Build CSV and Excel export functionality for all report modules",
  "Implement role-based access control middleware for all API routes",
  "Create automated salary benchmarking integration with market data APIs",
  "Design and implement audit logging system for compliance requirements",
  "Build task assignment notification system with email and in-app alerts",
  "Develop employee performance metrics dashboard with trend analysis",
  "Implement Redis caching layer for frequently accessed employee data",
  "Create automated payroll calculation engine with tax compliance",
  "Build integration between HR system and accounting platform",
  "Develop mobile-responsive employee self-service portal",
  "Implement data retention and GDPR compliance automation",
  "Create department budget tracking and forecasting tool",
  "Build vendor onboarding workflow with document verification",
  "Design disaster recovery plan and implement automated failover",
  "Implement multi-language support for global workforce operations",
  "Create customizable reporting templates for department managers",
  "Build employee skill matrix and competency tracking system",
  "Develop project resource allocation optimization algorithm",
  "Implement two-factor authentication across all user accounts",
  "Create automated compliance report generation for regulatory submissions",
  "Build candidate tracking system with pipeline stage management",
  "Design employee recognition and rewards program platform",
  "Implement SSO integration with Active Directory for enterprise clients",
  "Create financial dashboard with real-time P&L monitoring",
  "Build automated contract management and renewal notification system",
  "Develop team productivity analytics with individual and group metrics",
  "Implement data backup and recovery testing automation",
  "Create employee benefits management portal with enrollment workflows",
  "Build marketing campaign performance tracking dashboard",
  "Optimize search algorithm for employee directory with fuzzy matching",
  "Implement webhook system for third-party integrations",
  "Create automated expense report processing with OCR",
  "Design scalable microservices architecture for platform growth",
  "Build real-time inventory tracking system for office resources",
  "Implement customer feedback collection and analysis pipeline",
  "Create automated testing suite with 90% code coverage target",
  "Develop predictive analytics model for employee attrition risk",
  "Build comprehensive knowledge base and documentation portal",
  "Design and implement API rate limiting and throttling system",
  "Create automated bank reconciliation module for finance team",
  "Build employee learning management system with progress tracking",
  "Implement geolocation-based attendance tracking for remote teams",
  "Design data lake architecture for historical analytics storage",
  "Create automated invoice processing and accounts payable workflow",
  "Build social media monitoring dashboard for brand management",
  "Implement machine learning model for task priority prediction",
  "Create customer success playbook automation platform",
  "Design and build internal ticketing system for IT support",
  "Develop carbon footprint tracking dashboard for ESG reporting",
  "Implement advanced search with Elasticsearch integration",
  "Create employee engagement survey platform with analytics",
  "Build automated legal contract review workflow",
  "Design recruitment funnel analytics and conversion optimization",
  "Implement data anonymization pipeline for privacy compliance",
  "Create board reporting dashboard with KPI visualization",
  "Build API gateway with intelligent load balancing",
  "Develop organizational chart visualization tool with export",
  "Implement customer portal integration with employee task system",
  "Create automated risk assessment and compliance scoring engine",
  "Build team communication analytics and sentiment analysis tool",
  "Design enterprise SSO with SAML 2.0 protocol support",
  "Implement continuous compliance monitoring for SOC 2 Type II",
  "Create financial consolidation module for multi-entity reporting",
  "Build demand forecasting model for workforce planning",
  "Develop public API documentation portal with interactive sandbox",
  "Implement automated job description generator with AI assistance",
  "Create visual workflow builder for business process automation",
  "Build incident response management system for security events",
  "Design employee mental health and wellness tracking platform",
  "Implement advanced RBAC with row-level security in PostgreSQL",
  "Create end-to-end encrypted messaging system for HR communications",
  "Build strategic roadmap visualization and milestone tracking tool",
  "Develop API versioning strategy and deprecation management system",
  "Implement cross-functional project portfolio management dashboard",
  "Create automated email campaign management platform",
  "Build supplier performance scorecard and evaluation system",
  "Design employee referral program management platform",
  "Implement blockchain-based credential verification system",
  "Create predictive maintenance scheduling system for office equipment",
  "Build real-time financial exchange rate integration module",
  "Develop employee productivity tracking with privacy controls",
  "Implement disaster recovery testing automation framework",
  "Create AI-powered job matching engine for internal mobility",
  "Build executive compensation benchmarking and analysis tool",
  "Design multi-cloud deployment strategy for global expansion",
  "Implement automated quality assurance testing for payroll module",
  "Create interactive organizational health scorecard",
  "Build customer success metrics dashboard with churn prediction",
];

const TASK_DESCRIPTIONS = [
  "This task involves a comprehensive technical implementation requiring cross-functional collaboration between engineering, security, and product teams. The objective is to deliver a production-ready solution that meets enterprise-grade standards for scalability, security, and maintainability. Success criteria include full documentation, unit test coverage above 80%, and a staged rollout plan with rollback procedures.",
  "A critical infrastructure initiative that directly impacts the organization's ability to scale operations across multiple business units. This work requires careful coordination with stakeholders, thorough risk assessment, and adherence to our architectural standards. The deliverables include technical specifications, implementation code, testing documentation, and a post-deployment monitoring plan.",
  "This project represents a strategic investment in operational efficiency and employee experience. The scope encompasses requirement gathering, technical design, development sprints, user acceptance testing, and training material creation. All work must comply with our security policies, data governance standards, and accessibility requirements for global accessibility.",
  "An important operational improvement initiative that will reduce manual effort and improve data accuracy across multiple teams. The implementation must follow our established engineering standards, include comprehensive error handling, and provide clear audit trails for compliance purposes. Documentation and knowledge transfer are mandatory deliverables.",
  "This task is part of a larger organizational initiative to modernize our technology stack and improve developer experience. The work involves research, proof-of-concept development, stakeholder alignment, full implementation, and comprehensive testing. All changes must be backward compatible and include a migration guide for existing users of the affected systems.",
];

const COMMENT_TEXTS = [
  "Reviewed the initial implementation — looks solid. Left some inline comments for minor refactoring suggestions.",
  "Blocker identified: the third-party API has a rate limit of 100 req/min. Need to implement a queue-based approach.",
  "UAT completed. All test cases passed. Requesting sign-off from the stakeholders before deploying to production.",
  "Updated the PR with the requested changes. Also added unit tests for the edge cases we discussed in the standup.",
  "Performance testing shows p95 latency at 120ms — within our SLA. Recommending we proceed to production release.",
  "Documentation has been updated in Confluence. The runbook includes rollback steps and alerting thresholds.",
  "Found a minor issue in the error handling path. Will fix and push the update before end of day.",
  "Sync'd with the design team — the wireframes are approved. Ready to begin frontend implementation.",
  "The database migration script has been tested against staging. No data loss observed. Ready for production.",
  "Added monitoring dashboards in Grafana. Alert thresholds set per the on-call runbook. Paging tested.",
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting enterprise seed...\n");

  // -1. ROLES & PERMISSIONS
  console.log("🛡️ Seeding Roles and Permissions...");
  const roleIds: Record<string, string> = {};

  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    // Upsert role
    const r = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, isSystem: true, description: `System generated role: ${roleName}` },
    });
    roleIds[roleName] = r.id;

    // Upsert permissions and link
    for (const perm of permissions) {
      const [module, action] = perm.split(":");
      const p = await prisma.permission.upsert({
        where: { module_action: { module, action } },
        update: {},
        create: { module, action, description: `Can ${action} ${module}` },
      });

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: r.id, permissionId: p.id } },
        update: {},
        create: { roleId: r.id, permissionId: p.id },
      });
    }
  }

  // 0. ETM SYSTEM ADMINS
  console.log("🛡️ Seeding ETM System Admins...");
  
  const superAdminEmail = "superadmin@etm.com";
  let superAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });
  if (!superAdmin) {
    const pwdHash = await hashPassword("SuperAdmin@123");
    superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash: pwdHash,
        roleId: roleIds["SUPER_ADMIN"],
        isActive: true,
        isEmailVerified: true,
      },
    });
    await prisma.employee.create({
      data: {
        userId: superAdmin.id,
        employeeCode: "ETM-SA-001",
        fullName: "Super Administrator",
        firstName: "Super",
        lastName: "Administrator",
        title: "Super Administrator",
        isActive: true,
        hireDate: new Date(),
      },
    });
    process.stdout.write(`  ✓ ${superAdminEmail}\n`);
  } else {
    process.stdout.write(`  - ${superAdminEmail} (already exists)\n`);
  }

  const adminEmail = "admin@etm.com";
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const pwdHash = await hashPassword("Admin@123");
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: pwdHash,
        roleId: roleIds["ADMIN"],
        isActive: true,
        isEmailVerified: true,
      },
    });
    await prisma.employee.create({
      data: {
        userId: admin.id,
        employeeCode: "ETM-AD-001",
        fullName: "System Administrator",
        firstName: "System",
        lastName: "Administrator",
        title: "System Administrator",
        isActive: true,
        hireDate: new Date(),
      },
    });
    process.stdout.write(`  ✓ ${adminEmail}\n`);
  } else {
    process.stdout.write(`  - ${adminEmail} (already exists)\n`);
  }


  // 1. DEPARTMENTS
  console.log("📁 Seeding departments...");
  const deptRecords: Record<string, string> = {};
  for (const dept of DEPARTMENTS) {
    const d = await prisma.department.upsert({
      where:  { name: dept.name },
      update: {},
      create: {
        name: dept.name,
        description: dept.description,
        isActive: true,
        createdBy: "seed",
        updatedBy: "seed",
      },
    });
    deptRecords[dept.name] = d.id;
    process.stdout.write(`  ✓ ${dept.name}\n`);
  }

  // 2. TEAMS
  console.log("\n👥 Seeding teams...");
  const teamRecords: Record<string, string> = {};
  for (const [deptName, teams] of Object.entries(TEAMS_BY_DEPT)) {
    const deptId = deptRecords[deptName];
    for (const team of teams) {
      const t = await prisma.team.upsert({
        where:  { name_departmentId: { name: team.name, departmentId: deptId } },
        update: {},
        create: {
          name: team.name,
          departmentId: deptId,
          description: team.description,
          isActive: true,
          createdBy: "seed",
          updatedBy: "seed",
        },
      });
      teamRecords[`${deptName}:${team.name}`] = t.id;
      process.stdout.write(`  ✓ ${deptName} → ${team.name}\n`);
    }
  }

  // 3. PROJECTS
  console.log("\n🗂  Seeding projects...");
  const projectIds: string[] = [];
  for (const [deptName, projects] of Object.entries(PROJECTS_BY_DEPT)) {
    const deptId = deptRecords[deptName];
    for (const projName of projects) {
      // find existing or create new
      const existing = await prisma.project.findFirst({ where: { name: projName, departmentId: deptId } });
      const p = existing ?? await prisma.project.create({
        data: {
          name: projName,
          description: `Enterprise project: ${projName}. Managed by the ${deptName} department.`,
          departmentId: deptId,
          startDate: daysAgo(randInt(30, 120)),
          endDate: daysFromNow(randInt(30, 180)),
          isActive: true,
          createdBy: "seed",
          updatedBy: "seed",
        },
      });
      projectIds.push(p.id);
      process.stdout.write(`  ✓ ${projName}\n`);
    }
  }

  // 4. USERS + EMPLOYEES
  console.log("\n👤 Seeding users & employee profiles...");

  const DEMO_PASSWORDS: Record<string, string> = {
    SUPER_ADMIN: "SuperAdmin@123",
    ADMIN:       "Admin@123",
    MANAGER:     "Manager@123",
    TEAM_LEAD:   "TeamLead@123",
    EMPLOYEE:    "Employee@123",
    VIEWER:      "Viewer@123",
  };

  const deptNames = Object.keys(deptRecords);
  const allTeamKeys = Object.keys(teamRecords);
  const userIds: string[] = [];
  const managerIds: string[] = [];
  const employeeUserIds: string[] = [];

  for (let i = 0; i < EMPLOYEES.length; i++) {
    const emp = EMPLOYEES[i];
    const emailDomain = "enterprise.com";
    const email = `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase().replace(/[^a-z]/g, "")}@${emailDomain}`;
    const empCode = `EMP${String(i + 1).padStart(4, "0")}`;
    const password = DEMO_PASSWORDS[emp.role];
    const passwordHash = await hashPassword(password);

    const deptName = pick(deptNames);
    const deptId = deptRecords[deptName];
    const deptTeamKeys = allTeamKeys.filter((k) => k.startsWith(`${deptName}:`));
    const teamKey = pick(deptTeamKeys);
    const teamId = teamRecords[teamKey];

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        roleId: roleIds[emp.role],
        departmentId: deptId,
        teamId,
        isActive: true,
        createdBy: "seed",
        updatedBy: "seed",
        employee: {
          create: {
            employeeCode: empCode,
            fullName: `${emp.firstName} ${emp.lastName}`,
            firstName: emp.firstName,
            lastName: emp.lastName,
            title: emp.title,
            phone: emp.phone,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${emp.firstName}+${emp.lastName}`)}&background=random&size=128`,
            hireDate: daysAgo(randInt(180, 1460)),
            location: pick(["New York, NY", "San Francisco, CA", "Austin, TX", "Chicago, IL", "London, UK", "Dubai, UAE", "Singapore"]),
            isActive: true,
          },
        },
      },
    });

    userIds.push(user.id);
    if (emp.role === "MANAGER") managerIds.push(user.id);
    if (emp.role === "EMPLOYEE") employeeUserIds.push(user.id);
    process.stdout.write(`  ✓ [${emp.role}] ${emp.firstName} ${emp.lastName} <${email}>\n`);
  }

  const allAssignableIds = [...managerIds, ...employeeUserIds];
  const superAdminId = userIds[0];

  // 5. TASKS (100)
  console.log("\n📋 Seeding tasks...");
  const statuses: TaskStatus[] = ["UNASSIGNED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "OVERDUE", "ARCHIVED"];
  const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "ESCALATED"];
  const statusWeights = [5, 20, 30, 25, 15, 5]; // realistic distribution

  function weightedStatus(): TaskStatus {
    const total = statusWeights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < statuses.length; i++) {
      r -= statusWeights[i];
      if (r <= 0) return statuses[i];
    }
    return "IN_PROGRESS";
  }

  const taskIds: string[] = [];
  for (let i = 0; i < 100; i++) {
    const status = weightedStatus();
    const assigneeId = status === "UNASSIGNED" ? null : pick(allAssignableIds);
    const deptName = pick(deptNames);
    const deptId = deptRecords[deptName];
    const deptTeamKeys = allTeamKeys.filter((k) => k.startsWith(`${deptName}:`));
    const teamId = teamRecords[pick(deptTeamKeys)];
    const projectId = pick(projectIds);
    const daysOffset = status === "OVERDUE" ? randInt(-30, -1) : randInt(1, 90);

    const task = await prisma.task.create({
      data: {
        title: TASK_TITLES[i % TASK_TITLES.length],
        description: pick(TASK_DESCRIPTIONS),
        priority: pick(priorities),
        status,
        dueDate: daysFromNow(daysOffset),
        startDate: daysAgo(randInt(0, 30)),
        completedAt: status === "COMPLETED" ? daysAgo(randInt(1, 14)) : null,
        estimatedHours: pick([null, 8, 16, 24, 40, 80]),
        tags: pick(["backend,api", "frontend,ui", "infra,devops", "security", "analytics,data", "mobile", ""]),
        assigneeId,
        departmentId: deptId,
        teamId,
        projectId,
        isActive: true,
        createdBy: "seed",
        updatedBy: "seed",
      },
    });
    taskIds.push(task.id);
    if ((i + 1) % 10 === 0) process.stdout.write(`  ✓ ${i + 1} tasks seeded\n`);
  }

  // 6. COMMENTS
  console.log("\n💬 Seeding comments...");
  let commentCount = 0;
  for (const taskId of taskIds.slice(0, 60)) {
    const n = randInt(1, 4);
    for (let j = 0; j < n; j++) {
      const authorId = pick(allAssignableIds);
      const userInfo = await prisma.user.findUnique({ where: { id: authorId }, include: { employee: true } });
      await prisma.comment.create({
        data: {
          taskId,
          authorId,
          authorName: userInfo?.employee?.fullName ?? "System",
          content: pick(COMMENT_TEXTS),
        },
      });
      commentCount++;
    }
  }
  console.log(`  ✓ ${commentCount} comments seeded`);

  // 7. AUDIT LOGS (50)
  console.log("\n📜 Seeding audit logs...");
  const auditActions: AuditAction[] = ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE", "ASSIGNMENT_CHANGE", "LOGIN", "ROLE_CHANGE"];
  const auditEntities: AuditEntity[] = ["EMPLOYEE", "TASK", "DEPARTMENT", "PROJECT", "TEAM"];

  const sampleUsers = await prisma.user.findMany({
    take: 10,
    include: { employee: true },
  });

  for (let i = 0; i < 50; i++) {
    const actor = pick(sampleUsers);
    const action = pick(auditActions);
    const entity = pick(auditEntities);
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId: pick([...taskIds, ...userIds]),
        entityName: `Sample ${entity.toLowerCase()} record`,
        details: `${action} operation performed on ${entity.toLowerCase()} by ${actor.employee?.fullName ?? actor.email}`,
        performedBy: actor.employee?.fullName ?? actor.email,
        performedById: actor.id,
        ipAddress: `192.168.${randInt(1, 10)}.${randInt(1, 254)}`,
      },
    });
  }
  console.log("  ✓ 50 audit logs seeded");

  // 8. ACTIVITIES (50)
  console.log("\n⚡ Seeding activity feed...");
  const activityTypes: ActivityType[] = [
    "TASK_CREATED", "TASK_UPDATED", "TASK_STATUS_CHANGED", "TASK_ASSIGNED",
    "TASK_COMPLETED", "EMPLOYEE_JOINED", "PROJECT_CREATED", "COMMENT_ADDED",
  ];

  for (let i = 0; i < 50; i++) {
    const actor = pick(sampleUsers);
    const actType = pick(activityTypes);
    const taskId = actType.startsWith("TASK") ? pick(taskIds) : null;
    await prisma.activity.create({
      data: {
        type: actType,
        title: `${actor.employee?.fullName ?? actor.email} ${actType.toLowerCase().replace(/_/g, " ")}`,
        description: `Activity record for ${actType} event in the system`,
        actorId: actor.id,
        actorName: actor.employee?.fullName ?? actor.email,
        actorAvatar: actor.employee?.avatarUrl ?? null,
        entityId: pick([...taskIds, ...userIds]),
        entityType: actType.startsWith("TASK") ? "task" : "employee",
        entityName: actType.startsWith("TASK") ? "Task" : "Employee",
        taskId,
        metadata: JSON.stringify({ source: "seed", index: i }),
      },
    });
  }
  console.log("  ✓ 50 activity feed entries seeded");

  // 9. NOTIFICATIONS
  console.log("\n🔔 Seeding notifications...");
  let notifCount = 0;
  for (const userId of allAssignableIds.slice(0, 20)) {
    const n = randInt(1, 3);
    for (let j = 0; j < n; j++) {
      await prisma.notification.create({
        data: {
          userId,
          title: pick(["Task Assigned to You", "Task Status Updated", "New Comment on Your Task", "Deadline Approaching"]),
          message: pick([
            "You have been assigned a new task. Please review and acknowledge.",
            "The status of your task has been updated to IN_PROGRESS.",
            "A new comment was added to a task you are following.",
            "Your task deadline is in 2 days. Please update the status.",
          ]),
          isRead: Math.random() > 0.5,
          link: `/tasks`,
        },
      });
      notifCount++;
    }
  }
  console.log(`  ✓ ${notifCount} notifications seeded`);

  // SUMMARY
  console.log("\n✅ Seed complete!\n");
  console.log("═══════════════════════════════════════════════");
  console.log("  ENTERPRISE SEED SUMMARY");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Departments : ${DEPARTMENTS.length}`);
  console.log(`  Teams       : ${Object.values(TEAMS_BY_DEPT).flat().length}`);
  console.log(`  Projects    : ${projectIds.length}`);
  console.log(`  Users       : ${userIds.length}`);
  console.log(`  Tasks       : 100`);
  console.log(`  Comments    : ${commentCount}`);
  console.log(`  Audit Logs  : 50`);
  console.log(`  Activities  : 50`);
  console.log(`  Notifications: ${notifCount}`);
  console.log("═══════════════════════════════════════════════");
  console.log("\n🔑 DEMO LOGIN CREDENTIALS");
  console.log("  SUPER_ADMIN : amira.alharbi@enterprise.com  / admin123");
  console.log("  ADMIN       : marcus.sterling@enterprise.com / admin123");
  console.log("  MANAGER     : sofia.reyes@enterprise.com    / manager123");
  console.log("  EMPLOYEE    : sarah.jenkins@enterprise.com  / employee123");
  console.log("  VIEWER      : robert.hayes@enterprise.com   / viewer123");
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
