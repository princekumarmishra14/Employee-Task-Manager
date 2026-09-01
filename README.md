# Employee Task Manager

A production-ready, full-stack workforce and task management platform designed to help organizations manage employees, assign tasks, track progress, and monitor operational performance through role-based dashboards.

Built with **Next.js, TypeScript, Node.js, Express, Prisma, and PostgreSQL**, the application implements secure authentication, Role-Based Access Control (RBAC), task management, employee management, notifications, audit logging, analytics, and multilingual UI support.

---

## 🚀 Live Demo

**Live Application:** `YOUR_LIVE_URL`

### Demo Admin

- **Email:** `demo.admin@etm.com`
- **Password:** `Admin@123`
- **Role:** `ADMIN`

### Demo Employee

- **Email:** `demo.employee@etm.com`
- **Password:** `Employee@123`
- **Role:** `EMPLOYEE`

> **Demo Environment:** These accounts are created specifically for portfolio and recruitment demonstration. They do not provide access to the production Super Admin account.

---

## 📌 Project Overview

Employee Task Manager is an enterprise-style SaaS application for managing workforce operations and task execution from a centralized platform.

The system provides:

- Role-Based Access Control (RBAC)
- Employee management
- Task creation and assignment
- Task status tracking
- Dashboard analytics
- Reports and statistics
- Notifications
- Audit logging
- Secure JWT authentication
- Password hashing with bcrypt
- Multilingual English/Arabic interface
- RTL support for Arabic
- Responsive desktop, tablet, and mobile layouts
- Dark and light theme support

The public demo contains realistic sample data for recruiters and visitors, including **60 tasks** distributed across completed, in-progress, and pending states.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Secure password hashing with bcrypt
- Role-Based Access Control
- Protected API routes
- Backend-enforced permissions
- Role-specific dashboards
- Secure session handling

### 👥 Employee Management

- Create employee accounts
- View employee directory
- Search and filter employees
- Update employee information
- Manage departments and designations
- Employee profile management
- Employee activation/deactivation

### 📋 Task Management

- Create and assign tasks
- Task priority management
- Task status tracking
- Due-date management
- Employee-specific task views
- Task comments
- Task filtering and search
- Overdue task tracking

### 📊 Dashboard & Analytics

The public demo includes a realistic dataset with:

| Metric | Demo Value |
|---|---:|
| Total Tasks | **60** |
| Completed Tasks | **20** |
| In Progress | **25** |
| Pending / Unassigned | **15** |
| Overdue Tasks | **5** |
| Completion Rate | **33.33%** |

Dashboard statistics are calculated dynamically from database records rather than hardcoded values.

### 🔔 Notifications & Audit Logs

- Database-backed notifications
- Read/unread notification tracking
- Login activity logging
- Task creation/update audit trails
- Employee management audit records
- Centralized activity history

### 🌐 Internationalization

- English language support
- Arabic language support
- RTL layout support
- Localized UI components
- Responsive layouts

### 🎨 UI & Experience

- Modern enterprise dashboard
- Poppins typography
- Tailwind CSS styling
- Dark/Light theme
- Responsive design
- Accessible reusable UI components
- Lucide icons
- Shadcn UI components

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 16**
- **React**
- **TypeScript**
- **Tailwind CSS v4**
- **Zustand**
- **Zod**
- **Lucide Icons**
- **Shadcn UI**
- **React Hot Toast**

### Backend

- **Node.js**
- **Express.js**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **JWT**
- **bcryptjs**
- **Zod**

### Development Tools

- Git
- GitHub
- VS Code
- Postman
- Docker

---

## 🏗️ Architecture

The project follows a modular full-stack architecture:

```text
Employee Task Manager
│
├── Frontend
│   ├── Next.js App Router
│   ├── React + TypeScript
│   ├── Zustand
│   ├── Tailwind CSS
│   └── Role-Based UI
│
├── Backend
│   ├── Node.js
│   ├── Express.js
│   ├── TypeScript
│   ├── Prisma
│   ├── JWT Authentication
│   └── RBAC Middleware
│
└── Database
    └── PostgreSQL
````

---

## 📁 Project Structure

```text
employee-task-manager/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── i18n/
│   │   └── utils/
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── validation/
│   │   └── utils/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   └── scripts/
│       └── seed_demo_accounts.js
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🗄️ Database

Prisma ORM manages the PostgreSQL database schema.

### Main Entities

* `users` — Authentication and user accounts
* `roles` — Role and permission definitions
* `employees` — Employee profiles
* `tasks` — Task records and assignments
* `task_comments` — Task discussions
* `notifications` — User notifications
* `audit_logs` — System activity and audit history

---

## 👤 User Roles

The system supports multiple levels of access:

| Role            | Access                                                |
| --------------- | ----------------------------------------------------- |
| **Super Admin** | Full system administration and security management    |
| **Admin**       | Employee, task, dashboard, and operational management |
| **Manager**     | Task creation, assignment, and team operations        |
| **Employee**    | Assigned tasks, status updates, and comments          |
| **Viewer**      | Read-only access to permitted information             |

> The public demo accounts do **not** expose or replace the production Super Admin account.

---

## 🔌 API Overview

### Authentication

```http
POST /api/auth/login
```

Authenticate users and issue secure authentication tokens.

### Employees

```http
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
```

### Tasks

```http
GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/comments
```

### Dashboard

```http
GET /api/dashboard/stats
```

Returns database-driven dashboard statistics and analytics.

---

## 🔒 Security

Security was considered throughout the application architecture.

* JWT authentication
* bcrypt password hashing
* Backend RBAC enforcement
* Protected API endpoints
* Role-specific authorization
* Request validation using Zod
* Secure environment variable handling
* Production secrets excluded from source control
* Demo accounts separated from the real Super Admin account

**Important:** Production Super Admin credentials are never included in this repository or public documentation.

---

## ⚙️ Environment Configuration

Create environment files from the provided examples:

```text
backend/.env.example
frontend/.env.example
```

### Backend

```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/employee_task_manager?schema=public"
JWT_SECRET="your_secure_jwt_secret"
JWT_EXPIRES_IN="8h"
JWT_REFRESH_EXPIRES_IN="30d"
APP_URL="http://localhost:3000"
```

### Frontend

```env
NEXT_PUBLIC_APP_NAME="Employee Task Manager"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
```

> Never commit real passwords, JWT secrets, database credentials, API keys, or production environment variables to GitHub.

---

## 🚀 Local Installation

### Prerequisites

* Node.js `>= 20`
* PostgreSQL
* npm
* Git
* Docker (optional)

### 1. Clone Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd employee-task-manager
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Configure Environment Variables

Create the required `.env` files using the provided `.env.example` files.

### 4. Start PostgreSQL

Using Docker:

```bash
docker-compose up -d
```

### 5. Setup Database

```bash
npm run db:push
npm run db:seed
```

### 6. Start Application

```bash
npm run dev
```

Application:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5001/api
```

---

## 🧪 Testing

### Build Frontend

```bash
npm run build
```

### Build Backend

```bash
npm run build
```

### Demo Data Verification

The public demo seed can be executed using:

```bash
node backend/scripts/seed_demo_accounts.js
```

The demo dataset is designed to be idempotent and maintains the target dataset without creating duplicate demo records.

---

## 📈 Public Demo Dataset

The live demo uses fictional data for demonstration purposes.

### Task Distribution

```text
Total Tasks           60
Completed             20
In Progress           25
Pending / Unassigned  15
Overdue                5
Completion Rate    33.33%
```

All demo data is fictional and intended only for portfolio and recruitment demonstrations.

---

## 📱 Responsive Design

The application is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

The dashboard and task management interfaces automatically adapt to different screen sizes.

---

## 🔮 Future Improvements

Potential future enhancements include:

* Advanced reporting and data visualization
* Email notification workflows
* File attachments for tasks
* Advanced search
* Calendar-based task scheduling
* Real-time updates using WebSockets
* Advanced permission management
* Cloud deployment automation
* Automated CI/CD pipelines

---

## 👨‍💻 Developer

**Prince Kumar Mishra**

Full Stack Developer focused on building scalable web applications using modern JavaScript/TypeScript technologies.

### Technical Focus

* Full Stack Development
* React / Next.js
* Node.js / Express
* REST APIs
* PostgreSQL / MongoDB
* Authentication & RBAC
* Data Structures & Algorithms

---

## 📄 License

This project is developed for portfolio and educational demonstration purposes.

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

````

