# Frontend Source Module (frontend/src)

## Purpose
The `frontend/src` directory houses the entire Next.js (App Router) user interface, custom hooks, service wrappers, and global states for the Employee Task Manager dashboard application.

## Responsibilities & Structural Architecture
The frontend layer is divided into specialized directories following enterprise design patterns:
- **`app/`**: Next.js routing views, layouts, and page structures. Employs App Router structure with localized nested routes (`(auth)`, `(dashboard)`, etc.).
- **`components/`**: Reusable presentation widgets (table cells, custom dialog cards, visual charts, custom themes).
- **`hooks/`**: Context state hooks, translation selectors, and event handlers.
- **`lib/`**: Network abstraction helpers (Axios custom instance with JWT interceptors).
- **`services/`**: Class orchestrators making REST calls, parsing return packages, and validating structures.
- **`store/`**: Central client state management (Zustand) with localStorage persistence helpers.

## Directory Contents
- [auth.ts](file:///Users/admin/Documents/Employee%20Task%20Manager%20/frontend/src/auth.ts): NextAuth config for managing session checks.
- [services/](file:///Users/admin/Documents/Employee%20Task%20Manager%20/frontend/src/services): Directory hosting backend REST adapters.
- [hooks/](file:///Users/admin/Documents/Employee%20Task%20Manager%20/frontend/src/hooks): Custom state lifecycle listeners.
- [store/dbStore.ts](file:///Users/admin/Documents/Employee%20Task%20Manager%20/frontend/src/store/dbStore.ts): Zustand central local client store.

## Communication Flow
1. **User Interaction**: User clicks a button or triggers a form on a page or component inside `app/` or `components/`.
2. **Hook Execution**: Components invoke custom hooks in `hooks/` to isolate state modifications from rendering code.
3. **Service API Call**: The hooks trigger service adapters in `services/`.
4. **Axios Dispatch**: Services invoke `apiGet` or `apiPost` through the Axios client (`lib/axios.ts`), which automatically attaches JWT session headers.
5. **UI Rendering**: The response is returned, the state updates, and React re-renders the DOM elements.
