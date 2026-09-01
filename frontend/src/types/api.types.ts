export interface TaskQueryParams {
  search?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}
