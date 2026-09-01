export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  cancelledTasks: number;
  departmentsCount: number;
  teamsCount: number;
  projectsCount: number;
  completionRate: number;
  productivityScore: number;
}

export const mockDashboardStats: DashboardStats = {
  totalEmployees: 0,
  activeEmployees: 0,
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  inProgressTasks: 0,
  cancelledTasks: 0,
  departmentsCount: 0,
  teamsCount: 0,
  projectsCount: 0,
  completionRate: 0,
  productivityScore: 0,
};
