import { Task } from "../types/task.types";

/**
 * Checks if a task matches the given search term.
 * Searches in task title and assignee name (case-insensitive, trimmed).
 */
export function matchesSearchTerm(task: Task, searchTerm: string): boolean {
  const cleanSearch = searchTerm.trim().toLowerCase();
  if (!cleanSearch) return true;

  const titleMatch = task.title.toLowerCase().includes(cleanSearch);
  const descriptionMatch = task.description ? task.description.toLowerCase().includes(cleanSearch) : false;
  const tagsMatch = task.tags ? task.tags.some(tag => tag.toLowerCase().includes(cleanSearch)) : false;
  const assigneeNameMatch = task.assignedTo
    ? task.assignedTo.name.toLowerCase().includes(cleanSearch)
    : false;
  const assigneeEmailMatch = task.assignedTo
    ? task.assignedTo.email.toLowerCase().includes(cleanSearch)
    : false;

  return titleMatch || descriptionMatch || tagsMatch || assigneeNameMatch || assigneeEmailMatch;
}

/**
 * Filters a list of tasks using a text search term.
 */
export function filterTasksBySearch(tasks: Task[], searchTerm: string): Task[] {
  return tasks.filter((task) => matchesSearchTerm(task, searchTerm));
}
