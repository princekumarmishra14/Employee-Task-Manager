import { useState, useCallback } from "react";
import { Employee } from "@/types/employee.types";
import { EmployeeService } from "@/services/employee.service";
import { useTranslation } from "@/hooks/useTranslation";
import { useDBStore } from "@/store/dbStore";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/config/rbac";
import { EmployeeValidationInput } from "@/validators/employee.schema";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export function useEmployeeCrud({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { currentLanguage } = useTranslation();
  const isRtl = currentLanguage === "ar";
  const { activeRole } = useDBStore();
  const { user: currentUser, refreshSession } = useAuth();

  // Modal / Drawer Open States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployeeForTimeline, setSelectedEmployeeForTimeline] = useState<Employee | null>(null);

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

  const openCreateModal = useCallback(() => {
    setEditingEmployee(null);
    setIsAddModalOpen(true);
  }, []);

  const openEditModal = useCallback((emp: Employee) => {
    setEditingEmployee(emp);
  }, []);

  const closeAll = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingEmployee(null);
  }, []);

  // CRUD Operations
  const handleCreate = useCallback(
    async (formData: EmployeeValidationInput) => {
      try {
        const response = await EmployeeService.createEmployee(formData);
        if (response.success) {
          useDBStore.getState().addEmployee(response.data as any);
          addToast(
            "success",
            isRtl ? "تمت العملية بنجاح" : "Success",
            isRtl ? "تم إضافة الموظف بنجاح." : "Employee profile registered successfully."
          );
          closeAll();
          if (onSuccess) onSuccess();
        } else {
          addToast(
            "error",
            isRtl ? "خطأ في الحفظ" : "Save Failed",
            response.error || (isRtl ? "فشل إضافة الموظف." : "Failed to add employee.")
          );
        }
      } catch (err: any) {
        addToast(
          "error",
          isRtl ? "خطأ في الحفظ" : "Save Failed",
          err.message || (isRtl ? "فشل إضافة الموظف." : "Failed to add employee.")
        );
      }
    },
    [addToast, closeAll, isRtl, onSuccess]
  );

  const handleUpdate = useCallback(
    async (formData: EmployeeValidationInput) => {
      if (!editingEmployee) return;
      try {
        const response = await EmployeeService.updateEmployee(editingEmployee.id, formData);
        if (response.success) {
          useDBStore.getState().updateEmployee(editingEmployee.id, response.data as any);
          
          if (currentUser?.id === editingEmployee.id) {
            await refreshSession();
          }

          addToast(
            "success",
            isRtl ? "تم التعديل بنجاح" : "Success",
            isRtl ? "تم تحديث بيانات الموظف بنجاح." : "Employee profile updated successfully."
          );
          closeAll();
          if (onSuccess) onSuccess();
        } else {
          addToast(
            "error",
            isRtl ? "خطأ في التعديل" : "Update Failed",
            response.error || (isRtl ? "فشل تحديث بيانات الموظف." : "Failed to update employee.")
          );
        }
      } catch (err: any) {
        addToast(
          "error",
          isRtl ? "خطأ في التعديل" : "Update Failed",
          err.message || (isRtl ? "فشل تحديث بيانات الموظف." : "Failed to update employee.")
        );
      }
    },
    [editingEmployee, addToast, closeAll, isRtl, onSuccess, currentUser, refreshSession]
  );

  const handleDeactivate = useCallback(
    async (id: string, name: string) => {
      try {
        const response = await EmployeeService.deactivateEmployee(id);
        if (response.success) {
          addToast(
            "success",
            isRtl ? "تم إلغاء التفعيل" : "Success",
            isRtl ? `تم إلغاء تفعيل حساب ${name} بنجاح.` : `${name} deactivated successfully.`
          );
          if (onSuccess) onSuccess();
        } else {
          addToast(
            "error",
            isRtl ? "خطأ في إلغاء التفعيل" : "Deactivation Failed",
            response.error || (isRtl ? "فشل إلغاء تفعيل الحساب." : "Failed to deactivate employee.")
          );
        }
      } catch (err: any) {
        addToast(
          "error",
          isRtl ? "خطأ في إلغاء التفعيل" : "Deactivation Failed",
          err.message || (isRtl ? "فشل إلغاء تفعيل الحساب." : "Failed to deactivate employee.")
        );
      }
    },
    [addToast, isRtl, onSuccess]
  );

  // CSV Report Generator
  const handleExportCSV = useCallback(
    (dataset: Employee[]) => {
      if (!hasPermission(activeRole, "employees:view")) {
        addToast(
          "error",
          isRtl ? "صلاحيات غير كافية" : "Forbidden",
          isRtl ? "ليس لديك صلاحية لتصدير البيانات." : "You do not have permissions to export data."
        );
        return;
      }

      const headers = ["ID", "Employee Code", "Full Name", "Email", "Phone", "Role", "Job Title", "Department ID", "Team ID", "Active", "Hire Date"];
      const csvRows = [headers.join(",")];

      dataset.forEach((emp) => {
        const row = [
          `"${emp.id}"`,
          `"${emp.employeeCode}"`,
          `"${emp.fullName.replace(/"/g, '""')}"`,
          `"${emp.email}"`,
          `"${emp.phone || ""}"`,
          `"${emp.role}"`,
          `"${emp.title.replace(/"/g, '""')}"`,
          `"${emp.departmentId || ""}"`,
          `"${emp.teamId || ""}"`,
          `"${emp.isActive}"`,
          `"${emp.createdAt}"`,
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `employee_directory_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast(
        "info",
        isRtl ? "تم التصدير" : "Export Completed",
        isRtl ? "تم تصدير سجلات الموظفين بنجاح." : "Employee directory exported successfully."
      );
    },
    [activeRole, addToast, isRtl]
  );

  return {
    isAddModalOpen,
    editingEmployee,
    selectedEmployeeForTimeline,
    setSelectedEmployeeForTimeline,
    toasts,
    removeToast,
    openCreateModal,
    openEditModal,
    closeAll,
    handleCreate,
    handleUpdate,
    handleDeactivate,
    handleExportCSV,
  };
}
