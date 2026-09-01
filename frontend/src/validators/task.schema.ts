import { z } from "zod";
import { countWords } from "@/utils/wordHelper";

export const taskValidationSchema = z.object({
  title: z
    .string()
    .transform((val) => val.trim().replace(/\s+/g, " "))
    .refine((val) => val.length >= 3, {
      message: "Task title must contain at least 3 characters.",
    })
    .refine((val) => val.length <= 10, {
      message: "Task title cannot exceed 10 characters.",
    }),

  description: z
    .string()
    .trim()
    .refine((val) => val.length >= 20, { message: "Description must contain at least 20 characters." })
    .refine((val) => val.length <= 60, { message: "Description cannot exceed 60 characters." }),

  assigneeId: z
    .string()
    .min(1, { message: "Please assign an employee." }),

  status: z.enum(
    ["UNASSIGNED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "OVERDUE", "ARCHIVED"],
    { message: "Please select a status." }
  ),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "ESCALATED"], {
    message: "Please select a priority.",
  }),

  dueDate: z
    .string()
    .min(1, { message: "Please select a due date." })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please select a valid due date.",
    })
    .refine(
      (val) => new Date(val) >= new Date(new Date().toDateString()),
      { message: "Due date cannot be in the past." }
    ),

  department: z.string().nullable().optional(),
  team: z.string().nullable().optional(),

  estimatedHours: z
    .number()
    .min(1, { message: "Estimated time must be at least 1 hour." })
    .max(500, { message: "Estimated time cannot exceed 500 hours." })
    .nullable()
    .optional(),

  tags: z.array(z.string()).optional().default([]),
});

export type TaskValidationInput = z.infer<typeof taskValidationSchema>;
