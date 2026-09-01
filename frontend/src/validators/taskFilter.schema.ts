import { z } from "zod";

export const taskFilterValidationSchema = z.object({
  searchTerm: z
    .string()
    .max(100, { message: "Search term cannot exceed 100 characters." })
    .trim()
    .default(""),
  statusFilter: z.enum(["ALL", "UNASSIGNED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "OVERDUE", "ARCHIVED"], {
    message: "Invalid status filter value.",
  }),
  priorityFilter: z.enum(["ALL", "LOW", "MEDIUM", "HIGH", "ESCALATED"], {
    message: "Invalid priority filter value.",
  }),
  departmentFilter: z.string().default("ALL"),
  teamFilter: z.string().default("ALL"),
  assignedEmployeeFilter: z.string().default("ALL"),
  sortBy: z.enum(["title", "dueDate", "priority", "status", "createdAt"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  dateRangeFilter: z
    .object({
      start: z.string().refine((val) => !isNaN(Date.parse(val))),
      end: z.string().refine((val) => !isNaN(Date.parse(val))),
    })
    .nullable()
    .default(null),
});

export type TaskFilterInput = z.infer<typeof taskFilterValidationSchema>;
