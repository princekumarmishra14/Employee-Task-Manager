import { z } from "zod";

export const employeeValidationSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters." })
    .max(100, { message: "Employee name cannot exceed 100 characters." })
    .trim(),
  email: z
    .string()
    .min(1, { message: "Email address is required." })
    .email({ message: "Please enter a valid email address." })
    .trim(),
  phone: z
    .string()
    .max(20, { message: "Phone number cannot exceed 20 characters." })
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "VIEWER"], {
    message: "Role must be Super Admin, Admin, Manager, Employee, or Viewer.",
  }),
  title: z
    .string()
    .min(2, { message: "Job title must be at least 2 characters." })
    .max(100, { message: "Job title cannot exceed 100 characters." })
    .trim(),
  departmentId: z.string().nullable().optional().or(z.literal("")),
  teamId: z.string().nullable().optional().or(z.literal("")),
  avatarUrl: z.string().url({ message: "Please enter a valid URL for the avatar." }).optional().or(z.literal("")).nullable(),
  password: z.string().optional().nullable().or(z.literal("")),
  confirmPassword: z.string().optional().nullable().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export type EmployeeValidationInput = z.infer<typeof employeeValidationSchema>;
