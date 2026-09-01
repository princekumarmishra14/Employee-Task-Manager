# Backend Source Module (backend/src)

## Purpose
The `backend/src` directory houses the entire Express-based backend API service for the Employee Task Manager. It is designed to act as a secure, authenticated interface between the frontend application and the PostgreSQL relational database.

## Responsibilities & Structural Architecture
The backend is structured using modular, feature-oriented layers to enforce separation of concerns:
- **`config/`**: Dynamic constants, database clients, mail transporters, and RBAC permission tables.
- **`middlewares/`**: Security guards, JSON Web Token (JWT) decoders, role authentication, and global exception handlers.
- **`routes/`**: Central routing table mapping HTTP verbs and paths to specific middleware chains and controllers.
- **`controllers/`**: Non-modular aggregators (e.g. system stats, departments completion).
- **`modules/`**: Feature-specific domain folders containing their own:
  - **Controllers**: Express handler functions parsing requests, directing calls, and formatting JSON responses.
  - **Repositories**: Isolated data access layers that communicate directly with the database using Prisma ORM.

## Directory Contents
- [index.ts](file:///Users/admin/Documents/Employee%20Task%20Manager%20/backend/src/index.ts): Express entrypoint configuration and server initialization.
- [routes/api.routes.ts](file:///Users/admin/Documents/Employee%20Task%20Manager%20/backend/src/routes/api.routes.ts): Definition of the RESTful API endpoints.
- [middlewares/](file:///Users/admin/Documents/Employee%20Task%20Manager%20/backend/src/middlewares): Folder hosting route auth gates.
- [modules/task/](file:///Users/admin/Documents/Employee%20Task%20Manager%20/backend/src/modules/task): Module for task operations (CRUD, Repository).
- [modules/employee/](file:///Users/admin/Documents/Employee%20Task%20Manager%20/backend/src/modules/employee): Module for employee registry operations (CRUD, Repository).

## Communication Flow
1. **Request Reception**: Incoming requests enter `index.ts` and pass through security/CORS middlewares.
2. **Path Routing**: `routes/api.routes.ts` routes the request through authentication/authorization verification middlewares.
3. **Execution**: The target Controller accepts request params, validates inputs, and triggers the repository queries.
4. **Prisma DB Query**: The Repository reads/writes from PostgreSQL.
5. **Response Dispatch**: The Controller wraps results in type-safe responses and transmits back to the Frontend client.
