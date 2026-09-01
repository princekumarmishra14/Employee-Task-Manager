"use client";

import React, { FormEvent, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useTaskValidation } from "@/hooks/useTaskValidation";
import TaskFormFields from "./TaskFormFields";
import TaskFormFooter from "./TaskFormFooter";
import { taskValidationSchema, TaskValidationInput } from "@/validators/task.schema";

interface TaskFormProps {
  initialData?: Partial<TaskValidationInput> & { [key: string]: unknown };
  onSubmit: (data: TaskValidationInput) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export default function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel,
}: TaskFormProps) {
  const { isRtl } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalize initial data — handle both create and edit modes
  const formattedInitial: Partial<TaskValidationInput> = initialData
    ? {
        title: initialData.title as string ?? "",
        description: initialData.description as string ?? "",
        assigneeId: initialData.assigneeId as string ?? "",
        status: (initialData.status as TaskValidationInput["status"]) ?? "UNASSIGNED",
        priority: (initialData.priority as TaskValidationInput["priority"]) ?? "MEDIUM",
        dueDate: initialData.dueDate as string ?? "",
        department: initialData.department as string ?? null,
        team: initialData.team as string ?? null,
        estimatedHours: initialData.estimatedHours as number ?? null,
        tags: (initialData.tags as string[]) ?? [],
      }
    : {
        title: "",
        description: "",
        assigneeId: "",
        status: "UNASSIGNED",
        priority: "MEDIUM",
        dueDate: "",
        department: null,
        team: null,
        estimatedHours: null,
        tags: [],
      };

  const {
    formData,
    errors,
    validateField,
    validateForm,
  } = useTaskValidation(formattedInitial);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double-submit

    const { isValid, data: parsedData } = validateForm(formData);
    if (!isValid || !parsedData) {
      // Scroll to first error
      const firstError = document.querySelector("[data-field-error]");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.resolve(onSubmit(parsedData));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = React.useCallback((field: keyof TaskValidationInput, value: unknown) => {
    validateField(field, value);
  }, [validateField]);

  const isValid = taskValidationSchema.safeParse(formData).success;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full font-poppins" noValidate>
      <div className="flex-1 px-0.5 py-1">
        {/* All Fields */}
        <TaskFormFields
          formData={formData}
          onChangeField={handleFieldChange}
          errors={errors}
        />
      </div>

      {/* Footer Buttons */}
      <TaskFormFooter
        onCancel={onCancel}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        isDisabled={!isValid}
      />
    </form>
  );
}
