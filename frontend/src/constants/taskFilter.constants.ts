import { TaskFilterState, SavedFilter } from "../types/taskFilter.types";

export const DEFAULT_FILTER_STATE: TaskFilterState = {
  searchTerm: "",
  statusFilter: "ALL",
  priorityFilter: "ALL",
  departmentFilter: "ALL",
  teamFilter: "ALL",
  assignedEmployeeFilter: "ALL",
  sortBy: "createdAt",
  sortDirection: "desc",
  dateRangeFilter: null,
};

export const FILTER_STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses", labelAr: "كل الحالات" },
  { value: "UNASSIGNED", label: "Unassigned", labelAr: "غير معينة" },
  { value: "ASSIGNED", label: "Assigned", labelAr: "معينة" },
  { value: "IN_PROGRESS", label: "In Progress", labelAr: "قيد التنفيذ" },
  { value: "COMPLETED", label: "Completed", labelAr: "مكتملة" },
  { value: "OVERDUE", label: "Overdue", labelAr: "متأخرة" },
  { value: "ARCHIVED", label: "Archived", labelAr: "مؤرشفة" },
];

export const FILTER_PRIORITY_OPTIONS = [
  { value: "ALL", label: "All Priorities", labelAr: "كل الأولويات" },
  { value: "LOW", label: "Low", labelAr: "منخفضة" },
  { value: "MEDIUM", label: "Medium", labelAr: "متوسطة" },
  { value: "HIGH", label: "High", labelAr: "عالية" },
  { value: "ESCALATED", label: "Escalated", labelAr: "تصعيدية" },
];

export const FILTER_SORT_OPTIONS = [
  { value: "createdAt", label: "Created Date", labelAr: "تاريخ الإنشاء" },
  { value: "dueDate", label: "Due Date", labelAr: "تاريخ الاستحقاق" },
  { value: "title", label: "Title", labelAr: "العنوان" },
  { value: "priority", label: "Priority", labelAr: "الأولوية" },
  { value: "status", label: "Status", labelAr: "الحالة" },
];

export const SAVED_FILTERS: SavedFilter[] = [
  {
    id: "my-open-tasks",
    name: "My Open Tasks",
    nameAr: "مهامي المفتوحة",
    filters: {
      statusFilter: "IN_PROGRESS",
      sortBy: "dueDate",
      sortDirection: "asc",
    },
  },
  {
    id: "high-priority-tasks",
    name: "High Priority Tasks",
    nameAr: "المهام ذات الأولوية العالية",
    filters: {
      priorityFilter: "HIGH",
      statusFilter: "ALL",
    },
  },
  {
    id: "completed-this-month",
    name: "Completed Recently",
    nameAr: "المكتملة مؤخراً",
    filters: {
      statusFilter: "COMPLETED",
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  },
];
