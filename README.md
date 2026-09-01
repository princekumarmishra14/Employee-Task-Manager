# Employee Task Manager

An enterprise-grade, high-fidelity workforce and task management SaaS platform designed to bridge the gap between workforce tracking and task execution. Built with Next.js App Router for the frontend and Node.js + Express + TypeScript + Prisma/PostgreSQL for the backend.

---

## 1. Project Overview

The Employee Task Manager provides a highly responsive, modern, and localized workspace to coordinate, schedule, and audit task queues. It features:
* Role-Based Access Control (RBAC) supporting Super Admin, Admin, Manager, Employee, and Viewer roles.
* Multilingual design supporting English (LTR) and Arabic (RTL) layouts.
* Centralized activity logging to database audit trails.
* Modern typography (Poppins) and curated theme schemes (dark/light support).

---

## 2. Monorepo Structure

* **Frontend Codebase**: Located in the `/frontend` directory
* **Backend Codebase**: Located in the `/backend` directory

---

## 3. Tech Stack

### Frontend (`ETM-frontenD` Branch)
* **Framework**: Next.js 16 (App Router)
* **Language**: TypeScript (Strict Mode)
* **Styling**: Tailwind CSS v4, Poppins Font
* **Icons & Components**: Lucide Icons, Shadcn UI base components
* **State Management**: Zustand (Local Persistence)
* **Validation**: Zod Schemas
* **Notifications**: React Hot Toast

### Backend (`ETM-backenD` Branch)
* **Framework**: Node.js + Express
* **Language**: TypeScript
* **ORM**: Prisma
* **Database**: PostgreSQL
* **Authentication**: JWT (JSON Web Tokens)
* **Password Hashing**: bcryptjs
* **Validation**: Zod request schema validation

---

## 4. Folder Structure

### Frontend (`ETM-frontenD`)
```
src/
├── app/                  # Next.js Page Routes & App Layout
├── components/           # Reusable Presentation Components
│   ├── cards/            # Summary Metric Cards
│   ├── common/           # Generic Badges & Indicators
│   ├── language/         # Language Selector Toggle
│   ├── layout/           # Sidebar, Header, & Layout Controllers
│   ├── rbac/             # Permission Guards & switchers
│   └── theme/            # Theme Toggle button
├── features/
│   ├── tasks/            # Modularized Tasks Feature Domain
│   └── employees/        # Modularized Employees Feature Domain
├── hooks/                # Global custom hooks
├── store/                # Zustand local storage engine
├── i18n/                 # Translation translation dictionaries
└── utils/                # Date formatting utilities
```

### Backend (`ETM-backenD`)
```
src/
├── config/               # Database client config
├── controllers/          # Route controller handlers
├── middlewares/          # Auth security and error middlewares
├── routes/               # API endpoint routing
├── utils/                # Logging and audit utils
├── validation/           # Zod schema validation rules
└── index.ts              # Express application entry point
```

---

## 5. Environment Variables

The project includes pre-configured environment files for local development:
* Root: `.env`
* Backend: `backend/.env`
* Frontend: `frontend/.env.local`

### Backend (`backend/.env`)
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://admin:adminpassword@localhost:5432/employee_task_manager?schema=public"
JWT_SECRET="cY7JsCije9NceA+ADwHUZWBqUnzCTwnS/B2IutAFBzw="
JWT_EXPIRES_IN="8h"
JWT_REFRESH_EXPIRES_IN="30d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_URL="http://localhost:3000"

SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER=""
SMTP_PASS=""
SMTP_SECURE="false"
MAIL_FROM="no-reply@localhost"

GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
```

### Frontend (`frontend/.env.local`)
```env
AUTH_SECRET="cY7JsCije9NceA+ADwHUZWBqUnzCTwnS/B2IutAFBzw="
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000/api/auth"
NEXTAUTH_SECRET="cY7JsCije9NceA+ADwHUZWBqUnzCTwnS/B2IutAFBzw="
NEXT_PUBLIC_APP_NAME="Employee Task Manager"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
```

---

## 6. Installation & Setup

Ensure Node.js `>=20.0.0` is installed.

### Quick Start (Monorepo)
1. Install all dependencies across workspace packages:
   ```bash
   npm run install:all
   ```
2. Start local PostgreSQL database (using Docker Compose):
   ```bash
   docker-compose up -d
   ```
3. Push database schema and seed sample data:
   ```bash
   npm run db:push
   npm run db:seed
   ```
4. Start both frontend and backend concurrently in development mode:
   ```bash
   npm run dev
   ```
   - Frontend app: [http://localhost:3000](http://localhost:3000)
   - Backend API gateway: [http://localhost:5001/api](http://localhost:5001/api)

---

## 7. Database & Prisma Setup

Prisma manages all database migrations. The target schema creates the following tables:
* `roles`: Pre-seeded permissions categories.
* `users`: Authentication records with secure hashed passwords.
* `employees`: Core details of employees including department and designation.
* `tasks`: Deliverables mapped with statuses and assigned employee.
* `task_comments`: Transaction comments attached to individual tasks.
* `notifications`: In-app read/unread alerts.
* `audit_logs`: Centralized ledger for all login, create, update, and delete actions.

---

## 8. API Documentation

### Auth Module
* `POST /api/auth/login` - Authenticate user credentials and sign JWT.

### Employees Module
* `GET /api/employees` - Retrieve all employees (supports search & filters).
* `GET /api/employees/:id` - Retrieve individual employee profile.
* `POST /api/employees` - Create new user account + employee profile (Admin only).
* `PUT /api/employees/:id` - Update employee details (Admin only).
* `DELETE /api/employees/:id` - Soft deactivates employee profile (Admin only).

### Tasks Module
* `GET /api/tasks` - Retrieve tasks (Employee role sees own tasks only, Admin/Manager see all).
* `GET /api/tasks/:id` - Retrieve task details.
* `POST /api/tasks` - Create a task (Admin/Manager only).
* `PUT /api/tasks/:id` - Update task (Employee can only update status, Admin/Manager can update all fields).
* `DELETE /api/tasks/:id` - Permanently delete a task (Admin/Manager only).
* `POST /api/tasks/:id/comments` - Append a comment.

---

## 9. User Roles & Permissions

* **Super Admin / Admin**: Full administrative control across the backend. Can view all dashboard statistics, CRUD tasks, and CRUD employees.
* **Manager**: Can view the directory and create/edit tasks, but cannot add/delete/deactivate employee profiles.
* **Employee**: Restricted to own tasks. Can only change the status of their assigned tasks and append comments.
* **Viewer**: Read-only access to tasks and employee list dashboard.

---

## 10. Testing Guide

### Automated Verification
* Build frontend: `npm run build`
* Build backend: `npm run build`

### Manual Integration Flow
1. Start database server and run migration/seeding (`npm run db:push && npm run db:seed`).
2. Launch Express backend on port `5001` (`npm run dev:backend`).
3. Launch Next.js frontend on port `3000` (`npm run dev:frontend`).
4. Open the login page and test credentials:
   - Super Admin: `amira.alharbi@enterprise.com` / `admin123`
   - Manager: `marcus.sterling@enterprise.com` / `manager123`
   - Employee: `sarah.jenkins@enterprise.com` / `employee123`
5. Test task creation as Admin/Manager and check if corresponding employee receives database notification and audit log is created.
6. Verify layout responsiveness across desktop, tablet, and mobile dimensions.
