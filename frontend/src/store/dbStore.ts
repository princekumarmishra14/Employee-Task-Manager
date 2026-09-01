/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/axios";
import {
  User,
  Department,
  Team,
  Project,
  Comment,
  AuditLog,
  Notification,
  seedDepartments,
  seedTeams,
  seedProjects,
  seedEmployees,
  seedTasks,
  seedComments,
  seedAuditLogs
} from "../data/seedData";
import { Task } from "@/types/task.types";

interface DBState {
  // Config
  currentLanguage: "en" | "ar";
  currentTheme: "light" | "dark" | "system";
  activeRole: User["role"];
  currentUser: User;

  // DB Collections
  departments: Department[];
  teams: Team[];
  projects: Project[];
  employees: User[];
  tasks: Task[];
  comments: Comment[];
  notifications: Notification[];
  auditLogs: AuditLog[];

  // Language Actions
  setLanguage: (lang: "en" | "ar") => void;
  // Theme Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  // Auth Actions
  setActiveRole: (role: User["role"]) => void;
  setCurrentUser: (user: User) => void;

  // Task Actions
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "isDeleted">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Employee Actions
  addEmployee: (employee: Omit<User, "id" | "createdAt" | "isActive">) => void;
  updateEmployee: (id: string, updates: Partial<User>) => void;
  deleteEmployee: (id: string) => void;

  // Department Actions
  addDepartment: (name: string) => Promise<void>;
  updateDepartment: (id: string, updates: { name?: string; description?: string }) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  // Team Actions
  addTeam: (name: string, departmentId: string) => Promise<any>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  // Project Actions
  addProject: (name: string, description: string, departmentId: string, teamId?: string) => Promise<any>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Comment Actions
  addComment: (taskId: string, content: string) => void;
  // Notification Actions
  addNotification: (userId: string, title: string, message: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  syncOperationalData: () => Promise<void>;

  // Reset
  resetData: () => void;
}

export const useDBStore = create<DBState>()(
  persist(
    (set, get) => ({
      currentLanguage: "en",
      currentTheme: "system",
      activeRole: "SUPER_ADMIN",
      currentUser: seedEmployees[0], // Amira Al-Harbi

      departments: seedDepartments,
      teams: seedTeams,
      projects: seedProjects,
      employees: seedEmployees,
      tasks: [],
      comments: seedComments,
      notifications: [],
      auditLogs: seedAuditLogs,

      setLanguage: (lang) => {
        set({ currentLanguage: lang });
        if (typeof document !== "undefined") {
          document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = lang;
        }
      },

      setTheme: (theme) => {
        set({ currentTheme: theme });
        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          
          if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
        }
      },

      setActiveRole: (role) => {
        const matchingUser = get().employees.find(e => e.role === role && e.isActive);
        if (matchingUser) {
          set({ activeRole: role, currentUser: matchingUser });
          // Log role switch
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            action: "PERMISSION_CHANGE",
            entity: "SETTINGS",
            entityId: matchingUser.id,
            details: `Switched active session role to ${role} (Simulated user: ${matchingUser.name})`,
            performedBy: get().currentUser.name,
            createdAt: new Date().toISOString()
          };
          set(state => ({ auditLogs: [log, ...state.auditLogs] }));
        } else {
          // If no matching user, create a temporary user or switch role on current
          const updatedUser = { ...get().currentUser, role };
          set({ activeRole: role, currentUser: updatedUser });
        }
      },

      setCurrentUser: (user) => set({ currentUser: user, activeRole: user.role }),

      addTask: (task) => {
        const id = `task-${Date.now()}`;
        const now = new Date().toISOString();
        const newTask: Task = {
          ...task,
          id,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
          estimatedHours: task.estimatedHours ?? null,
          assignedTo: null,
          department: null,
          team: null,
          isOverdue: false,
        };

        const log: AuditLog = {
          id: `log-${Date.now()}`,
          action: "CREATE",
          entity: "TASK",
          entityId: id,
          details: `Created task '${task.title}' assigned to user '${task.assigneeId || "Unassigned"}'`,
          performedBy: get().currentUser.name,
          createdAt: now
        };

        set(state => ({
          tasks: [newTask, ...state.tasks],
          auditLogs: [log, ...state.auditLogs]
        }));

        // Trigger notification if assigned
        if (task.assigneeId) {
          get().addNotification(
            task.assigneeId,
            "New Task Assigned",
            `You have been assigned the task: ${task.title}`
          );
        }
      },

      updateTask: (id, updates) => {
        const now = new Date().toISOString();
        let oldTask: Task | undefined;
        
        set(state => {
          oldTask = state.tasks.find(t => t.id === id);
          if (!oldTask) return {};

          const updatedTasks = state.tasks.map(t => {
            if (t.id === id) {
              return {
                ...t,
                ...updates,
                updatedAt: now
              };
            }
            return t;
          });

          // Log changes
          const changes: string[] = [];
          const oldValObj: Record<string, unknown> = {};
          const newValObj: Record<string, unknown> = {};
          
          Object.keys(updates).forEach((key) => {
            const k = key as keyof Task;
            if (updates[k] !== undefined && updates[k] !== oldTask![k]) {
              oldValObj[k] = oldTask![k];
              newValObj[k] = updates[k];
              changes.push(`${k} changed from '${oldTask![k]}' to '${updates[k]}'`);
            }
          });

          const log: AuditLog = {
            id: `log-${Date.now()}`,
            action: updates.status && updates.status !== oldTask.status ? "STATUS_CHANGE" : "UPDATE",
            entity: "TASK",
            entityId: id,
            details: `Updated task '${oldTask.title}': ${changes.join(", ") || "General metadata updated"}.`,
            performedBy: get().currentUser.name,
            createdAt: now,
            previousValue: Object.keys(oldValObj).length > 0 ? JSON.stringify(oldValObj) : null,
            newValue: Object.keys(newValObj).length > 0 ? JSON.stringify(newValObj) : null
          };

          return {
            tasks: updatedTasks,
            auditLogs: [log, ...state.auditLogs]
          };
        });

        // Trigger notification if status changed or reassigned
        if (oldTask && updates.assigneeId && updates.assigneeId !== oldTask.assigneeId) {
          get().addNotification(
            updates.assigneeId,
            "Task Reassigned to You",
            `The task "${oldTask.title}" has been reassigned to you.`
          );
        } else if (oldTask && updates.status && updates.status !== oldTask.status && oldTask.assigneeId) {
          get().addNotification(
            oldTask.assigneeId,
            "Task Status Updated",
            `Your task "${oldTask.title}" status is now: ${updates.status}`
          );
        }
      },

      deleteTask: (id) => {
        const now = new Date().toISOString();
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        const log: AuditLog = {
          id: `log-${Date.now()}`,
          action: "DELETE",
          entity: "TASK",
          entityId: id,
          details: `Soft deleted task '${task.title}'`,
          performedBy: get().currentUser.name,
          createdAt: now
        };

        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, isDeleted: true } : t),
          auditLogs: [log, ...state.auditLogs]
        }));
      },

      addEmployee: (employee) => {
        const id = `emp-${Date.now()}`;
        const now = new Date().toISOString();
        const newEmp: User = {
          ...employee,
          id,
          isActive: true,
          createdAt: now
        };

        const log: AuditLog = {
          id: `log-${Date.now()}`,
          action: "CREATE",
          entity: "EMPLOYEE",
          entityId: id,
          details: `Registered new employee '${employee.name}' (${employee.title}) in department '${employee.departmentId || "None"}'`,
          performedBy: get().currentUser.name,
          createdAt: now
        };

        set(state => ({
          employees: [...state.employees, newEmp],
          auditLogs: [log, ...state.auditLogs]
        }));
      },

      updateEmployee: (id, updates) => {
        const now = new Date().toISOString();
        let oldEmp: User | undefined;

        set(state => {
          oldEmp = state.employees.find(e => e.id === id);
          if (!oldEmp) return {};

          const updatedEmployees = state.employees.map(e => {
            if (e.id === id) {
              return {
                ...e,
                ...updates
              };
            }
            return e;
          });

          // Log changes
          const oldValObj: Record<string, unknown> = {};
          const newValObj: Record<string, unknown> = {};
          const changes: string[] = [];
          
          Object.keys(updates).forEach((key) => {
            const k = key as keyof User;
            if (updates[k] !== undefined && updates[k] !== oldEmp![k]) {
              oldValObj[k] = oldEmp![k];
              newValObj[k] = updates[k];
              changes.push(`${k} changed from '${oldEmp![k]}' to '${updates[k]}'`);
            }
          });

          const log: AuditLog = {
            id: `log-${Date.now()}`,
            action: updates.isActive !== undefined && updates.isActive !== oldEmp.isActive ? "STATUS_CHANGE" : "UPDATE",
            entity: "EMPLOYEE",
            entityId: id,
            details: `Updated employee profile for '${oldEmp.name}'. ${changes.join(", ") || "General metadata updated"}.`,
            performedBy: get().currentUser.name,
            createdAt: now,
            previousValue: Object.keys(oldValObj).length > 0 ? JSON.stringify(oldValObj) : null,
            newValue: Object.keys(newValObj).length > 0 ? JSON.stringify(newValObj) : null
          };

          const nextState: Partial<DBState> = {
            employees: updatedEmployees,
            auditLogs: [log, ...state.auditLogs]
          };

          // Keep currentUser in sync if they are editing their own profile
          if (state.currentUser?.id === id) {
            nextState.currentUser = { ...state.currentUser, ...updates };
          }

          return nextState;
        });
      },

      deleteEmployee: (id) => {
        const now = new Date().toISOString();
        const emp = get().employees.find(e => e.id === id);
        if (!emp) return;

        const log: AuditLog = {
          id: `log-${Date.now()}`,
          action: "DELETE",
          entity: "EMPLOYEE",
          entityId: id,
          details: `Soft deleted employee '${emp.name}'`,
          performedBy: get().currentUser.name,
          createdAt: now
        };

        set(state => ({
          employees: state.employees.map(e => e.id === id ? { ...e, isActive: false } : e), // Soft delete
          auditLogs: [log, ...state.auditLogs]
        }));
      },

      addDepartment: async (name) => {
        const now = new Date().toISOString();
        try {
          const dept = await apiPost<any>("/departments", { name });
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            action: "CREATE",
            entity: "DEPARTMENT",
            entityId: dept.id,
            details: `Created department '${name}'`,
            performedBy: get().currentUser?.name || "system",
            createdAt: now
          };
          set(state => ({
            departments: [...state.departments, dept],
            auditLogs: [log, ...state.auditLogs]
          }));
        } catch (e: any) {
          console.error("Failed to add department to PostgreSQL database", e);
          throw e;
        }
      },

      updateDepartment: async (id, updates) => {
        const now = new Date().toISOString();
        try {
          const updated = await apiPatch<any>(`/departments/${id}`, updates);
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            action: "UPDATE",
            entity: "DEPARTMENT",
            entityId: id,
            details: `Updated department '${updated.name}' details`,
            performedBy: get().currentUser?.name || "system",
            createdAt: now
          };
          set(state => ({
            departments: state.departments.map(d => d.id === id ? { ...d, ...updated } : d),
            auditLogs: [log, ...state.auditLogs]
          }));
        } catch (e: any) {
          console.error("Failed to update department in PostgreSQL", e);
          throw e;
        }
      },

      deleteDepartment: async (id) => {
        const now = new Date().toISOString();
        const dept = get().departments.find(d => d.id === id);
        try {
          await apiDelete<any>(`/departments/${id}`);
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            action: "DELETE",
            entity: "DEPARTMENT",
            entityId: id,
            details: `Deleted department '${dept?.name || id}'`,
            performedBy: get().currentUser?.name || "system",
            createdAt: now
          };
          set(state => ({
            departments: state.departments.filter(d => d.id !== id),
            auditLogs: [log, ...state.auditLogs]
          }));
        } catch (e: any) {
          console.error("Failed to delete department from PostgreSQL", e);
          throw e;
        }
      },

      addTeam: async (name, departmentId) => {
        const now = new Date().toISOString();
        try {
          const team = await apiPost<any>("/teams", { name, departmentId });
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            action: "CREATE",
            entity: "TEAM",
            entityId: team.id,
            details: `Created team '${name}' under department ID '${departmentId}'`,
            performedBy: get().currentUser?.name || "system",
            createdAt: now
          };
          set(state => ({
            teams: [...state.teams, team],
            auditLogs: [log, ...state.auditLogs]
          }));
          return team;
        } catch (e: any) {
          console.error("Failed to add team to PostgreSQL database", e);
        }
      },

      addProject: async (name, description, departmentId, teamId) => {
        const now = new Date().toISOString();
        try {
          const project = await apiPost<any>("/projects", { name, description, departmentId, teamId });
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            action: "CREATE",
            entity: "PROJECT",
            entityId: project.id,
            details: `Created project '${name}'`,
            performedBy: get().currentUser?.name || "system",
            createdAt: now
          };
          set(state => ({
            projects: [...state.projects, project],
            auditLogs: [log, ...state.auditLogs]
          }));
          return project;
        } catch (e: any) {
          console.error("Failed to add project to PostgreSQL database", e);
        }
      },

      updateTeam: async (id, updates) => {
        const now = new Date().toISOString();
        try {
          const updated = await apiPatch<any>(`/teams/${id}`, updates);
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            action: "UPDATE",
            entity: "TEAM",
            entityId: id,
            details: `Updated team '${updated.name}' details`,
            performedBy: get().currentUser?.name || "system",
            createdAt: now
          };
          set(state => ({
            teams: state.teams.map(t => t.id === id ? updated : t),
            auditLogs: [log, ...state.auditLogs]
          }));
        } catch (e: any) {
          console.error("Failed to update team in PostgreSQL", e);
        }
      },

      deleteTeam: async (id) => {
        const now = new Date().toISOString();
        try {
          await apiDelete<any>(`/teams/${id}`);
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            action: "DELETE",
            entity: "TEAM",
            entityId: id,
            details: `Deleted team ID '${id}'`,
            performedBy: get().currentUser?.name || "system",
            createdAt: now
          };
          set(state => ({
            teams: state.teams.filter(t => t.id !== id),
            auditLogs: [log, ...state.auditLogs]
          }));
        } catch (e: any) {
          console.error("Failed to delete team from PostgreSQL", e);
        }
      },

      updateProject: async (id, updates) => {
        const now = new Date().toISOString();
        try {
          const updated = await apiPatch<any>(`/projects/${id}`, updates);
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            action: "UPDATE",
            entity: "PROJECT",
            entityId: id,
            details: `Updated project '${updated.name}' details`,
            performedBy: get().currentUser?.name || "system",
            createdAt: now
          };
          set(state => ({
            projects: state.projects.map(p => p.id === id ? updated : p),
            auditLogs: [log, ...state.auditLogs]
          }));
        } catch (e: any) {
          console.error("Failed to update project in PostgreSQL", e);
        }
      },

      deleteProject: async (id) => {
        const now = new Date().toISOString();
        try {
          await apiDelete<any>(`/projects/${id}`);
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            action: "DELETE",
            entity: "PROJECT",
            entityId: id,
            details: `Deleted project ID '${id}'`,
            performedBy: get().currentUser?.name || "system",
            createdAt: now
          };
          set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            auditLogs: [log, ...state.auditLogs]
          }));
        } catch (e: any) {
          console.error("Failed to delete project from PostgreSQL", e);
        }
      },

      syncOperationalData: async () => {
        try {
          const [depts, tms, projs, tasksRaw, logsRaw, employeesRaw] = await Promise.all([
            apiGet<any[]>("/departments").catch(() => []),
            apiGet<any[]>("/teams").catch(() => []),
            apiGet<any[]>("/projects").catch(() => []),
            apiGet<any[]>("/tasks?unpaginated=true").catch(() => []),
            apiGet<any>("/audit-logs?pageSize=100").catch(() => ({ data: [] })),
            apiGet<any[]>("/employees?pageSize=1000").catch(() => [])
          ]);

          const mappedTasks: Task[] = tasksRaw.map((task: any) => {
            const isOverdue = new Date(task.dueDate).getTime() < Date.now() &&
                              task.status !== "COMPLETED" &&
                              task.status !== "ARCHIVED";
            return {
              id: task.id,
              title: task.title,
              description: task.description || "",
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate,
              startDate: task.startDate || task.createdAt,
              createdAt: task.createdAt,
              updatedAt: task.updatedAt || task.createdAt,
              tags: typeof task.tags === "string" ? task.tags.split(",").filter(Boolean) : (Array.isArray(task.tags) ? task.tags : []),
              estimatedHours: task.estimatedHours || null,
              isDeleted: !task.isActive,
              isOverdue,
              assigneeId: task.assigneeId || null,
              departmentId: task.departmentId || null,
              teamId: task.teamId || null,
              projectId: task.projectId || null,
              department: task.departmentId || null,
              team: task.teamId || null,
              assignedTo: task.assignee ? {
                id: task.assignee.id,
                name: task.assignee.employee?.fullName || task.assignee.email,
                email: task.assignee.email,
                avatarUrl: task.assignee.employee?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignee.employee?.fullName || task.assignee.email)}&background=random`
              } : null,
            };
          });

          const mappedEmployees = employeesRaw.map((emp: any) => {
            const name = emp.employee?.fullName || `${emp.employee?.firstName} ${emp.employee?.lastName}`.trim() || emp.email;
            let roleName = "EMPLOYEE";
            if (emp.role) {
              if (typeof emp.role === "string") roleName = emp.role;
              else if (typeof emp.role === "object" && "name" in emp.role) roleName = emp.role.name;
            }
            return {
              id: emp.id,
              employeeCode: emp.employee?.employeeCode || emp.employeeCode || "",
              name: name,
              email: emp.email,
              phone: emp.employee?.phone || null,
              role: roleName as any,
              title: emp.employee?.title || "",
              departmentId: emp.department?.id || emp.departmentId || null,
              teamId: emp.team?.id || emp.teamId || null,
              avatarUrl: emp.employee?.avatarUrl || emp.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
              isActive: emp.employee?.isActive ?? true,
              createdAt: emp.createdAt,
            };
          });

          set({
            departments: depts,
            teams: tms,
            projects: projs,
            tasks: mappedTasks,
            auditLogs: logsRaw?.data || [],
            employees: mappedEmployees
          });
        } catch (e) {
          console.warn("Failed to synchronize lookup metadata from PostgreSQL database", e);
        }
      },

      addComment: (taskId, content) => {
        const id = `comm-${Date.now()}`;
        const newComment: Comment = {
          id,
          taskId,
          authorName: get().currentUser.name,
          content,
          createdAt: new Date().toISOString()
        };
        set(state => ({
          comments: [...state.comments, newComment]
        }));
      },

      addNotification: (userId, title, message) => {
        const id = `notif-${Date.now()}`;
        const newNotif: Notification = {
          id,
          userId,
          title,
          message,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        set(state => ({
          notifications: [newNotif, ...state.notifications]
        }));
      },

      markNotificationRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
        }));
      },

      markAllNotificationsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => n.userId === get().currentUser.id ? { ...n, isRead: true } : n)
        }));
      },

      resetData: () => {
        set({
          departments: seedDepartments,
          teams: seedTeams,
          projects: seedProjects,
          employees: seedEmployees,
          tasks: [],
          comments: seedComments,
          notifications: [],
          auditLogs: seedAuditLogs
        });
      }
    }),
    {
      name: "employee-task-manager-store",
      version: 5, // v5: clear stale seed IDs — real UUIDs are loaded via syncOperationalData
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version < 5) {
          // Reset departments/teams/projects to seeds so syncOperationalData can overwrite
          // with real PostgreSQL UUIDs on next authenticated load.
          return {
            ...state,
            departments: seedDepartments,
            teams: seedTeams,
            projects: seedProjects,
            tasks: [],
            comments: seedComments,
            auditLogs: seedAuditLogs
          };
        }
        return state;
      },
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
        currentTheme: state.currentTheme,
        activeRole: state.activeRole,
        currentUser: state.currentUser,
        departments: state.departments,
        teams: state.teams,
        projects: state.projects,
        employees: state.employees,
        tasks: state.tasks,
        comments: state.comments,
        notifications: state.notifications,
        auditLogs: state.auditLogs
      })
    }
  )
);
