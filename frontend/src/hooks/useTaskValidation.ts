import { useState, useCallback } from "react";
import { taskValidationSchema, TaskValidationInput } from "@/validators/task.schema";
import { formatZodErrors } from "@/utils/taskValidationUtils";

export function useTaskValidation(initialData?: Partial<TaskValidationInput>) {
  const [formData, setFormData] = useState<Partial<TaskValidationInput>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: keyof TaskValidationInput, value: unknown) => {
    setFormData((prev: Partial<TaskValidationInput>) => {
      const updated = { ...prev, [field]: value };
      
      // Run field validation by creating a partial Zod check
      const fieldSchema = taskValidationSchema.pick({ [field]: true } as Record<typeof field, true>);
      const result = fieldSchema.safeParse({ [field]: value });
      
      if (!result.success) {
        const fieldError = result.error.issues[0]?.message || "Invalid field.";
        setErrors((err) => ({ ...err, [field as string]: fieldError }));
      } else {
        setErrors((err) => {
          const next = { ...err };
          delete next[field as string];
          return next;
        });
      }

      return updated;
    });
  }, []);

  const validateForm = useCallback((data: Partial<TaskValidationInput>) => {
    const result = taskValidationSchema.safeParse(data);
    
    if (!result.success) {
      const formatted = formatZodErrors(result.error);
      setErrors(formatted);
      return { isValid: false, data: null };
    }

    setErrors({});
    return { isValid: true, data: result.data };
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    validateField,
    validateForm,
    clearErrors,
  };
}
