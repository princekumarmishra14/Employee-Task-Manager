# EMPLOYEE TASK MANAGER — WEBSITE AUDIT RECORD

**Document Classification:** Internal Engineering Audit  
**Audit Type:** Production Readiness Review  
**Audit Date:** 2026-07-03  
**System Version:** v1.0.0  
**Prepared For:** CTO / Engineering Director / QA Lead  
**Document Status:** FINAL DRAFT — Awaiting Sign-Off  

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Technology Stack Inventory](#3-technology-stack-inventory)
4. [Project Directory Structure](#4-project-directory-structure)
5. [Authentication System](#5-authentication-system)
6. [Role-Based Access Control (RBAC)](#6-role-based-access-control-rbac)
7. [Frontend Pages — Complete Audit](#7-frontend-pages--complete-audit)
   - 7.1 [Login Page](#71-login-page--auth--loginpagetsx)
   - 7.2 [Signup Page](#72-signup-page--auth--signuppagetsx)
   - 7.3 [Forgot Password Page](#73-forgot-password-page--auth--forgot-password)
   - 7.4 [Dashboard Page](#74-dashboard-page--dashboard--dashboardpagetsx)
   - 7.5 [Employees Page](#75-employees-page--dashboard--employeespagetsx)
   - 7.6 [Tasks Page](#76-tasks-page--dashboard--taskspagetsx)
   - 7.7 [Departments Page](#77-departments-page--dashboard--departmentspagetsx)
   - 7.8 [Teams Page](#78-teams-page--dashboard--teamspagetsx)
   - 7.9 [Projects Page](#79-projects-page--dashboard--projectspagetsx)
   - 7.10 [Reports Page](#710-reports-page--dashboard--reportspagetsx)
   - 7.11 [Analytics Page](#711-analytics-page--dashboard--analyticspagetsx)
   - 7.12 [Activity Center Page](#712-activity-center-page--dashboard--activitypagetsx)
   - 7.13 [Audit Logs Page](#713-audit-logs-page--dashboard--audit-logspagetsx)
   - 7.14 [Settings Page](#714-settings-page--dashboard--settingspagetsx)
   - 7.15 [Profile Page](#715-profile-page--dashboard--profilepagetsx)
   - 7.16 [Roles & Permissions Page](#716-roles--permissions-page--dashboard--settingsrolespagetsx)
8. [Layout Shell Components](#8-layout-shell-components)
   - 8.1 [AppLayout](#81-applayouttsx)
   - 8.2 [Sidebar](#82-sidebartsx)
   - 8.3 [Header](#83-headertsx)
9. [Shared Component Library](#9-shared-component-library)
10. [Backend API Architecture](#10-backend-api-architecture)
11. [API Endpoint Catalogue](#11-api-endpoint-catalogue)
12. [Database Schema & Data Models](#12-database-schema--data-models)
13. [State Management](#13-state-management)
14. [Email Notification System](#14-email-notification-system)
15. [Security Review](#15-security-review)
16. [Accessibility Audit](#16-accessibility-audit)
17. [Internationalization (i18n)](#17-internationalization-i18n)
18. [Performance Observations](#18-performance-observations)
19. [Known Issues & Technical Debt](#19-known-issues--technical-debt)
20. [Features Not Yet Implemented](#20-features-not-yet-implemented)
21. [Environment & Configuration](#21-environment--configuration)
22. [Deployment Considerations](#22-deployment-considerations)

---

## 1. EXECUTIVE SUMMARY

The **Employee Task Manager (ETM)** is a full-stack enterprise workforce operations platform built as a monorepo. It enables organizations to manage employees, tasks, departments, teams, and projects under a unified interface with multi-role access control.

The system is structured as a **Next.js 14 App Router frontend** communicating with an **Express + Prisma + PostgreSQL backend** via REST API. Authentication is JWT-based with NextAuth.js session management on the frontend and a custom Express JWT middleware on the backend. The application supports full bilingual (English/Arabic with RTL layout switching) operation.

**Key strengths identified:**
- Role-scoped data access enforced both on the frontend (`ProtectedRoute`) and the backend (`requirePermission` middleware)
- Multi-view task management: List, Kanban, and Calendar
- Comprehensive audit logging for all critical mutations
- Email lifecycle integrations (welcome, OTP reset, login alerts, account lockout)
- Modular component architecture with clean separation of concern

**Key risks identified:**
- JWT secret is partially hardcoded in `auth.controller.ts` as a fallback when `AUTH_SECRET` env var is absent
- Password change in Settings does not call a real API endpoint — it logs a fake success toast only
- Notification preferences (Settings > Notifications tab) are not persisted to the database
- Active sessions panel in Settings is hardcoded mock data
- Profile page contains hardcoded fallback data (manager name, address, skills)
- `departments:delete` and `teams:delete` permissions are missing from RBAC config
- No rate limiting middleware visible on non-auth routes
- No evidence of CSRF protection tokens

---

## 2. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                               │
│                                                                     │
│  Next.js 14 App Router (frontend)                                   │
│  • (auth) group → Login, Signup, Forgot Password, Reset Password    │
│  • (dashboard) group → All authenticated modules                    │
│  • Zustand store → Global in-memory state (dbStore)                 │
│  • NextAuth.js v5 → Session management, Google OAuth               │
│  • Axios → REST API communication layer                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP/REST (JSON)
                             │ Port: 5001
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   EXPRESS.JS API SERVER (Backend)                   │
│                                                                     │
│  Middleware Pipeline:                                               │
│   1. CORS (configured origins)                                      │
│   2. JSON body parser (50mb limit)                                  │
│   3. Cookie parser                                                  │
│   4. Request logger                                                 │
│   5. Static file serving (/uploads)                                 │
│   6. Route dispatcher → api.routes.ts                              │
│   7. Global error handler                                           │
│                                                                     │
│  Route Modules:                                                     │
│   auth.routes, employee.routes, task.routes, department.routes,     │
│   team.routes, project.routes, report.routes, upload.routes,        │
│   roles.routes, google.routes, notification.routes, settings.routes │
└────────────────────────────┬────────────────────────────────────────┘
                             │ Prisma ORM
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       PostgreSQL DATABASE                           │
│                                                                     │
│  Core Models: User, Employee, Task, Department, Team, Project       │
│  Security:   Role, Permission, RolePermission, Session, LoginHistory│
│  Audit:      AuditLog                                               │
│  Notification: Notification                                         │
└─────────────────────────────────────────────────────────────────────┘
```

**Backend port override:** Port 5001 is forced (not 5000) because macOS AirPlay Receiver occupies port 5000 by default. This is implemented via `process.env.PORT || 5001` in `backend/src/index.ts`.

---

## 3. TECHNOLOGY STACK INVENTORY

### Frontend

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | `"use client"` directive used throughout; Server Components limited |
| Language | TypeScript | Strict mode; multiple `eslint-disable` suppressions noted |
| Styling | Tailwind CSS v3 | Custom design tokens via CSS variables in `globals.css` |
| Font | Poppins (Google Fonts) | Applied via `font-poppins` utility class |
| State Management | Zustand | `dbStore.ts` — global operational data + notifications |
| Auth Session | NextAuth.js v5 (beta) | JWT strategy; Google OAuth provider |
| HTTP Client | Axios | Instance configured in `lib/axios.ts` |
| Icons | Lucide React | Consistent icon library throughout |
| Forms | Native React state | No dedicated form library (React Hook Form not used) |
| Charts | Custom SVG | Hand-coded SVG charts; no external chart library |

### Backend

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js | Version not pinned in `package.json` |
| Framework | Express.js | v4.x |
| Language | TypeScript | Compiled via `tsconfig.json` |
| ORM | Prisma | v5.x — PostgreSQL adapter |
| Database | PostgreSQL | Required external instance |
| Auth | JWT (`jsonwebtoken`) | Access token: 8h, Refresh token: 30d |
| Password Hashing | bcryptjs | 12 salt rounds for passwords; 10 for OTP hashes |
| Validation | Zod | Schema-based validation on all auth routes |
| Email | Custom `EmailService` | SMTP-based; uses `nodemailer` (inferred) |
| File Upload | `multer` | `/uploads` endpoint; files stored locally |

### DevOps / Tooling

| Tool | Purpose |
|---|---|
| npm workspaces | Monorepo management (`frontend/`, `backend/`) |
| Prisma CLI | Schema migrations, DB seed, client generation |
| ESLint | Linting (multiple disables detected in task/employee pages) |
| `.env` files | Per-workspace environment configuration |

---

## 4. PROJECT DIRECTORY STRUCTURE

```
Employee Task Manager/
├── package.json                    # Root workspace config
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── public/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx          # Root HTML layout
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   ├── signup/page.tsx
│       │   │   └── forgot-password/page.tsx
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx      # AppLayout wrapper
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── employees/
│       │   │   │   ├── page.tsx
│       │   │   │   └── [id]/page.tsx
│       │   │   ├── tasks/page.tsx
│       │   │   ├── departments/page.tsx
│       │   │   ├── teams/page.tsx
│       │   │   ├── projects/page.tsx
│       │   │   ├── reports/page.tsx
│       │   │   ├── analytics/page.tsx
│       │   │   ├── activity/page.tsx
│       │   │   ├── audit-logs/page.tsx
│       │   │   ├── settings/
│       │   │   │   ├── page.tsx
│       │   │   │   └── roles/page.tsx
│       │   │   └── profile/page.tsx
│       │   └── actions/
│       │       └── auth.ts         # Server Actions (logout)
│       ├── components/
│       │   ├── layout/             # AppLayout, Sidebar, Header
│       │   ├── dashboard/          # All page-specific components
│       │   │   ├── tasks/          # TaskTable, TaskKanban, TaskCalendar, etc.
│       │   │   ├── employees/      # EmployeeTable, EmployeeModal, etc.
│       │   │   └── ...
│       │   ├── common/             # Toast, Spinner, etc.
│       │   ├── rbac/               # ProtectedRoute, AccessDeniedState
│       │   ├── language/           # LanguageToggle
│       │   └── theme/              # ThemeToggle
│       ├── hooks/
│       │   ├── useAuth.ts          # Auth context + JWT decode
│       │   ├── useTranslation.ts   # i18n hook
│       │   ├── useTasks.ts         # Task fetching + filter logic
│       │   ├── useTaskCrud.ts      # Task CRUD state machine
│       │   ├── use-theme.ts        # Light/Dark/System theme hook
│       │   └── useToast.ts         # Toast notification manager
│       ├── services/
│       │   ├── task.service.ts
│       │   ├── employee.service.ts
│       │   ├── department.service.ts
│       │   ├── team.service.ts
│       │   ├── project.service.ts
│       │   └── googleAuth.ts
│       ├── store/
│       │   └── dbStore.ts          # Zustand global store
│       ├── lib/
│       │   └── axios.ts            # Axios instance configuration
│       ├── constants/
│       │   ├── permissions.ts      # Permission string union type
│       │   └── roles.ts            # UserRole enum
│       ├── config/
│       │   └── rbac.ts             # ROLE_PERMISSIONS map
│       └── types/
│           ├── task.types.ts
│           ├── employee.types.ts
│           └── ...
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma           # Source of truth for data models
│   │   └── seed.ts                 # DB seed script
│   └── src/
│       ├── index.ts                # Server entry point + middleware pipeline
│       ├── routes/
│       │   └── api.routes.ts       # Central route registry
│       ├── modules/
│       │   ├── auth/
│       │   │   └── auth.controller.ts
│       │   ├── employee/
│       │   ├── task/
│       │   ├── department/
│       │   ├── team/
│       │   ├── project/
│       │   ├── report/
│       │   └── roles/
│       ├── middleware/
│       │   ├── auth.middleware.ts  # JWT verification
│       │   └── rbac.middleware.ts  # requirePermission guard
│       ├── services/
│       │   └── email/
│       │       └── email.service.ts
│       └── lib/
│           ├── prisma.ts           # Prisma singleton client
│           └── audit.ts            # writeAuditLog utility
```

---

## 5. AUTHENTICATION SYSTEM

### 5.1 Auth Flow (Credentials)

**File:** `backend/src/modules/auth/auth.controller.ts`

The login flow executes 6 sequential steps:

1. **Input validation** — Email and password are required; email is normalized to lowercase.
2. **User lookup** — `prisma.user.findUnique` with `employee` and `role` (including `rolePermissions`) relations.
3. **Account lockout check** — If `lockedUntil > now`, returns HTTP 423 with lockout message. Maximum 5 failed attempts trigger a 15-minute lockout. An automated lockout email is sent to the user.
4. **Password comparison** — `bcrypt.compare(password, user.passwordHash)`. On failure, increments `failedLoginAttempts`. On the 5th failure, sets `lockedUntil = now + 15m`.
5. **Email verification gate** — If `!user.isEmailVerified`, returns HTTP 403 with `isUnverified: true` flag.
6. **Token issuance** — Issues two tokens:
   - **Access Token:** 8-hour TTL. Payload: `{id, email, role, employeeId, title}`.
   - **Refresh Token:** 30-day TTL. Payload: `{id}`.
   - Both are signed with `process.env.AUTH_SECRET || process.env.JWT_SECRET || "<hardcoded_fallback>"`.

On success, the system:
- Resets `failedLoginAttempts` and `lockedUntil`.
- Updates `lastLoginAt`, `lastLoginIP`, `lastLoginDevice`, `loginMethod`.
- Creates a `LoginHistory` record.
- Writes to `AuditLog`.
- Sends a new-login security alert email.

### 5.2 Auth Flow (Google OAuth)

**Handled by:** NextAuth.js Google provider (frontend) + `backend/src/modules/auth/google.routes.ts`

- Users can sign in with Google via the NextAuth provider.
- A separate "Connect Google Account" flow on the Profile page allows linking/unlinking a Google ID to an existing credentials account.
- `connectGoogleAccount(idToken)` — POST to `/api/google/connect` with the Google ID token.
- `disconnectGoogleAccount()` — POST to `/api/google/disconnect`.

### 5.3 Registration (Signup)

**Validation schema (Zod):**
- `firstName`: min 2, max 100
- `lastName`: min 2, max 100
- `email`: valid email, lowercased
- `mobile`: optional
- `department`: required (matched or created in DB)
- `designation`: min 2, max 150
- `password`: min 8, max 32

**Process (atomic Prisma transaction):**
1. Checks for existing user; supports account reactivation if previously soft-deleted.
2. Hashes password (bcrypt, 12 rounds).
3. Generates unique `employeeCode` in format `EMP-{YEAR}-{4-digit suffix}`.
4. Generates 32-byte hex email verification token (24h expiry).
5. Finds or creates department by name.
6. Creates `User` + `Employee` records in the same transaction.
7. Sends Welcome, Account Created, and Verification emails (asynchronously).

### 5.4 Forgot Password / OTP Reset

**Flow:**

1. `POST /api/auth/forgot-password` — Accepts email. Generates a 6-digit numeric OTP (cryptographically secure via `crypto.randomBytes`), hashes it (bcrypt, 10 rounds), stores hash + 10-minute expiry in user record. Enforces a 60-second resend cooldown and a 3-resend-per-hour limit.
2. `POST /api/auth/verify-otp` — Validates the 6-digit OTP. Maximum 5 verify attempts before OTP is invalidated.
3. `POST /api/auth/reset-password` — Accepts `{email, otp, password, confirmPassword}`. Password policy enforced via Zod regex:
   - Min 8 chars
   - At least 1 uppercase
   - At least 1 lowercase
   - At least 1 digit
   - At least 1 special character
4. On success: clears all active sessions, resets lockout counters, updates `lastPasswordChange`, sends "Password Changed" security email.

### 5.5 Session Management

- Frontend uses NextAuth.js v5 JWT sessions stored in cookies.
- `useAuth` hook decodes the session and exposes `user`, `role`, `permissions[]`, `isAuthenticated`, `can(permission)`, and `refreshSession()`.
- The `refreshSession()` function is called after profile updates to sync session data.
- Backend validates `Authorization: Bearer <token>` on every protected route via `auth.middleware.ts`.
- Token refresh: `POST /api/auth/refresh` accepts a refresh token and issues a new access token.
- Logout: `POST /api/auth/logout` writes an audit log entry. Frontend uses a Server Action (`logoutAction`) which calls NextAuth's `signOut`.

---

## 6. ROLE-BASED ACCESS CONTROL (RBAC)

### 6.1 Role Hierarchy

| Role | Level | Description |
|---|---|---|
| SUPER_ADMIN | 1 (highest) | Full system access including roles management |
| ADMIN | 2 | Departmental operations, no roles management |
| MANAGER | 3 | Team/employee management, task assignment, reports |
| TEAM_LEAD | 4 | Task view/create/update/assign; employee view |
| EMPLOYEE | 5 | View tasks and employees; update own tasks |
| VIEWER | 6 (lowest) | Read-only access to dashboard, employees, tasks, projects, reports |

### 6.2 Permission Matrix

**File:** `frontend/src/config/rbac.ts`

| Permission | SUPER_ADMIN | ADMIN | MANAGER | TEAM_LEAD | EMPLOYEE | VIEWER |
|---|---|---|---|---|---|---|
| dashboard:view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| employees:view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| employees:create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| employees:update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| employees:delete | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| departments:view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| departments:create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| departments:update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| teams:view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| teams:create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| teams:update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| projects:view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| projects:create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| projects:update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| tasks:view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| tasks:create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| tasks:update | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| tasks:delete | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| tasks:assign | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| reports:view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| audit_logs:view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| settings:view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| settings:update | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| roles:view | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| roles:manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Note:** `departments:delete` and `teams:delete` permissions are defined nowhere in the RBAC config — this is a gap.

### 6.3 Frontend Enforcement

- `ProtectedRoute` component wraps each page's JSX with a `permission` prop check.
- `useAuth().can(permission)` resolves permissions from the decoded session token.
- Sidebar nav items are filtered via `can(item.permission)` — invisible routes are never rendered.

### 6.4 Backend Enforcement

- `authenticate` middleware (`auth.middleware.ts`) verifies the `Authorization: Bearer` JWT.
- `requirePermission(module, action)` middleware checks the user's role permissions from the DB.
- All non-public routes are wrapped with both middlewares.

---

## 7. FRONTEND PAGES — COMPLETE AUDIT

### 7.1 Login Page (`(auth)/login/page.tsx`)

**Route:** `/login`  
**Auth Required:** No (public)  
**Permission Guard:** None

#### UI Elements
| Element | Type | Description |
|---|---|---|
| Logo + Brand Name | Static | "Employee Task Manager" brand mark |
| Email input | `<input type="email">` | Required; validates email format |
| Password input | `<input type="password">` | Required |
| Show/Hide password toggle | Button | Eye icon toggles `type` between `password`/`text` |
| Remember Me checkbox | `<input type="checkbox">` | Stores preference in localStorage; does not extend session |
| Forgot Password link | `<Link>` | Routes to `/forgot-password` |
| Login button | `<button type="submit">` | Submits credentials form |
| Google Sign In button | `<GoogleLogin>` via `@react-oauth/google` | Triggers Google OAuth flow |
| "Don't have an account?" link | `<Link>` | Routes to `/signup` |
| Language toggle | `LanguageToggle` component | Switches EN/AR |
| Theme toggle | `ThemeToggle` component | Switches Light/Dark/System |

#### Validation
- Email: required, format-checked client-side before submission
- Password: required
- On successful login: stores `accessToken` + `refreshToken` in memory; NextAuth session created
- On failure: error message displayed below the form

#### API Calls
- `POST /api/auth/login` — credentials submission
- Google OAuth: handled by NextAuth Google provider internally

#### State Managed
- `isLoading` — disables button and shows spinner during API call
- `error` — inline error message string
- `showPassword` — toggles password visibility
- `rememberMe` — checkbox state

---

### 7.2 Signup Page (`(auth)/signup/page.tsx`)

**Route:** `/signup`  
**Auth Required:** No (public)  
**Permission Guard:** None

#### UI Elements
| Element | Description |
|---|---|
| First Name input | Required, min 2 chars |
| Last Name input | Required, min 2 chars |
| Email input | Required, validated email |
| Mobile input | Optional phone number |
| Employee ID input | Optional |
| Department selector | Dropdown populated from backend department list |
| Designation/Title input | Required, min 2 chars |
| Password input | Min 8, max 32 chars with show/hide toggle |
| Confirm Password input | Must match password |
| Submit button | Calls `POST /api/auth/signup` |
| Login redirect link | "Already have an account?" |

#### Validation
- All Zod schema rules mirrored client-side
- Password strength feedback shown inline
- Confirmation mismatch blocked before submission

#### Post-Signup
- Server sends 3 emails: Welcome, Account Created, Verification
- User is redirected to login with success message
- Account requires email verification before login is permitted

---

### 7.3 Forgot Password Page (`(auth)/forgot-password`)

**Route:** `/forgot-password`  
**Auth Required:** No (public)  
**Permission Guard:** None

#### Multi-Step Flow
**Step 1 — Email submission**
- Email input field
- `POST /api/auth/forgot-password`
- Success advances to Step 2

**Step 2 — OTP verification**
- 6 individual digit input boxes (one digit per box)
- Auto-advance on digit entry
- `POST /api/auth/verify-otp`
- Resend OTP button with 60-second cooldown timer displayed to user
- Maximum 5 failed attempts before OTP is invalidated
- Maximum 3 resends per hour

**Step 3 — Password reset**
- New Password input (min 8, uppercase, lowercase, number, special char)
- Confirm New Password input
- `POST /api/auth/reset-password`
- On success: redirect to `/login`

---

### 7.4 Dashboard Page (`(dashboard)/dashboard/page.tsx`)

**Route:** `/dashboard`  
**Auth Required:** Yes  
**Permission Guard:** `dashboard:view`

#### Page Sections

**Section 1 — KPI Summary Cards (Top Row)**
Four metric cards rendered dynamically from live data:

| Card | Data Source | Click Behavior |
|---|---|---|
| Total Employees | `employees.length` (active only) | Navigates to `/employees` |
| Tasks Completed | `tasks.filter(COMPLETED)` | Navigates to `/tasks?status=COMPLETED` |
| Active Departments | `departments.filter(isActive)` | Navigates to `/departments` |
| Active Projects | `projects.filter(isActive)` | Navigates to `/projects` |

**Section 2 — Global Search Bar**
- Triggers CMD+K command palette (same as Header search)

**Section 3 — Task Status Breakdown Bar**
- Horizontal segmented progress bar
- Segments: Completed (green), In Progress (blue), Pending (yellow), Overdue (red)
- Values derived from Zustand store task data

**Section 4 — Recent Tasks Table**
- Displays the 5 most recently created/updated tasks
- Columns: Task Title, Assignee, Status Badge, Priority Badge, Due Date
- Row click → navigates to `/tasks?id={taskId}`

**Section 5 — Recent Employees Grid**
- Displays up to 8 recently added employee cards
- Each card: Avatar, Name, Title, Department Badge
- "View All" button → `/employees`

**Section 6 — Department Activity Feed**
- Lists departments with task count indicators
- Color-coded completion percentage bar per department

**Section 7 — Team Overview Cards**
- Displays all active teams
- Each card: Team name, member count, lead name

**Section 8 — Project Progress Summary**
- Lists active projects with milestone completion percentages

**Section 9 — Quick Actions Panel**
- "Add Task" button → opens Task creation modal
- "Add Employee" button → navigates to `/employees?action=add`

#### Data Fetching
- On mount: calls `syncOperationalData()` from Zustand store
- `syncOperationalData()` fires parallel API calls for employees, tasks, departments, teams, projects
- Data cached in Zustand store for the session

---

### 7.5 Employees Page (`(dashboard)/employees/page.tsx`)

**Route:** `/employees`  
**Auth Required:** Yes  
**Permission Guard:** `employees:view`

#### UI Sections

**Header**
- Page title: "Employees" / "الموظفون" (i18n)
- Subtitle: contextual description
- Filter chips row: "All", "Active", "Inactive"
- Department filter dropdown
- "Add Employee" button (visible to roles with `employees:create`)

**Search & Filter Bar**
- Text search input — searches by name, title, employee code
- Results are filtered client-side in real-time

**Employee Table / Grid**

Default view: Table with columns:
| Column | Data | Notes |
|---|---|---|
| Employee | Avatar + Full Name + Employee Code | Clickable — opens detail drawer |
| Title / Designation | Employee title | — |
| Department | Department name | — |
| Team | Team name | — |
| Status | Active/Inactive badge | Color-coded |
| Actions | Edit, Delete (role-gated) | — |

Alternate view: Card Grid (toggle button)

**Employee Detail Drawer**
- Slides in from right on row/card click
- Displays: Avatar, name, title, role badge, department, team, email, phone, employee code, hire date, bio, skills tags
- "Edit" button inside drawer → opens edit modal

**Add/Edit Employee Modal**
- Full Name, Email, Phone, Title/Designation, Department (dropdown), Team (dropdown), Employee ID, Hire Date, Avatar URL, Status toggle, Bio, Skills tags
- Validation: Name and Email required; email format checked
- `POST /api/employees` (create) or `PUT /api/employees/:id` (edit)
- On success: Zustand store updated + toast notification shown

**Delete Employee**
- Confirmation dialog appears before deletion
- `DELETE /api/employees/:id`
- Soft-delete: sets `deletedAt` and `isActive = false` — record not removed from DB
- On success: toast shown, table refreshed

**Inline Validation Rules**
- Name: required, min 2 chars
- Email: required, valid format, unique (server-side check)
- Department: required selection
- Employee Code: auto-generated if not provided

#### URL Parameter Support
- `?action=add` → auto-opens Add Employee modal on page load
- `?id={employeeId}` → auto-opens employee detail drawer for that ID

---

### 7.6 Tasks Page (`(dashboard)/tasks/page.tsx`)

**Route:** `/tasks`  
**Auth Required:** Yes  
**Permission Guard:** `tasks:view`

#### View Mode Switcher
Three display modes toggled via a 3-icon sliding selector (preference persisted in `localStorage` key `task-view-mode`):
- **List View** (default) — tabular display with pagination
- **Kanban Board** — drag-and-drop column-based status board
- **Calendar View** — month-view calendar with tasks plotted on due dates

#### Metric Summary Tabs (List View Only)

`TaskMetricsSegmentedControl` component displays 4 clickable stat tabs:

| Tab | Filter Applied | Count Source |
|---|---|---|
| Total | Reset all filters | `analytics.total` |
| Assigned | `statusFilter = "ASSIGNED"` | `analytics.assigned` |
| Unassigned | `statusFilter = "UNASSIGNED"` | `analytics.pending` |
| Completed | `statusFilter = "COMPLETED"` | `analytics.completed` |

Clicking a tab applies the corresponding filter to the task list below.

#### Filter Controls (`TaskFilters` component)

| Filter | Type | Options |
|---|---|---|
| Search | Text input | Searches title, description, tags |
| Status | Dropdown | All, In Progress, Completed, Overdue, Assigned, Unassigned |
| Priority | Dropdown | All, Low, Medium, High, Escalated |
| Department | Dropdown | Dynamic from store |
| Team | Dropdown | Dynamic from store |
| Assignee | Dropdown | Dynamic employee list |
| Due Date range | Date pickers | From/To date range |
| Saved Filter presets | Dropdown | User-saved filter combinations |

#### `FilterSummary` Component
- Displays active filter pills below the filter bar
- Each pill has an X button to clear that individual filter
- "Reset All" button clears all filters
- Shows "Showing X of Y tasks" count

#### List View (`TaskTable` component)

Columns:
| Column | Details |
|---|---|
| Task Title | Truncated; click → opens detail drawer |
| Assignee | Avatar + name |
| Status | Color-coded badge |
| Priority | Color-coded badge |
| Department | Text |
| Due Date | Formatted date with overdue indicator |
| Tags | Pill badges |
| Actions | View, Edit, Duplicate, Delete (role-gated) |

Pagination:
- 10 items per page (client-side)
- Page controls at bottom: Prev, page numbers, Next
- Auto-resets to page 1 on filter change

#### Kanban View (`TaskKanban` component)
- Columns: UNASSIGNED, ASSIGNED, IN_PROGRESS, COMPLETED, OVERDUE, ARCHIVED
- Drag-and-drop between columns triggers `TaskService.updateTask()` with new status
- Each card: Title, assignee avatar, priority badge, due date
- On status change: toast notification shown (success or error)

#### Calendar View (`TaskCalendar` component)
- Standard month grid calendar
- Tasks plotted on their `dueDate`
- Click on task pill → opens `TaskDetailDrawer`
- Month navigation: Prev/Next arrows

#### Task Detail Drawer (`TaskDetailDrawer` component)
- Right-slide drawer showing full task details
- Fields: Title, Description, Status, Priority, Assignee (with avatar), Department, Team, Project, Tags, Start Date, Due Date, Estimated Hours, Created At
- "Edit" button → opens Edit modal
- "Close" button / backdrop click → closes drawer

#### Task Create/Edit Modal (`TaskModal` component)

Fields:
| Field | Required | Type |
|---|---|---|
| Title | Yes | Text input |
| Description | No | Textarea |
| Status | Yes | Dropdown (enum values) |
| Priority | Yes | Dropdown: LOW, MEDIUM, HIGH, ESCALATED |
| Assignee | No | Searchable employee dropdown |
| Department | No | Dropdown |
| Team | No | Dropdown |
| Project | No | Dropdown |
| Due Date | Yes | Date picker |
| Start Date | No | Date picker |
| Estimated Hours | No | Number input |
| Tags | No | Multi-tag input |

Submit: `POST /api/tasks` (create) or `PUT /api/tasks/:id` (edit)

#### Task Duplication
- "Duplicate" action on each row
- Creates new task with same fields, title appended with " (Copy)"
- `startDate` reset to current date

#### Delete Task
- `ConfirmDialog` component shown before deletion
- `DELETE /api/tasks/:id`
- Soft-delete: `isDeleted = true` — task hidden from standard views

#### Toast Notifications
- Fixed position bottom-right panel (bottom-left in RTL mode)
- Types: `success` (green), `error` (red), `info` (blue)
- Auto-dismiss not implemented — manual X button required

#### URL Parameter Support
- `?action=add` → auto-opens Create Task modal
- `?id={taskId}` → auto-opens that task's detail drawer
- `?status={STATUS}` → pre-applies status filter (COMPLETED, IN_PROGRESS, PENDING, OVERDUE)

---

### 7.7 Departments Page (`(dashboard)/departments/page.tsx`)

**Route:** `/departments`  
**Auth Required:** Yes  
**Permission Guard:** `departments:view`

#### UI Sections
- Department cards grid
- Each card: Department name, manager name, active employee count, active task count, creation date
- "Add Department" button (visible to `departments:create` roles)
- Edit button per card (visible to `departments:update` roles)
- Delete button per card — **⚠ `departments:delete` permission not defined in RBAC config**

#### Add/Edit Department Modal
Fields: Name, Description, Manager (employee dropdown), Color (optional)

#### Data Source
- `GET /api/departments` — populates cards
- Zustand store `departments` array updated on create/edit/delete

---

### 7.8 Teams Page (`(dashboard)/teams/page.tsx`)

**Route:** `/teams`  
**Auth Required:** Yes  
**Permission Guard:** `teams:view`

#### UI Sections
- Team cards grid or table
- Each card: Team name, department name, team lead, member count, active task count
- Member avatars displayed (up to 5, then "+N more")
- "Add Team" button (visible to `teams:create` roles)
- Edit/Delete actions (role-gated)

#### Add/Edit Team Modal
Fields: Name, Department (dropdown), Team Lead (employee dropdown), Description

**Note:** `teams:delete` permission is not defined in `rbac.ts`. Delete action will be blocked by `ProtectedRoute` or will fail silently.

---

### 7.9 Projects Page (`(dashboard)/projects/page.tsx`)

**Route:** `/projects`  
**Auth Required:** Yes  
**Permission Guard:** `projects:view`

#### UI Sections
- Project cards grid
- Each card: Project name, description, status badge, department, team, start date, end date, milestone percentage
- "Add Project" button (visible to `projects:create` roles)
- Edit/Delete actions

#### Add/Edit Project Modal
Fields: Name, Description, Department, Team, Status, Start Date, End Date

#### Milestone Tracking
- Project completion percentage calculated from linked tasks: `completed / total * 100`
- Displayed as progress bar on each card

---

### 7.10 Reports Page (`(dashboard)/reports/page.tsx`)

**Route:** `/reports`  
**Auth Required:** Yes  
**Permission Guard:** `reports:view`

#### Summary KPI Cards (Top Row)
Three non-interactive metric cards:

| Card | Value | Note |
|---|---|---|
| General Completion Rate | `(completedTasks / totalTasks) * 100` % | Live data |
| Operational Efficiency Index | **94.8 / 100** | **Hardcoded — Not Yet Implemented** |
| Mean Deliverable Lead Time | **4.2 Days** | **Hardcoded — Not Yet Implemented** |

#### Report Tabs

**Tab 1 — Employee Performance**

Table columns:
- Employee Name + Email
- Department
- Total Tasks assigned
- Tasks Completed
- Tasks Overdue
- Completion Rate % (with mini progress bar)

Data: Derived client-side from Zustand store. Sorted descending by completion rate.

**Tab 2 — Task Completion Lead-Time**

Table columns:
- Task Title + ID
- Assignee
- Priority
- Due Date
- Completed Date
- Days to Complete (start date to completion date)

Data: Only COMPLETED tasks; sorted descending by days.

**Tab 3 — Department Productivity**

Table columns:
- Department Name
- Total Tasks
- Tasks Completed
- Active / Pending
- Efficiency Rate % (with mini progress bar)

#### CSV Export
- "Export Report (CSV)" button triggers client-side CSV generation
- File naming per report type:
  - `Employee_Performance_Report.csv`
  - `Task_Completion_Report.csv`
  - `Department_Productivity_Report.csv`
- BOM prefix (`\uFEFF`) added for Excel UTF-8 compatibility
- Uses `URL.createObjectURL(blob)` + hidden anchor click pattern

---

### 7.11 Analytics Page (`(dashboard)/analytics/page.tsx`)

**Route:** `/analytics`  
**Auth Required:** Yes  
**Permission Guard:** Role-based (all roles including EMPLOYEE)

#### Role-Scoped Data Filtering

The analytics page applies role-based data scoping via `useMemo`:

| Role | Data Scope |
|---|---|
| SUPER_ADMIN | All organization data |
| ADMIN | Department-specific data |
| MANAGER / TEAM_LEAD | Team-specific data |
| EMPLOYEE | Personal data only (own tasks, own team, own dept) |

A "view context" badge in the header displays the active scope label.

#### KPI Cards Grid (8 cards)

| Card | Metric | Color |
|---|---|---|
| Total Employees | Scoped count | Brand primary (indigo) |
| Active Employees | `isActive = true` | Status success (green) |
| Total Departments | Scoped count | Status info (blue) |
| Total Teams | Scoped count | Indigo |
| Total Projects | Scoped count | Amber |
| Total Tasks | Scoped count | Sky |
| Completed Tasks | Status = COMPLETED | Emerald |
| Pending Tasks | Not completed/archived | Purple |

#### Charts (10 custom SVG visualizations)

| # | Chart Name | Type | Data |
|---|---|---|---|
| 1 | Task Completion Trend (Last 7 Days) | Line area chart | Tasks completed per day for last 7 days |
| 2 | Task Priority Distribution | Donut chart | LOW / MEDIUM / HIGH / ESCALATED split |
| 3 | Weekly Workload | Column bar chart | Tasks created per weekday (Sun–Sat) |
| 4 | Monthly Allocation Performance | Grouped column chart | Allocated vs. completed tasks per month (last 6 months) |
| 5 | Department Productivity | Horizontal progress bars | Completion rate % per department (top 4) |
| 6 | Employee Distribution | Horizontal bars | Staff count per department (top 4) |
| 7 | Project Milestones | Horizontal bars | Project completion % (top 5) |
| 8 | Productivity Leaderboard | Ranked list with avatars | Top 5 employees by completed task count |
| 9 | Task Deadline Analysis | Percentage stats | Overdue / Due Soon (≤3 days) / On Track |
| 10 | System Activity Log | Feed list | Last 5 audit log entries scoped by role |

**All charts use fallback/illustrative data when live task data is zero**, to ensure the page always renders meaningfully during demos or new deployments.

**Note:** Charts are implemented as raw SVG — no external charting library is used. Interactive hover tooltips are implemented via CSS group-hover visibility transitions.

---

### 7.12 Activity Center Page (`(dashboard)/activity/page.tsx`)

**Route:** `/activity`  
**Auth Required:** Yes  
**Permission Guard:** `audit_logs:view`

#### UI Sections
- Timeline-style feed of recent system activities
- Sourced from Zustand store `auditLogs` array
- Each entry: Action type badge (color-coded), entity type, detail text, performer name, timestamp
- Search filter: text search across details and performer
- Type filter chips: All, CREATE, UPDATE, DELETE, STATUS_CHANGE
- Pagination: 15 items per page

---

### 7.13 Audit Logs Page (`(dashboard)/audit-logs/page.tsx`)

**Route:** `/audit-logs`  
**Auth Required:** Yes  
**Permission Guard:** `audit_logs:view`

#### UI Sections

**Event Count Chips (Filter Bar)**

| Chip | Count | Filter |
|---|---|---|
| All Events | Total audit log count | None |
| CREATE | CREATE events | `action = "CREATE"` |
| UPDATE | UPDATE events | `action = "UPDATE"` |
| DELETE | DELETE events | `action = "DELETE"` |
| STATUS_CHANGE | Status change events | `action = "STATUS_CHANGE"` |
| PERM_CHANGE | Permission change events | `action = "PERMISSION_CHANGE"` |

Active chip highlighted with brand primary background.

**Search Input**
- Searches across: `log.details`, `log.performedBy`, `log.entity`
- Real-time filtering; resets to page 1 on query change

**Audit Log Table**

Columns:
| Column | Display |
|---|---|
| Action | Color-coded badge with icon (Plus, Trash2, RefreshCw, Key) |
| Entity | Monospace uppercase entity type (USER, TASK, EMPLOYEE, etc.) |
| Details | Full detail string; if `previousValue` and `newValue` exist, shows before/after diff block |
| Performed By | Performer name |
| Date | Localized short date + time |

**Pagination**
- 15 logs per page
- Shows "Showing X–Y of Z" count
- Prev/Next + numbered page buttons (max 5 pages shown)

**Action Color Coding**

| Action | Background | Text |
|---|---|---|
| CREATE | Green (success) | Success green |
| UPDATE | Blue (info) | Info blue |
| DELETE | Red (danger) | Danger red |
| LOGIN | Brand muted | Brand primary |
| PERMISSION_CHANGE | Amber (warning) | Warning amber |
| STATUS_CHANGE | Amber (warning) | Warning amber |

---

### 7.14 Settings Page (`(dashboard)/settings/page.tsx`)

**Route:** `/settings`  
**Auth Required:** Yes  
**Permission Guard:** `settings:view`

#### Tab Structure

The settings page is organized into 4 tabs rendered via conditional rendering (no routing):

**Tab 1 — Profile Settings**

| Element | Details |
|---|---|
| Avatar Preview | 64×64 rounded image showing current avatar or initials |
| Preset Avatar Gallery | 6 preset Unsplash portrait images clickable to select |
| Custom Avatar URL input | Text input + file upload button |
| File Upload | `POST /api/upload` with `multipart/form-data`; updates `profileAvatarUrl` |
| Full Name input | Pre-filled from `currentUser.name` |
| Email Address input | Pre-filled from `currentUser.email` |
| Phone Number input | Pre-filled from `currentUser.phone` |
| "Update Profile" button | `PUT /api/employees/:id` with updated fields |

On save:
1. Calls `EmployeeService.updateEmployee(id, { fullName, email, phone, avatarUrl })`
2. Updates Zustand store via `updateEmployee()` + `setCurrentUser()`
3. Calls `refreshSession()` to sync NextAuth session
4. Shows success/error toast

**Tab 2 — Theme & Language**

Theme options (3-column grid):
- Light Mode
- Dark Mode
- System Default (follows OS preference)

Clicking a theme calls `setTheme(id)` from `use-theme` hook. Preference persisted in `localStorage`.

Language options (2-column grid):
- English (LTR)
- العربية (RTL)

Clicking a language calls `setLanguage(id)` from Zustand store. Triggers full RTL layout switch.

**Tab 3 — Notification Settings**

⚠ **Not persisted to database.** State is local only. Changes are lost on page reload.

| Toggle | Description |
|---|---|
| Email Alerts on Task Assignment | Notified when a task is assigned to the user |
| Email Alerts on Task Overdue | Notified 24h prior to task deadline escalation |
| Browser Desktop Notifications | Real-time browser push notifications |

"Save Preferences" button only writes to the local `AuditLog` Zustand state — no API call made.

**Tab 4 — Security Settings**

Left panel — Change Account Password:

⚠ **Password change does not call a real API endpoint.** The handler only validates fields match, shows a success toast, and logs to local audit state. No `PUT /api/auth/change-password` call is made.

| Field | Validation |
|---|---|
| Current Password | Required |
| New Password | Required; must match Confirm field |
| Confirm New Password | Required; must match New |

Right panel — Active Devices & Sessions:

⚠ **Hardcoded mock data.** Two hardcoded sessions are displayed:
1. "Chrome on macOS" — Active — "Bangalore, India · IP 157.48.22.110"
2. "Safari on iPhone" — "2d ago" — "Mumbai, India · IP 103.24.12.56"

These are static HTML — not fetched from `LoginHistory` table.

---

### 7.15 Profile Page (`(dashboard)/profile/page.tsx`)

**Route:** `/profile`  
**Auth Required:** Yes  
**Permission Guard:** `dashboard:view`

#### Layout
- Left sidebar: Profile card (avatar, name, title, role badge, contact info, skills)
- Right content area: Tabbed content panel

#### Left Sidebar — Profile Card

| Element | Data Source |
|---|---|
| Avatar (96×96) | `displayAvatar` from employee store or `ui-avatars.com` fallback |
| Name | `profileData.employee.fullName` or email |
| Title | `profileData.employee.title` or role name |
| Role badge | `profileData.role.name` |
| Email | `profileData.email` |
| Phone | Employee record or hardcoded fallback `+1 (555) 123-4567` |
| Address | Employee `location` or hardcoded `"123 Tech Lane, San Francisco, CA"` |
| Department | Joined from `departments` store |
| Join date | `profileData.createdAt` |

**Skills card:** Fixed array: `["React", "TypeScript", "Node.js", "PostgreSQL", "System Architecture", "UI/UX"]`  
⚠ **Hardcoded — not pulled from employee data.**

#### Right Panel — Tabs

**Tab 1 — Overview**
- About Me: Employee `bio` field or hardcoded fallback bio text
- Professional Details grid: Employee ID, Direct Manager (hardcoded "Sarah Jenkins"), Department, Account Status

⚠ **"Direct Manager" is hardcoded as "Sarah Jenkins"** — not pulled from any data relationship.

**Tab 2 — Recent Activity**
- Timeline of `auditLogs` entries filtered by the current user's name or ID
- Empty state shown if no matching logs

**Tab 3 — Settings & Security**
- Google Integration panel: Shows connection status (linked/unlinked)
- "Connect with Google" → renders `<GoogleLogin>` button from `@react-oauth/google`
- "Disconnect Account" → `POST /api/google/disconnect`

#### Data Fetching
- `GET /api/me` called on mount (when `isAuthenticated`)
- Response populates `profileData` state
- `employees` and `departments` from Zustand store used to enrich data

---

### 7.16 Roles & Permissions Page (`(dashboard)/settings/roles/page.tsx`)

**Route:** `/settings/roles`  
**Auth Required:** Yes  
**Permission Guard:** `roles:view` (SUPER_ADMIN only)

#### UI Sections
- Role cards list
- Each role card: Role name, description, permission count, list of all associated permissions
- "Edit Permissions" action per role (requires `roles:manage`)
- Permission toggle UI — checkboxes per permission per role
- Changes call `PUT /api/roles/:id/permissions`

---

## 8. LAYOUT SHELL COMPONENTS

### 8.1 `AppLayout.tsx`

**File:** `frontend/src/components/layout/AppLayout.tsx`

The root shell for all authenticated pages. Responsibilities:

- Renders `Sidebar` + `Header` + `{children}` in a two-column flex layout
- Manages sidebar collapsed/expanded state (`isCollapsed`) — persisted in `localStorage`
- Manages mobile sidebar open/close state (`isMobileSidebarOpen`) — controlled by Header hamburger
- Calls `syncOperationalData()` on mount to hydrate Zustand store from API
- Triggers a `refreshSession()` call on initial load to ensure session is current

**Responsive behavior:**
- Mobile (< md): Sidebar is a slide-in overlay (`fixed` positioned) with backdrop
- Desktop (≥ md): Sidebar is a fixed left column; width toggles between expanded (~240px) and collapsed (~64px)

**Theme handling:**
- Applies `dark` class to `<html>` based on `useTheme()` hook
- Transitions: `transition-colors duration-300` applied globally

---

### 8.2 `Sidebar.tsx`

**File:** `frontend/src/components/layout/Sidebar.tsx`

#### Navigation Sections

**Main Section**
| Label | Route | Permission |
|---|---|---|
| Dashboard | `/dashboard` | `dashboard:view` |
| Employees | `/employees` | `employees:view` |
| Tasks | `/tasks` | `tasks:view` |
| Departments | `/departments` | `departments:view` |
| Teams | `/teams` | `teams:view` |
| Projects | `/projects` | `projects:view` |

**System Section**
| Label | Route | Permission |
|---|---|---|
| Reports | `/reports` | `reports:view` |
| Analytics | `/analytics` | `reports:view` |
| Activity Center | `/activity` | `audit_logs:view` |
| Audit Logs | `/audit-logs` | `audit_logs:view` |

**Administration Section**
| Label | Route | Permission |
|---|---|---|
| Roles & Permissions | `/settings/roles` | `roles:view` |
| Organization Settings | `/settings` | `settings:view` |

**Note:** Analytics uses `reports:view` permission as its guard rather than a dedicated `analytics:view` permission. There is also a special override that allows `EMPLOYEE` role users to see the Analytics link regardless of permission.

#### Active State
- Active link detected via `usePathname()` exact match or `startsWith` (for nested routes)
- Active link styled with brand gradient background + white text + right-side accent bar

#### Collapsed Mode
- Icons only — all labels hidden
- Hover tooltip appears on right side of each icon with label text
- Collapse/expand toggle button at bottom

#### User Profile Card (Footer)
- Displays current user's avatar (from `avatarUrl` or `image` field) or initials fallback
- Shows name and role/title
- Click → navigates to `/profile`

#### Logout Button
- `<form action={logoutAction}>` uses Server Action
- Hover state: danger red color scheme
- `aria-label="Sign out"` for accessibility

---

### 8.3 `Header.tsx`

**File:** `frontend/src/components/layout/Header.tsx`

#### Left Side
- **Mobile hamburger button** — triggers `onOpenMobileSidebar` callback; hidden on ≥md
- **Page title** — derived from `usePathname()` segment, localized via translation map

#### Right Side (Controls bar, left-to-right)

| Control | Description |
|---|---|
| Search trigger button | Shows "Search... ⌘K" pill; opens Command Palette modal |
| Quick Action button | "Quick Action" dropdown with "Add Task" and "Add Employee" shortcuts |
| Theme Toggle | `ThemeToggle` component |
| Language Toggle | `LanguageToggle` component |
| Notification Bell | Badge with unread count; click opens notification dropdown |
| User Avatar | Click opens profile dropdown menu |

#### Command Palette (CMD+K Search)

Triggered by:
- Clicking the search trigger button
- `Cmd+K` / `Ctrl+K` keyboard shortcut
- Dismissed by `Escape` key or backdrop click

**When no query (empty state):**
- Recent Searches: persisted in `localStorage` key `etm-recent-searches` (max 5)
- Suggestions: 4 preset quick-navigation cards

**When query entered:**
Real-time client-side search across 5 entity types simultaneously (up to N results each):

| Category | Fields Searched | Max Results |
|---|---|---|
| Tasks | title, id, description | 4 |
| Employees | name, title, employeeCode | 4 |
| Departments | name | 3 |
| Teams | name | 3 |
| Projects | name, description | 3 |

Result rows navigate to the appropriate detail page on click. Search term is added to recent history.

Empty state shown if no results across all categories.

#### Notification Dropdown

- Max height: 64 items scrollable
- Each notification: Icon, title, message (2-line clamp), timestamp (time only)
- Click notification → marks as read + navigates to `/dashboard`
- "Mark All Read" button visible when unread count > 0
- Empty state: AlertCircle icon + "No notifications" text

#### Profile Menu Dropdown

Header section displays:
- Avatar (with green "online" dot)
- Name, job title
- 2×2 grid: Department, Role, Company ("Acme Corp" — hardcoded), Join Date
- Email address

⚠ **Company name "Acme Corp" is hardcoded** — not fetched from organization settings.

Menu links:
- My Profile → `/profile`
- Organization → `/settings?tab=account`
- Activity → `/activity`
- Settings → `/settings`
- Help Center → `/help`

Footer:
- Theme Toggle (duplicate of header one — allows changing from within dropdown)
- Logout button → `router.push("/api/auth/signout")`

---

## 9. SHARED COMPONENT LIBRARY

### `ProtectedRoute`

**File:** `frontend/src/components/rbac/ProtectedRoute.tsx`

- Wraps any page/section requiring a specific permission
- Checks `useAuth().can(permission)`
- Renders `<AccessDeniedState />` if check fails
- Used on every authenticated page

### `AccessDeniedState`

**File:** `frontend/src/components/rbac/AccessDeniedState.tsx`

- Centered lock icon + "Access Restricted" message
- Shown when RBAC check fails

### `Toast` / `useToast`

**File:** `frontend/src/components/common/Toast.tsx`

- React context-based toast notification system
- API: `toast(message, type)` where type is `"success"` | `"error"` | `"warning"` | `"info"`
- Renders in a fixed overlay position

### `ThemeToggle`

**File:** `frontend/src/components/theme/ThemeToggle.tsx`

- Sun/Moon/Monitor icon button
- Cycles through Light → Dark → System
- Preference stored in `localStorage`

### `LanguageToggle`

**File:** `frontend/src/components/language/LanguageToggle.tsx`

- Globe icon button
- Toggles `currentLanguage` between `"en"` and `"ar"` in Zustand store
- Triggers full page RTL/LTR layout switch via `dir` attribute on root element

### Task-Specific Components (all in `components/dashboard/tasks/`)

| Component | Purpose |
|---|---|
| `TaskTable` | Paginated list view with actions |
| `TaskKanban` | Drag-and-drop status columns |
| `TaskCalendar` | Month-view calendar with task pills |
| `TaskDetailDrawer` | Slide-in detail panel |
| `TaskModal` | Create/Edit form modal |
| `TaskFilters` | Full filter control bar |
| `TaskSearchResults` | "Showing X results for Y" feedback |
| `FilterSummary` | Active filter pills with clear buttons |
| `TaskMetricsSegmentedControl` | 4-tab metric summary bar |
| `TaskLoadingState` | Skeleton loading state |
| `TaskErrorState` | Error state with retry button |
| `ConfirmDialog` | Reusable delete confirmation modal |

### Employee-Specific Components (all in `components/dashboard/employees/`)

| Component | Purpose |
|---|---|
| `EmployeeTable` | Tabular employee list |
| `EmployeeCard` | Card grid item |
| `EmployeeDetailDrawer` | Slide-in detail panel |
| `EmployeeModal` | Create/Edit form modal |

---

## 10. BACKEND API ARCHITECTURE

### Entry Point: `backend/src/index.ts`

**Middleware pipeline (in order):**

1. `cors(corsOptions)` — Allows requests from configured origins with credentials
2. `express.json({ limit: "50mb" })` — Parses JSON bodies; generous limit for file metadata
3. `express.urlencoded({ extended: true, limit: "50mb" })` — Form data
4. `cookieParser()` — Cookie parsing middleware
5. `requestLogger` — Custom logger (all requests logged)
6. `express.static("uploads")` — Serves uploaded files from `/uploads` directory
7. `app.use("/api", apiRouter)` — All API routes mounted under `/api` prefix
8. Global error handler — Returns `{ success: false, message, stack }` (stack hidden in production)

**Port:** `process.env.PORT || 5001`

### Middleware: `authenticate` (JWT Verification)

**File:** `backend/src/middleware/auth.middleware.ts`

- Extracts `Authorization: Bearer <token>` from header
- Verifies JWT with `JWT_SECRET`
- Decodes payload into `req.user = { id, email, role, employeeId }`
- Returns 401 if missing or invalid

### Middleware: `requirePermission(module, action)`

**File:** `backend/src/middleware/rbac.middleware.ts`

- Queries `RolePermission` table for the user's role
- Checks if the `module:action` permission exists
- Returns 403 if permission is denied
- Logs permission check to audit log

---

## 11. API ENDPOINT CATALOGUE

**Base URL:** `http://localhost:5001/api`

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | None | Register new user + employee |
| POST | `/auth/login` | None | Email/password login; returns tokens |
| POST | `/auth/logout` | JWT | Log out; write audit entry |
| POST | `/auth/refresh` | None | Exchange refresh token for new access token |
| POST | `/auth/forgot-password` | None | Generate and email OTP |
| POST | `/auth/verify-otp` | None | Validate 6-digit OTP |
| POST | `/auth/reset-password` | None | Reset password using OTP |
| POST | `/auth/resend-otp` | None | Resend OTP (with cooldown) |
| GET | `/auth/verify-email` | None | Verify email via token link |
| GET | `/me` | JWT | Get current user's full profile |

### Employee Endpoints

| Method | Endpoint | Auth | Permission | Description |
|---|---|---|---|---|
| GET | `/employees` | JWT | `employees:view` | List all employees |
| GET | `/employees/:id` | JWT | `employees:view` | Get single employee |
| POST | `/employees` | JWT | `employees:create` | Create employee |
| PUT | `/employees/:id` | JWT | `employees:update` | Update employee |
| DELETE | `/employees/:id` | JWT | `employees:delete` | Soft-delete employee |

### Task Endpoints

| Method | Endpoint | Auth | Permission | Description |
|---|---|---|---|---|
| GET | `/tasks` | JWT | `tasks:view` | List all tasks |
| GET | `/tasks/:id` | JWT | `tasks:view` | Get single task |
| POST | `/tasks` | JWT | `tasks:create` | Create task |
| PUT | `/tasks/:id` | JWT | `tasks:update` | Update task |
| DELETE | `/tasks/:id` | JWT | `tasks:delete` | Soft-delete task |
| POST | `/tasks/:id/assign` | JWT | `tasks:assign` | Assign task to employee |

### Department Endpoints

| Method | Endpoint | Auth | Permission | Description |
|---|---|---|---|---|
| GET | `/departments` | JWT | `departments:view` | List all departments |
| POST | `/departments` | JWT | `departments:create` | Create department |
| PUT | `/departments/:id` | JWT | `departments:update` | Update department |
| DELETE | `/departments/:id` | JWT | `departments:delete` | Delete department |

### Team Endpoints

| Method | Endpoint | Auth | Permission | Description |
|---|---|---|---|---|
| GET | `/teams` | JWT | `teams:view` | List all teams |
| POST | `/teams` | JWT | `teams:create` | Create team |
| PUT | `/teams/:id` | JWT | `teams:update` | Update team |
| DELETE | `/teams/:id` | JWT | `teams:delete` | Delete team |

### Project Endpoints

| Method | Endpoint | Auth | Permission | Description |
|---|---|---|---|---|
| GET | `/projects` | JWT | `projects:view` | List all projects |
| POST | `/projects` | JWT | `projects:create` | Create project |
| PUT | `/projects/:id` | JWT | `projects:update` | Update project |
| DELETE | `/projects/:id` | JWT | `projects:delete` | Delete project |

### Report Endpoints

| Method | Endpoint | Auth | Permission | Description |
|---|---|---|---|---|
| GET | `/reports/employee` | JWT | `reports:view` | Employee performance data |
| GET | `/reports/task` | JWT | `reports:view` | Task completion data |
| GET | `/reports/department` | JWT | `reports:view` | Department productivity data |

### Roles Endpoints

| Method | Endpoint | Auth | Permission | Description |
|---|---|---|---|---|
| GET | `/roles` | JWT | `roles:view` | List all roles |
| PUT | `/roles/:id/permissions` | JWT | `roles:manage` | Update role permissions |

### Notification Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | JWT | List user notifications |
| PUT | `/notifications/:id/read` | JWT | Mark notification as read |
| PUT | `/notifications/read-all` | JWT | Mark all notifications as read |

### Upload Endpoint

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/upload` | JWT | Upload image file; returns URL |

### Google OAuth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/google/connect` | JWT | Link Google ID to existing account |
| POST | `/google/disconnect` | JWT | Unlink Google ID from account |

### Settings Endpoint

| Method | Endpoint | Auth | Permission | Description |
|---|---|---|---|---|
| GET | `/settings` | JWT | `settings:view` | Get organization settings |
| PUT | `/settings` | JWT | `settings:update` | Update organization settings |

---

## 12. DATABASE SCHEMA & DATA MODELS

**ORM:** Prisma  
**Database:** PostgreSQL  
**Schema file:** `backend/prisma/schema.prisma`

### Core Entities

#### User
| Field | Type | Notes |
|---|---|---|
| id | UUID (cuid) | Primary key |
| email | String (unique) | Normalized to lowercase |
| passwordHash | String | bcrypt, 12 rounds |
| roleId | UUID (FK) | References Role |
| departmentId | UUID (FK) | References Department |
| teamId | UUID (FK) | References Team |
| isActive | Boolean | Default: true |
| isEmailVerified | Boolean | Default: false |
| emailVerificationToken | String? | 32-byte hex |
| emailVerificationExpiry | DateTime? | 24h from generation |
| googleId | String? | For OAuth linking |
| failedLoginAttempts | Int | Default: 0 |
| lockedUntil | DateTime? | Set on 5th failed attempt |
| resetPasswordOTPHash | String? | bcrypt hash of OTP |
| resetPasswordOTPExpiry | DateTime? | 10min TTL |
| otpVerifyAttempts | Int | Default: 0 |
| otpResendAttempts | Int | Default: 0 |
| otpResendCooldown | DateTime? | 60s cooldown |
| lastLoginAt | DateTime? | Last successful login |
| lastLoginIP | String? | Client IP |
| lastLoginDevice | String? | User-Agent |
| lastPasswordChange | DateTime? | Tracks password age |
| loginMethod | String? | "credentials" or "google" |
| deletedAt | DateTime? | Soft-delete timestamp |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

#### Employee
| Field | Type | Notes |
|---|---|---|
| id | UUID (cuid) | Primary key |
| userId | UUID (unique FK) | References User (1:1) |
| employeeCode | String (unique) | Format: EMP-YYYY-NNNN |
| fullName | String | Concatenated first + last |
| firstName | String | |
| lastName | String | |
| title | String | Job designation |
| phone | String? | |
| avatarUrl | String? | URL to profile image |
| bio | String? | |
| location | String? | |
| hireDate | DateTime | Default: now |
| departmentId | UUID (FK)? | References Department |
| teamId | UUID (FK)? | References Team |
| isActive | Boolean | Default: true |
| deletedAt | DateTime? | Soft-delete |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

#### Task
| Field | Type | Notes |
|---|---|---|
| id | UUID (cuid) | Primary key |
| title | String | Required |
| description | String | Default: "" |
| status | TaskStatus enum | UNASSIGNED, ASSIGNED, IN_PROGRESS, COMPLETED, OVERDUE, ARCHIVED |
| priority | TaskPriority enum | LOW, MEDIUM, HIGH, ESCALATED |
| assigneeId | UUID (FK)? | References Employee |
| createdById | UUID (FK) | References User |
| departmentId | UUID (FK)? | References Department |
| teamId | UUID (FK)? | References Team |
| projectId | UUID (FK)? | References Project |
| dueDate | DateTime | Required |
| startDate | DateTime? | |
| estimatedHours | Float? | |
| tags | String[] | Array of tag strings |
| isDeleted | Boolean | Default: false (soft-delete flag) |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

#### Department
| Field | Type | Notes |
|---|---|---|
| id | UUID (cuid) | Primary key |
| name | String (unique) | |
| description | String? | |
| managerId | UUID (FK)? | References Employee |
| color | String? | Hex color for UI |
| isActive | Boolean | Default: true |
| createdBy | String | Creator identifier |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

#### Team
| Field | Type | Notes |
|---|---|---|
| id | UUID (cuid) | Primary key |
| name | String | |
| description | String? | |
| departmentId | UUID (FK)? | References Department |
| leadId | UUID (FK)? | References Employee (team lead) |
| isActive | Boolean | Default: true |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

#### Project
| Field | Type | Notes |
|---|---|---|
| id | UUID (cuid) | Primary key |
| name | String | |
| description | String? | |
| status | ProjectStatus enum | ACTIVE, COMPLETED, ON_HOLD, CANCELLED |
| departmentId | UUID (FK)? | References Department |
| teamId | UUID (FK)? | References Team |
| startDate | DateTime? | |
| endDate | DateTime? | |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

#### Role
| Field | Type | Notes |
|---|---|---|
| id | UUID (cuid) | Primary key |
| name | String (unique) | SUPER_ADMIN, ADMIN, MANAGER, TEAM_LEAD, EMPLOYEE, VIEWER |
| description | String? | |
| createdAt | DateTime | Auto-set |

#### Permission
| Field | Type | Notes |
|---|---|---|
| id | UUID (cuid) | Primary key |
| module | String | e.g., "tasks", "employees" |
| action | String | e.g., "view", "create", "delete" |
| description | String? | |

#### RolePermission
- Junction table: `roleId` + `permissionId` (composite unique key)

#### AuditLog
| Field | Type | Notes |
|---|---|---|
| id | UUID (cuid) | Primary key |
| action | AuditAction enum | CREATE, UPDATE, DELETE, LOGIN, LOGOUT, PERMISSION_CHANGE, STATUS_CHANGE |
| entity | AuditEntity enum | USER, EMPLOYEE, TASK, DEPARTMENT, TEAM, PROJECT, ROLE, SETTINGS |
| entityId | String | ID of the affected record |
| entityName | String? | Human-readable entity name |
| details | String | Description of change |
| previousValue | String? | JSON string of pre-change state |
| newValue | String? | JSON string of post-change state |
| performedBy | String | Actor name |
| performedById | String? | Actor user ID |
| ipAddress | String? | Client IP |
| userAgent | String? | Client User-Agent |
| createdAt | DateTime | Auto-set |

#### Session
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID (FK) | References User |
| token | String (unique) | Session token |
| expiresAt | DateTime | Session expiry |
| createdAt | DateTime | Auto-set |

Sessions are cleared on password reset.

#### LoginHistory
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID (FK) | References User |
| ipAddress | String | Client IP |
| userAgent | String | Client User-Agent |
| status | String | "SUCCESS" or "FAILED" |
| createdAt | DateTime | Auto-set |

#### Notification
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID (FK) | Target user |
| title | String | Notification heading |
| message | String | Body text |
| isRead | Boolean | Default: false |
| createdAt | DateTime | Auto-set |

---

## 13. STATE MANAGEMENT

### Zustand Store (`dbStore.ts`)

**File:** `frontend/src/store/dbStore.ts`

The global in-memory store for all operational data. Acts as a client-side cache layer over the REST API.

#### Store Shape

| Key | Type | Purpose |
|---|---|---|
| `currentUser` | `Employee \| null` | Logged-in user's employee record |
| `employees` | `Employee[]` | All employees (fetched on dashboard load) |
| `tasks` | `Task[]` | All tasks |
| `departments` | `Department[]` | All departments |
| `teams` | `Team[]` | All teams |
| `projects` | `Project[]` | All projects |
| `notifications` | `Notification[]` | Current user's notifications |
| `auditLogs` | `AuditLog[]` | System audit trail |
| `currentLanguage` | `"en" \| "ar"` | Active locale |

#### Store Actions (selection)

| Action | Description |
|---|---|
| `syncOperationalData()` | Fires parallel fetches for employees, tasks, departments, teams, projects |
| `setCurrentUser(user)` | Updates the logged-in user reference |
| `updateEmployee(id, data)` | Patches an employee in the employees array |
| `addEmployee(emp)` | Appends to employees array |
| `removeEmployee(id)` | Filters out employee by ID |
| `markNotificationRead(id)` | Sets `isRead = true` for notification |
| `markAllNotificationsRead()` | Sets all notifications to `isRead = true` |
| `setLanguage(lang)` | Updates `currentLanguage` + triggers `dir` attribute change |

#### Data Sync Pattern
- Data is loaded once on `AppLayout` mount via `syncOperationalData()`
- Individual mutations (create/update/delete) update Zustand state immediately for optimistic UI
- A full `fetchTasks()` / `fetchEmployees()` re-sync is triggered after successful mutations

---

## 14. EMAIL NOTIFICATION SYSTEM

**File:** `backend/src/services/email/email.service.ts`

All emails are sent asynchronously with `.catch(console.error)` — failures do not block API responses.

| Email Event | Trigger |
|---|---|
| Welcome Email | On successful account registration |
| Account Created Email | On successful account registration |
| Email Verification Email | On registration; contains verification link token |
| Forgot Password OTP | On `POST /auth/forgot-password` |
| OTP Resend | On `POST /auth/resend-otp` |
| Password Changed Alert | On successful password reset |
| New Login Alert | On every successful login; includes IP + device info |
| Account Locked Email | When `failedLoginAttempts >= 5`; includes IP + lockout duration |

Email service uses SMTP (configuration via environment variables: likely `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).

---

## 15. SECURITY REVIEW

### Implemented Controls

| Control | Status | Notes |
|---|---|---|
| Password hashing | ✅ Implemented | bcrypt, 12 salt rounds |
| JWT token signing | ✅ Implemented | HS256; 8h access, 30d refresh |
| Account lockout | ✅ Implemented | 5 attempts → 15-minute lockout |
| Email verification gate | ✅ Implemented | Login blocked until email verified |
| OTP brute-force protection | ✅ Implemented | 5 verify attempts, 3 resend attempts/hour |
| OTP time-to-live | ✅ Implemented | 10-minute expiry |
| Soft-delete (not hard-delete) | ✅ Implemented | Employee and task records retained |
| RBAC enforcement (backend) | ✅ Implemented | `requirePermission` middleware |
| RBAC enforcement (frontend) | ✅ Implemented | `ProtectedRoute` + sidebar filtering |
| Audit logging | ✅ Implemented | All major mutations logged with IP + UA |
| Login history tracking | ✅ Implemented | `LoginHistory` table populated on each login |
| Security alert emails | ✅ Implemented | Login alerts + lockout emails |
| Session invalidation on password reset | ✅ Implemented | `Session.deleteMany({ userId })` |
| Input validation (backend) | ✅ Implemented | Zod schemas on auth routes |
| File upload endpoint | ⚠️ Partial | No file type/size validation visible in `upload.routes.ts` |

### Security Gaps

| Risk | Severity | Details |
|---|---|---|
| JWT secret fallback | HIGH | `auth.controller.ts` line 18 contains a hardcoded base64 string as fallback if `AUTH_SECRET` env var is not set. This must be removed — any deployment without the env var will use a predictable secret. |
| Password change not implemented | MEDIUM | `Settings > Security > Change Password` shows a success toast but calls no API. Users cannot actually change passwords from the settings page. |
| Notification preferences not persisted | LOW | Settings tab 3 only writes to local Zustand audit state. No backend persistence. |
| Active sessions data hardcoded | LOW | Settings tab 4 shows fabricated device data — not from `LoginHistory`. |
| No CSRF protection tokens | MEDIUM | No CSRF token middleware visible. Relies on same-origin cookie behavior. |
| No rate limiting on non-auth routes | MEDIUM | OTP and login routes have cooldowns, but general API routes (employees, tasks) have no rate limiting. |
| File upload validation | MEDIUM | `/upload` endpoint — no visible MIME type validation or file size cap in route middleware. |
| Input validation gaps | MEDIUM | Zod validation only confirmed on auth routes. Other module controllers should be audited for raw `req.body` access. |
| `eslint-disable` suppression | LOW | Multiple `@typescript-eslint/no-explicit-any` and unused-vars suppressions in `tasks/page.tsx` and `employees/page.tsx` indicate type safety bypass. |

---

## 16. ACCESSIBILITY AUDIT

### Implemented

| Feature | Coverage |
|---|---|
| `aria-label` on icon buttons | Sidebar logout, hamburger, notification bell, user avatar |
| `aria-current="page"` | Active nav links in Sidebar |
| `aria-label` on nav links | All sidebar `<Link>` elements |
| Keyboard navigation | All buttons are `<button>` elements; form inputs are standard HTML |
| Focus styles | `focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary` applied to interactive elements |
| Semantic HTML | `<header>`, `<aside>`, `<nav>`, `<main>`, `<form>` used appropriately |
| `alt` text | Present on all `<img>` elements for avatars |

### Gaps

| Issue | Notes |
|---|---|
| No `role="dialog"` on modals | Task Modal, Confirm Dialog, and Employee Modal lack ARIA dialog roles and focus trap |
| No focus trap in modals | Keyboard users can tab outside open modals |
| Toast notifications | Not announced to screen readers; no `aria-live` region |
| Command Palette | Missing `role="combobox"` or `role="dialog"` |
| Color-only status indicators | Status badges rely solely on color; no icon or text pattern for colorblind users in some areas |
| Skip-to-content link | Not present |
| Heading hierarchy | Multiple pages use `<h1>` for page title but `<h3>` and `<h4>` inside sections without `<h2>` — breaks heading hierarchy |

---

## 17. INTERNATIONALIZATION (i18n)

### Implementation

- **Custom hook:** `useTranslation()` in `frontend/src/hooks/useTranslation.ts`
- **Languages supported:** English (`en`), Arabic (`ar`)
- **Language state:** Stored in Zustand `currentLanguage`
- **RTL support:** `isRtl` boolean from `useTranslation()`; layout switches via `dir` attribute on root element
- **Translation catalog:** Flat key-value objects in `useTranslation.ts` for both `en` and `ar`

### Coverage

| Module | i18n Status |
|---|---|
| Navigation labels | ✅ Full |
| Dashboard KPI labels | ✅ Full |
| Task page titles, buttons | ✅ Full |
| Employee page titles, buttons | ✅ Full |
| Settings page labels | ✅ Full |
| Analytics page | ✅ Full (dedicated `LOCAL_I18N` object in page file) |
| Audit Logs page | ✅ Full |
| Filter summaries | ✅ Full |
| Toast messages | ✅ Full (inline ternary for RTL/LTR variants) |
| Email templates | ❌ English only — no Arabic email templates |
| Error messages (API) | ❌ English only |
| Validation messages (client) | ⚠️ Partial — some hardcoded English strings remain |

---

## 18. PERFORMANCE OBSERVATIONS

| Area | Observation |
|---|---|
| Data loading strategy | Single `syncOperationalData()` call on AppLayout mount fetches all data types in parallel. Efficient but sends 5+ API calls simultaneously on every page load. |
| Client-side filtering | All filtering (tasks, employees, reports) is done client-side on Zustand store data. Suitable for small datasets; may degrade with 1000+ records. |
| Pagination | Task list and Audit Logs implement client-side pagination (10 and 15 items per page). No server-side pagination observed. |
| SVG Charts | All analytics charts are hand-coded SVG. No virtualization — all data points rendered simultaneously. |
| No code splitting | "use client" on most pages means limited server rendering benefits. Large client bundle expected. |
| Image optimization | Profile avatars use Unsplash URLs or custom uploads. No `next/image` component used — no automatic WebP conversion or lazy loading. |
| No skeleton loading | Only the Tasks page and Profile page have loading states. Other pages show blank content during data fetch. |
| `useEffect` dependencies | Several pages use `useEffect` with `eslint-disable react-hooks/exhaustive-deps` — potential stale closure bugs. |

---

## 19. KNOWN ISSUES & TECHNICAL DEBT

| ID | Severity | Location | Issue |
|---|---|---|---|
| BUG-001 | HIGH | `settings/page.tsx` L140–170 | Password change form submits a local success toast only. No backend API call made. Password is NOT changed. |
| BUG-002 | HIGH | `auth.controller.ts` L18 | JWT secret has a hardcoded fallback value. Must be removed from source code. |
| BUG-003 | MEDIUM | `settings/page.tsx` L120–138 | Notification preferences "Save" only logs to local audit state. No API persistence. |
| BUG-004 | MEDIUM | `settings/page.tsx` L533–562 | Active Sessions panel displays hardcoded static IP addresses and device names. |
| BUG-005 | MEDIUM | `profile/page.tsx` L126–128 | Manager name hardcoded as "Sarah Jenkins"; skills array hardcoded. |
| BUG-006 | MEDIUM | `Header.tsx` L400 | Company name hardcoded as "Acme Corp" in profile dropdown. |
| BUG-007 | MEDIUM | `reports/page.tsx` L185–194 | "Operational Efficiency Index" (94.8) and "Mean Deliverable Lead Time" (4.2 days) are hardcoded values. |
| BUG-008 | LOW | `rbac.ts` | `departments:delete` and `teams:delete` permissions not defined. Delete actions will be silently blocked. |
| BUG-009 | LOW | `audit-logs/page.tsx` L198 | Pagination only shows pages 1–5 regardless of total page count. Deep pages unreachable via page buttons. |
| TECH-001 | MEDIUM | Multiple pages | `eslint-disable @typescript-eslint/no-explicit-any` suppresses type safety. Should be resolved with proper types. |
| TECH-002 | MEDIUM | `tasks/page.tsx` L4 | `eslint-disable react-hooks/exhaustive-deps` may cause stale state bugs. |
| TECH-003 | LOW | `profile/page.tsx` L1 | Profile page uses `any` type extensively for API response handling. |

---

## 20. FEATURES NOT YET IMPLEMENTED

| Feature | Location | Status |
|---|---|---|
| Real password change API | Settings > Security tab | UI exists, API not connected |
| Notification preferences persistence | Settings > Notifications tab | UI exists, not saved to DB |
| Active Sessions from real data | Settings > Security tab | Hardcoded mock — `LoginHistory` table exists in DB |
| Organization settings (company name, logo) | Settings → `settings:update` permission | Backend endpoint exists, frontend form not built |
| Help Center page | `/help` link in profile dropdown | Route exists in nav, page not implemented |
| Email templates in Arabic | Backend `EmailService` | All templates English-only |
| Server-side pagination | All list pages | Only client-side pagination implemented |
| Real-time notifications | Notification bell | Currently shows static Zustand array; no WebSocket/SSE |
| Employee direct manager relationship | Employee, Profile | No `managerId` field on Employee model; "Sarah Jenkins" hardcoded |
| Skills management | Profile Skills card | Hardcoded skills array; no DB field |
| Export PDF reports | Reports page | Only CSV export implemented |
| Employee bio/skills fields | DB schema | `bio` field present in schema but no Employee skills table |
| Task comments / activity thread | Task detail drawer | No Task comments model in schema |
| Task attachments | Task model | No file attachment model in schema |
| Task time tracking | Task model | No time log model in schema |
| Recurring tasks | Task model | No recurrence fields in schema |
| Team member management page | Teams | Team lead assignable but no member management UI |
| Password strength meter | Signup / Settings | No visual strength meter on password inputs |
| Two-Factor Authentication (2FA) | Security settings | UI tab not present; no backend implementation |
| Bulk task assignment | Tasks page | No multi-select or bulk actions |
| Export analytics data | Analytics page | No export button on analytics charts |

---

## 21. ENVIRONMENT & CONFIGURATION

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g., `http://localhost:5001/api`) |
| `NEXTAUTH_URL` | Next.js canonical URL (e.g., `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | NextAuth.js session encryption secret |
| `GOOGLE_CLIENT_ID` | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app client secret |

### Backend (`backend/.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default: 5001) |
| `AUTH_SECRET` | JWT signing secret (CRITICAL — must be set) |
| `JWT_SECRET` | Alternate JWT secret variable name |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `FRONTEND_URL` | Frontend URL (for email links, CORS) |

---

## 22. DEPLOYMENT CONSIDERATIONS

### Pre-Deployment Checklist

- [ ] Remove hardcoded JWT fallback secret from `auth.controller.ts` line 18
- [ ] Set `AUTH_SECRET` environment variable to a cryptographically random 64-byte string
- [ ] Configure PostgreSQL production database and run `prisma migrate deploy`
- [ ] Run `prisma db seed` to initialize roles, permissions, and default admin user
- [ ] Configure SMTP credentials for email delivery
- [ ] Set `NEXTAUTH_URL` to the production domain
- [ ] Set `NEXTAUTH_SECRET` to a secure random value
- [ ] Configure Google OAuth redirect URIs for the production domain
- [ ] Set `FRONTEND_URL` in backend env for CORS and email link generation
- [ ] Implement rate limiting middleware on all API routes
- [ ] Add file upload MIME type validation and size limits
- [ ] Verify CORS origins are restricted to known domains only
- [ ] Review `eslint-disable` suppressions and resolve underlying type issues
- [ ] Connect the Settings password change form to a real `PUT /api/auth/change-password` endpoint
- [ ] Implement real Active Sessions display from `LoginHistory` table

### Known Port Conflict
- Backend is forced to port 5001 due to macOS AirPlay Receiver occupying port 5000
- In Linux/Windows production environments, port 5000 can be used if desired by changing the fallback in `index.ts`

### Build Commands
```bash
# Root
npm install

# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build

# DB Migrations
cd backend && npx prisma migrate deploy
cd backend && npx prisma db seed

# Development
cd frontend && npm run dev    # http://localhost:3000
cd backend && npm run dev     # http://localhost:5001
```

---

*End of Document*

**Audit Record Revision History**

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-07-03 | Engineering Audit Team | Initial full audit record generation |
