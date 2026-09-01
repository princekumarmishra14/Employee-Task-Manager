export const en = {
  // Navigation
  navDashboard: "Dashboard",
  navEmployees: "Employees",
  navDepartments: "Departments",
  navTeams: "Teams",
  navProjects: "Projects",
  navTasks: "Tasks",
  navReports: "Reports",
  navAuditLogs: "Audit Logs",
  navActivityCenter: "Activity Center",
  navSettings: "Settings",
  navLogout: "Log Out",
  navLogin: "Log In",

  // Common Actions
  actions: "Actions",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
  save: "Save",
  cancel: "Cancel",
  close: "Close",
  confirm: "Confirm",
  search: "Search...",
  filter: "Filter",
  export: "Export CSV",
  status: "Status",
  priority: "Priority",
  all: "All",
  active: "Active",
  inactive: "Inactive",
  required: "This field is required",
  noData: "No data available",
  back: "Back",
  next: "Next",

  // Header / Topbar
  roleLabel: "Active Role",
  languageLabel: "Language",
  themeLabel: "Theme",
  notifications: "Notifications",
  markAllRead: "Mark all as read",
  noNotifications: "No new notifications",

  // Login
  loginTitle: "Employee Task Manager",
  loginSubtitle: "Sign in to your enterprise account",
  loginButton: "Sign In",
  loginEmailPlaceholder: "Enter your email address",
  loginPasswordPlaceholder: "Enter your password",
  forgotPasswordLink: "Forgot Password?",
  resetPasswordTitle: "Reset Password",
  resetPasswordSubtitle: "Enter your email to receive a reset link",
  resetPasswordButton: "Send Reset Link",

  // Dashboard
  dashTotalEmployees: "Total Employees",
  dashActiveTasks: "Active Tasks",
  dashCompletedTasks: "Completed Tasks",
  dashOverdueTasks: "Overdue Tasks",
  dashTeamPerformance: "Team Performance",
  dashProductivityMetrics: "Productivity Metrics",
  dashActivityFeed: "Activity Feed",
  dashRecentLogs: "Recent Operations Audit",
  dashNoLogs: "No audit logs recorded yet.",
  dashTaskCompletionRate: "Task Completion Rate",

  // Employees Module
  empTitle: "Employees Directory",
  empAddButton: "Add New Employee",
  empEditTitle: "Edit Employee Details",
  empName: "Full Name",
  empEmail: "Email Address",
  empRole: "System Role",
  empJobTitle: "Job Title",
  empDepartment: "Department",
  empTeam: "Team",
  empHireDate: "Hire Date",
  empStatus: "Status",
  empTimeline: "Employee Engagement Timeline",
  empSearchPlaceholder: "Search by name or email...",
  empPerformance: "Performance Score",

  // Tasks Module
  taskTitle: "Task Workspace",
  taskAddButton: "Create Task",
  taskEditTitle: "Edit Task Details",
  taskSubject: "Task Subject",
  taskDescription: "Detailed Description",
  taskPriority: "Priority Level",
  taskStatus: "Task Status",
  taskAssignee: "Assignee",
  taskProject: "Associated Project",
  taskDueDate: "Due Date",
  taskStartDate: "Start Date",
  taskTags: "Tags (comma separated)",
  taskComments: "Comments",
  taskAddCommentPlaceholder: "Write a message...",
  taskAddCommentButton: "Send",
  taskSearchPlaceholder: "Search tasks by title...",
  taskViewList: "List View",
  taskViewKanban: "Kanban Board",
  taskUnassigned: "Unassigned",

  // Priorities
  priorityLow: "Low",
  priorityMedium: "Medium",
  priorityHigh: "High",
  priorityEscalated: "Escalated",

  // Task Statuses
  statusUnassigned: "Unassigned",
  statusAssigned: "Assigned",
  statusInProgress: "In Progress",
  statusCompleted: "Completed",
  statusOverdue: "Overdue",
  statusArchived: "Archived",

  // Departments & Teams Module
  deptTitle: "Departments Structure",
  deptAddButton: "Create Department",
  teamTitle: "Operational Teams",
  teamAddButton: "Create Team",
  projTitle: "Enterprise Projects",
  projAddButton: "Create Project",

  // Audit Logs Module
  auditLogsTitle: "Security & Operations Audit Logs",
  auditLogsSubtitle: "Immutable system activity log",
  auditLogAction: "Action",
  auditLogEntity: "Entity",
  auditLogPerformedBy: "Performed By",
  auditLogDate: "Timestamp",
  auditLogDetails: "Activity Details",

  // Reports Module
  reportsTitle: "Executive Performance Reports",
  reportsSubtitle: "Analytics for organizational workload and efficiency",
  reportsExport: "Export Executive PDF",
  reportsByDept: "Task Completion by Department",
  reportsByPriority: "Distribution by Priority",

  // Settings Module
  settingsTitle: "System Settings",
  settingsSubtitle: "Configure platform behavior and general properties",
  settingsTabGeneral: "General Config",
  settingsTabRoles: "Role Mappings",
  settingsTabAppearance: "Appearance",
  settingsCompanyName: "Company Name",
  settingsSaveBtn: "Save Configurations",

  // RBAC states
  accessDeniedTitle: "Access Denied",
  accessDeniedDesc: "You do not have the required permissions to view this resource. If you believe this is an error, please contact your administrator.",
  accessDeniedBack: "Return to Dashboard",
};

export type TranslationType = typeof en;
