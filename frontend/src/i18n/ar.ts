import { TranslationType } from "./en";

export const ar: TranslationType = {
  // Navigation
  navDashboard: "لوحة التحكم",
  navEmployees: "الموظفون",
  navDepartments: "الأقسام",
  navTeams: "الفرق",
  navProjects: "المشاريع",
  navTasks: "المهام",
  navReports: "التقارير",
  navAuditLogs: "سجلات التدقيق",
  navActivityCenter: "مركز الأنشطة",
  navSettings: "الإعدادات",
  navLogout: "تسجيل الخروج",
  navLogin: "تسجيل الدخول",

  // Common Actions
  actions: "الإجراءات",
  add: "إضافة",
  edit: "تعديل",
  delete: "حذف",
  save: "حفظ",
  cancel: "إلغاء",
  close: "إغلاق",
  confirm: "تأكيد",
  search: "بحث...",
  filter: "تصفية",
  export: "تصدير CSV",
  status: "الحالة",
  priority: "الأولوية",
  all: "الكل",
  active: "نشط",
  inactive: "غير نشط",
  required: "هذا الحقل مطلوب",
  noData: "لا توجد بيانات متاحة",
  back: "السابق",
  next: "التالي",

  // Header / Topbar
  roleLabel: "الصلاحية النشطة",
  languageLabel: "اللغة",
  themeLabel: "المظهر",
  notifications: "الإشعارات",
  markAllRead: "تحديد الكل كمقروء",
  noNotifications: "لا توجد إشعارات جديدة",

  // Login
  loginTitle: "نظام إدارة مهام الموظفين",
  loginSubtitle: "تسجيل الدخول إلى حساب الشركة الخاص بك",
  loginButton: "تسجيل الدخول",
  loginEmailPlaceholder: "أدخل عنوان البريد الإلكتروني",
  loginPasswordPlaceholder: "أدخل كلمة المرور",
  forgotPasswordLink: "هل نسيت كلمة المرور؟",
  resetPasswordTitle: "إعادة تعيين كلمة المرور",
  resetPasswordSubtitle: "أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين",
  resetPasswordButton: "إرسال رابط إعادة التعيين",

  // Dashboard
  dashTotalEmployees: "إجمالي الموظفين",
  dashActiveTasks: "المهام النشطة",
  dashCompletedTasks: "المهام المكتملة",
  dashOverdueTasks: "المهام المتأخرة",
  dashTeamPerformance: "أداء الفرق",
  dashProductivityMetrics: "مؤشرات الإنتاجية",
  dashActivityFeed: "نشاط النظام المباشر",
  dashRecentLogs: "تدقيق العمليات الأخيرة",
  dashNoLogs: "لم يتم تسجيل أي عمليات تدقيق بعد.",
  dashTaskCompletionRate: "معدل إنجاز المهام",

  // Employees Module
  empTitle: "دليل الموظفين",
  empAddButton: "إضافة موظف جديد",
  empEditTitle: "تعديل بيانات الموظف",
  empName: "الاسم الكامل",
  empEmail: "البريد الإلكتروني",
  empRole: "دور النظام",
  empJobTitle: "المسمى الوظيفي",
  empDepartment: "القسم",
  empTeam: "الفريق",
  empHireDate: "تاريخ التعيين",
  empStatus: "الحالة",
  empTimeline: "السجل الزمني للموظف",
  empSearchPlaceholder: "البحث بالاسم أو البريد...",
  empPerformance: "تقييم الأداء",

  // Tasks Module
  taskTitle: "مساحة المهام",
  taskAddButton: "إنشاء مهمة",
  taskEditTitle: "تعديل بيانات المهمة",
  taskSubject: "عنوان المهمة",
  taskDescription: "الوصف التفصيلي",
  taskPriority: "مستوى الأولوية",
  taskStatus: "حالة المهمة",
  taskAssignee: "المسؤول عن التنفيذ",
  taskProject: "المشروع المرتبط",
  taskDueDate: "تاريخ الاستحقاق",
  taskStartDate: "تاريخ البدء",
  taskTags: "الوسوم (مفصولة بفاصلة)",
  taskComments: "التعليقات",
  taskAddCommentPlaceholder: "اكتب رسالة...",
  taskAddCommentButton: "إرسال",
  taskSearchPlaceholder: "بحث المهام بالعنوان...",
  taskViewList: "عرض القائمة",
  taskViewKanban: "لوحة كانبان",
  taskUnassigned: "غير معين",

  // Priorities
  priorityLow: "منخفضة",
  priorityMedium: "متوسطة",
  priorityHigh: "عالية",
  priorityEscalated: "تصعيدية",

  // Task Statuses
  statusUnassigned: "غير معينة",
  statusAssigned: "معينة",
  statusInProgress: "قيد التنفيذ",
  statusCompleted: "مكتملة",
  statusOverdue: "متأخرة",
  statusArchived: "مؤرشفة",

  // Departments & Teams Module
  deptTitle: "هيكل الأقسام",
  deptAddButton: "إنشاء قسم",
  teamTitle: "الفرق التشغيلية",
  teamAddButton: "إنشاء فريق",
  projTitle: "مشاريع المؤسسة",
  projAddButton: "إنشاء مشروع",

  // Audit Logs Module
  auditLogsTitle: "سجلات تدقيق الأمان والعمليات",
  auditLogsSubtitle: "سجل غير قابل للتعديل لأنشطة النظام",
  auditLogAction: "العملية",
  auditLogEntity: "نوع الكيان",
  auditLogPerformedBy: "بواسطة",
  auditLogDate: "التوقيت",
  auditLogDetails: "تفاصيل النشاط",

  // Reports Module
  reportsTitle: "تقارير الأداء التنفيذية",
  reportsSubtitle: "تحليلات توزيع أعباء العمل وكفاءة المؤسسة",
  reportsExport: "تصدير التقرير التنفيذي PDF",
  reportsByDept: "إنجاز المهام حسب القسم",
  reportsByPriority: "توزيع المهام حسب الأولوية",

  // Settings Module
  settingsTitle: "إعدادات النظام",
  settingsSubtitle: "تهيئة سلوك المنصة والخصائص العامة للشركة",
  settingsTabGeneral: "الإعدادات العامة",
  settingsTabRoles: "خرائط الصلاحيات",
  settingsTabAppearance: "المظهر",
  settingsCompanyName: "اسم الشركة",
  settingsSaveBtn: "حفظ الإعدادات",

  // RBAC states
  accessDeniedTitle: "تم رفض الوصول",
  accessDeniedDesc: "ليس لديك الصلاحيات الكافية لعرض هذا المورد. إذا كنت تعتقد أن هذه المشكلة ناتجة عن خطأ، يرجى التواصل مع المسؤول المباشر.",
  accessDeniedBack: "العودة للوحة التحكم",
};
