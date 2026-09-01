import { useState, useCallback } from "react";
import { Task } from "@/types/task.types";
import { TaskService } from "@/services/task.service";
import { TaskValidationInput } from "@/validators/task.schema";
import { useTranslation } from "@/hooks/useTranslation";
import { useDBStore } from "@/store/dbStore";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export function useTaskCrud({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { currentLanguage } = useTranslation();
  const isRtl = currentLanguage === "ar";
  
  // Dialog Open States
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage["type"], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Modal Openers
  const openCreateModal = useCallback(() => {
    setActiveTask(null);
    setModalMode("create");
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((task: Task) => {
    setActiveTask(task);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const openDeleteConfirm = useCallback((task: Task) => {
    setActiveTask(task);
    setIsDeleteConfirmOpen(true);
  }, []);

  const closeAll = useCallback(() => {
    setIsModalOpen(false);
    setIsDeleteConfirmOpen(false);
    setActiveTask(null);
  }, []);

  // CRUD Operations
  const handleCreate = useCallback(
    async (formData: TaskValidationInput) => {
      try {
        const { employees } = useDBStore.getState();
        const assignee = employees.find((e) => e.id === formData.assigneeId);
        
        const response = await TaskService.createTask({
          title: formData.title,
          description: formData.description || "",
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate,
          startDate: new Date().toISOString(),
          tags: formData.tags || [],
          assigneeId: formData.assigneeId,
          departmentId: assignee?.departmentId || null,
          teamId: assignee?.teamId || null,
          projectId: null,
          estimatedHours: formData.estimatedHours || null,
          assignedTo: assignee
            ? {
                id: assignee.id,
                name: assignee.name,
                email: assignee.email,
                avatarUrl: assignee.avatarUrl,
              }
            : null,
        });

        if (response.success) {
          addToast(
            "success",
            isRtl ? "تمت العملية بنجاح" : "Success",
            isRtl ? "تم إنشاء المهمة بنجاح." : "Task Created Successfully"
          );
          closeAll();
          if (onSuccess) onSuccess();
        } else {
          addToast(
            "error",
            isRtl ? "خطأ في الحفظ" : "Save Failed",
            response.error || (isRtl ? "فشل إنشاء المهمة." : "Failed to save task.")
          );
        }
      } catch (err: unknown) {
        addToast(
          "error",
          isRtl ? "خطأ في الحفظ" : "Save Failed",
          err instanceof Error ? err.message : (isRtl ? "فشل إنشاء المهمة." : "Failed to save task.")
        );
      }
    },
    [addToast, closeAll, isRtl, onSuccess]
  );

  const handleUpdate = useCallback(
    async (formData: TaskValidationInput) => {
      if (!activeTask) return;
      try {
        const { employees } = useDBStore.getState();
        const assignee = employees.find((e) => e.id === formData.assigneeId);

        const response = await TaskService.updateTask(activeTask.id, {
          title: formData.title,
          description: formData.description || "",
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate,
          tags: formData.tags || [],
          assigneeId: formData.assigneeId,
          departmentId: assignee?.departmentId || null,
          teamId: assignee?.teamId || null,
          estimatedHours: formData.estimatedHours || null,
          assignedTo: assignee
            ? {
                id: assignee.id,
                name: assignee.name,
                email: assignee.email,
                avatarUrl: assignee.avatarUrl,
              }
            : null,
        });

        if (response.success) {
          addToast(
            "success",
            isRtl ? "تم التعديل بنجاح" : "Success",
            isRtl ? "تم تحديث المهمة بنجاح." : "Task updated successfully."
          );
          closeAll();
          if (onSuccess) onSuccess();
        } else {
          addToast(
            "error",
            isRtl ? "خطأ في التعديل" : "Update Failed",
            response.error || (isRtl ? "فشل تعديل المهمة." : "Failed to update task.")
          );
        }
      } catch (err: unknown) {
        addToast(
          "error",
          isRtl ? "خطأ في التعديل" : "Update Failed",
          err instanceof Error ? err.message : (isRtl ? "فشل تعديل المهمة." : "Failed to update task.")
        );
      }
    },
    [activeTask, addToast, closeAll, isRtl, onSuccess]
  );

  const handleDelete = useCallback(async () => {
    if (!activeTask) return;
    try {
      const response = await TaskService.deleteTask(activeTask.id);
      if (response.success) {
        addToast(
          "success",
          isRtl ? "تم الحذف بنجاح" : "Success",
          isRtl ? "تم حذف المهمة بنجاح (حذف مؤقت)." : "Task deleted successfully."
        );
        closeAll();
        if (onSuccess) onSuccess();
      } else {
        addToast(
          "error",
          isRtl ? "خطأ في الحذف" : "Delete Failed",
          response.error || (isRtl ? "فشل حذف المهمة." : "Failed to delete task.")
        );
      }
    } catch (err: unknown) {
      addToast(
        "error",
        isRtl ? "خطأ في الحذف" : "Delete Failed",
        err instanceof Error ? err.message : (isRtl ? "فشل حذف المهمة." : "Failed to delete task.")
      );
    }
  }, [activeTask, addToast, closeAll, isRtl, onSuccess]);

  return {
    activeTask,
    isModalOpen,
    modalMode,
    isDeleteConfirmOpen,
    toasts,
    removeToast,
    addToast,
    openCreateModal,
    openEditModal,
    openDeleteConfirm,
    closeAll,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
