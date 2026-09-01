"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useTranslation } from "@/hooks/useTranslation";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDBStore } from "@/store/dbStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { currentLanguage, isRtl } = useTranslation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { user, status } = useAuth();
  const { setCurrentUser, currentUser, syncOperationalData } = useDBStore();

  // Sync auth user session to Zustand store safely without infinite update loops
  useEffect(() => {
    if (status === "authenticated" && user) {
      if (currentUser?.id !== user.id || currentUser?.role !== user.role) {
        setCurrentUser({
          id: user.id,
          name: user.name || user.email || "User",
          email: user.email || "",
          role: user.role as any,
          departmentId: user.departmentId || null,
          teamId: user.teamId || null,
          isActive: true,
          createdAt: currentUser?.createdAt || new Date().toISOString(),
          avatarUrl: user.image || "",
          title: user.title || "Employee",
          employeeCode: user.employeeCode || "",
          phone: currentUser?.phone || null,
        });
      }
    }
  }, [user, status, currentUser, setCurrentUser]);

  // Synchronize department, team, and project lists on boot
  useEffect(() => {
    if (status === "authenticated") {
      syncOperationalData();
    }
  }, [status, syncOperationalData]);

  // Sync translation dir and sidebar state on mount/language change
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  // Hydration guard — only run once on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      setSidebarCollapsed(stored === "true");
    } else if (typeof window !== "undefined") {
      setSidebarCollapsed(window.innerWidth < 1280);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-secondary dark:bg-bg-primary">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-secondary text-text-primary dark:bg-bg-primary font-poppins">
      {/* Permanent Sidebar (Collapsed or Expanded) */}
      <div className={`hidden md:block flex-shrink-0 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? "w-20" : "w-64"
      }`}>
        <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
      </div>

      {/* Mobile Sidebar (Drawer Overlay) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Sidebar container */}
          <div
            className={`relative flex w-64 max-w-xs flex-1 flex-col bg-bg-primary text-text-primary transition-all duration-300 ${
              isRtl ? "animate-slide-in-right" : "animate-slide-in-left"
            }`}
          >
            {/* Close Button Inside Drawer */}
            <div className="absolute top-2.5 z-10 p-1.5 focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-lg bg-bg-secondary text-text-primary border border-border-clean cursor-pointer shadow-md hover:bg-bg-tertiary transition-all active:scale-95"
              style={{ [isRtl ? "left" : "right"]: "12px" }}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </div>

            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} isCollapsed={false} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        <main className="flex-1 overflow-y-auto bg-bg-secondary px-4 py-6 sm:px-6 md:py-8 font-poppins">
          {children}
        </main>
      </div>
    </div>
  );
}
