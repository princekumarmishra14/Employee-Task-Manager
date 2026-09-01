import { Task } from "../types/task.types";
import { TaskFilterState } from "../types/taskFilter.types";
import { matchesSearchTerm } from "./taskSearchUtils";

/**
 * Filters and sorts tasks based on TaskFilterState.
 */
export function filterAndSortTasks(tasks: Task[], filters: TaskFilterState): Task[] {
  // 1. Filtering
  const filtered = tasks.filter((task) => {
    // Search Term
    if (!matchesSearchTerm(task, filters.searchTerm)) return false;

    // Status Filter
    if (filters.statusFilter !== "ALL" && task.status !== filters.statusFilter) {
      return false;
    }

    // Priority Filter
    if (filters.priorityFilter !== "ALL" && task.priority !== filters.priorityFilter) {
      return false;
    }

    // Department Filter
    if (filters.departmentFilter !== "ALL" && task.department !== filters.departmentFilter) {
      return false;
    }

    // Team Filter
    if (filters.teamFilter !== "ALL" && task.team !== filters.teamFilter) {
      return false;
    }

    // Assigned Employee Filter
    if (filters.assignedEmployeeFilter !== "ALL") {
      if (!task.assignedTo || task.assignedTo.id !== filters.assignedEmployeeFilter) {
        return false;
      }
    }

    // Date Range Filter
    if (filters.dateRangeFilter) {
      const taskDate = new Date(task.dueDate).getTime();
      const startDate = new Date(filters.dateRangeFilter.start).getTime();
      const endDate = new Date(filters.dateRangeFilter.end).getTime();
      if (taskDate < startDate || taskDate > endDate) {
        return false;
      }
    }

    return true;
  });

  // 2. Sorting
  return filtered.sort((a, b) => {
    let comparison = 0;
    const directionMultiplier = filters.sortDirection === "asc" ? 1 : -1;

    switch (filters.sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "dueDate":
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "priority": {
        const priorityWeight = { LOW: 1, MEDIUM: 2, HIGH: 3, ESCALATED: 4 };
        comparison = (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
        break;
      }
      case "status": {
        const statusWeight = { UNASSIGNED: 1, ASSIGNED: 2, IN_PROGRESS: 3, COMPLETED: 4, OVERDUE: 5, ARCHIVED: 0 };
        comparison = (statusWeight[a.status] || 0) - (statusWeight[b.status] || 0);
        break;
      }
      default:
        comparison = 0;
    }

    return comparison * directionMultiplier;
  });
}
