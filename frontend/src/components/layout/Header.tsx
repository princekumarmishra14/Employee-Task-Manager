"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  Menu, 
  Search, 
  Plus, 
  Check, 
  AlertCircle,
  FileText,
  Building2,
  Users,
  FolderKanban,
  History,
  X,
  Sparkles,
  Settings,
  HelpCircle,
  Activity,
  LogOut,
  Building,
  UserCircle
} from "lucide-react";
import { useDBStore } from "@/store/dbStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import LanguageToggle from "../language/LanguageToggle";
import ThemeToggle from "../theme/ThemeToggle";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({ onOpenMobileSidebar }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isRtl } = useTranslation();
  const { user: authUser } = useAuth();
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    employees, 
    currentUser,
    tasks, 
    departments, 
    teams, 
    projects 
  } = useDBStore();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const currentUserProfile = employees.find(e => e.id === authUser?.id || e.email === authUser?.email) || currentUser || authUser;
  const displayImage = (currentUserProfile as any)?.avatarUrl || (currentUserProfile as any)?.image;

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("etm-recent-searches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  const addRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 5);
      localStorage.setItem("etm-recent-searches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("etm-recent-searches");
  };

  // Keyboard shortcut listener for Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Format breadcrumb text
  const getPageName = () => {
    const segment = pathname.split("/").pop();
    if (!segment || segment === "dashboard") return t.navDashboard;
    if (segment === "tasks") return t.navTasks;
    if (segment === "employees") return t.navEmployees;
    if (segment === "departments") return t.navDepartments;
    if (segment === "teams") return t.navTeams;
    if (segment === "projects") return t.navProjects;
    if (segment === "reports") return t.navReports;
    if (segment === "audit-logs") return t.navAuditLogs;
    if (segment === "settings") return t.navSettings;
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  // Perform client-side global searches
  const filteredEmployees = searchQuery.trim() === "" ? [] : employees.filter(
    (emp) => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      emp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 4);

  const filteredTasks = searchQuery.trim() === "" ? [] : tasks.filter(
    (task) => 
      !task.isDeleted && 
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
       task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 4);

  const filteredDepartments = searchQuery.trim() === "" ? [] : departments.filter(
    (dept) => dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const filteredTeams = searchQuery.trim() === "" ? [] : teams.filter(
    (team) => team.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const filteredProjects = searchQuery.trim() === "" ? [] : projects.filter(
    (proj) => 
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      proj.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const handleSearchItemClick = (path: string, term?: string) => {
    const saveTerm = term || searchQuery.trim();
    if (saveTerm) {
      addRecentSearch(saveTerm);
    }
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(path);
  };

  return (
    <header className="relative flex h-16 w-full items-center justify-between border-b border-border-clean bg-bg-primary px-4 shadow-sm sm:px-6 sticky top-0 z-35 transition-colors duration-300">
      
      {/* Left side: Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Toggle Sidebar Menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-clean text-text-secondary hover:bg-bg-tertiary md:hidden focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page Title */}
        <div className="hidden items-center md:flex">
          <span className="text-base font-black tracking-tight text-text-primary font-poppins">
            {getPageName()}
          </span>
        </div>
      </div>

      {/* Right side: Global Actions & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Mock Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="relative flex items-center justify-between w-40 sm:w-48 md:w-56 lg:w-64 rounded-xl border border-border-clean bg-bg-secondary px-3 py-1.5 text-xs text-text-muted hover:border-border-hover transition-all focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>{t.search}...</span>
          </div>
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border-clean bg-bg-primary px-1.5 font-mono text-[10px] font-bold text-text-muted">
            ⌘K
          </kbd>
        </button>

        {/* Quick Actions Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            aria-label="Quick Actions"
            className="flex h-9 px-3.5 items-center justify-center gap-1.5 rounded-xl bg-brand-primary text-white hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20 text-xs font-bold border-0 focus:outline-none active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-white" />
            <span className="hidden sm:inline">{isRtl ? "إجراء سريع" : "Quick Action"}</span>
          </button>
          
          {showQuickActions && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowQuickActions(false)} />
              <div className={`absolute z-50 mt-2 w-48 rounded-xl border border-border-clean bg-bg-primary p-2 shadow-xl ${
                isRtl ? "left-0" : "right-0"
              }`}>
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    router.push("/tasks?action=add");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-text-primary hover:bg-bg-tertiary transition-all"
                >
                  <Plus className="h-3.5 w-3.5 text-brand-primary" />
                  <span>{t.taskAddButton}</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    router.push("/employees?action=add");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-text-primary hover:bg-bg-tertiary transition-all"
                >
                  <Plus className="h-3.5 w-3.5 text-brand-primary" />
                  <span>{t.empAddButton}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <ThemeToggle />
        <LanguageToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border-clean text-text-secondary hover:bg-bg-tertiary focus:outline-none transition-all"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-danger text-[9px] font-bold text-white ring-2 ring-bg-primary">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className={`absolute z-50 mt-2 w-80 rounded-2xl border border-border-clean bg-bg-primary p-2 shadow-xl ${
                isRtl ? "left-0" : "right-0"
              }`}>
                <div className="flex items-center justify-between border-b border-border-clean px-3 pb-2 pt-1">
                  <h4 className="font-bold text-text-primary text-xs tracking-wider uppercase font-poppins">
                    {t.notifications}
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-[10px] font-bold text-brand-primary hover:underline font-poppins"
                    >
                      {t.markAllRead}
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertCircle className="h-6 w-6 text-text-muted" />
                      <p className="mt-2 text-xs font-medium text-text-muted font-poppins">
                        {t.noNotifications}
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          setShowNotifications(false);
                          router.push("/dashboard");
                        }}
                        className={`flex gap-2.5 rounded-xl p-2.5 hover:bg-bg-secondary cursor-pointer transition-all ${
                          !n.isRead ? "bg-brand-muted/40" : ""
                        }`}
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          !n.isRead ? "bg-brand-primary/10 text-brand-primary" : "bg-bg-secondary text-text-muted"
                        }`}>
                          <Check className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text-primary truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-text-secondary line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[9px] text-text-muted mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="User Profile Menu"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-clean hover:ring-2 hover:ring-brand-primary transition-all overflow-hidden focus:outline-none"
          >
            {displayImage ? (
              <img
                src={displayImage}
                alt={currentUserProfile?.name || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-brand-primary/10 flex items-center justify-center text-[10px] font-black text-brand-secondary uppercase">
                {currentUserProfile?.name?.substring(0, 2).toUpperCase() || "U"}
              </div>
            )}
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className={`absolute z-50 mt-2 w-72 rounded-2xl border border-border-clean bg-bg-primary p-3 shadow-xl flex flex-col gap-1 ${
                isRtl ? "left-0" : "right-0"
              }`}>
                {/* Profile Header section */}
                {(() => {
                  const emp = employees.find(e => e.id === authUser?.id || e.email === authUser?.email) || currentUser || authUser;
                  const dept = departments.find(d => d.id === (emp as any)?.departmentId)?.name || "N/A";
                  return (
                    <div className="border-b border-border-clean pb-3 mb-2 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {(emp as any)?.image || (emp as any)?.avatarUrl ? (
                            <img src={(emp as any)?.image || (emp as any)?.avatarUrl} alt={emp?.name || "User"} className="h-10 w-10 rounded-full object-cover border border-border-clean" />
                          ) : (
                            <div className="h-10 w-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-xs font-black text-brand-secondary uppercase">
                              {emp?.name?.substring(0, 2).toUpperCase() || "U"}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-status-success ring-2 ring-bg-primary"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-text-primary truncate">{emp?.name || "User"}</p>
                          <p className="text-xs font-medium text-text-muted truncate">{(emp as any)?.title || "Employee"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-bg-secondary rounded-lg p-2 flex flex-col gap-0.5">
                          <span className="text-[9px] text-text-muted font-bold uppercase">{isRtl ? "القسم" : "Department"}</span>
                          <span className="text-[10px] text-text-primary font-bold truncate">{dept}</span>
                        </div>
                        <div className="bg-bg-secondary rounded-lg p-2 flex flex-col gap-0.5">
                          <span className="text-[9px] text-text-muted font-bold uppercase">{isRtl ? "الدور" : "Role"}</span>
                          <span className="text-[10px] text-brand-primary font-bold truncate">{emp?.role || "USER"}</span>
                        </div>
                        <div className="bg-bg-secondary rounded-lg p-2 flex flex-col gap-0.5">
                          <span className="text-[9px] text-text-muted font-bold uppercase">{isRtl ? "الشركة" : "Company"}</span>
                          <span className="text-[10px] text-text-primary font-bold truncate">Acme Corp</span>
                        </div>
                        <div className="bg-bg-secondary rounded-lg p-2 flex flex-col gap-0.5">
                          <span className="text-[9px] text-text-muted font-bold uppercase">{isRtl ? "تاريخ الانضمام" : "Joined"}</span>
                          <span className="text-[10px] text-text-primary font-bold truncate">{(emp as any)?.createdAt ? new Date((emp as any).createdAt).toLocaleDateString() : "2023-01-01"}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-text-muted mt-1 px-1 truncate">{emp?.email}</p>
                    </div>
                  );
                })()}
                
                {/* Menu items */}
                <div className="space-y-0.5">
                  <Link href="/profile" onClick={() => setShowProfileMenu(false)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-text-primary hover:bg-bg-tertiary transition-all">
                    <UserCircle className="h-4 w-4 text-text-muted" /> <span>{isRtl ? "الملف الشخصي" : "My Profile"}</span>
                  </Link>
                  <Link href="/settings?tab=account" onClick={() => setShowProfileMenu(false)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-text-primary hover:bg-bg-tertiary transition-all">
                    <Building className="h-4 w-4 text-text-muted" /> <span>{isRtl ? "المؤسسة" : "Organization"}</span>
                  </Link>
                  <Link href="/activity" onClick={() => setShowProfileMenu(false)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-text-primary hover:bg-bg-tertiary transition-all">
                    <Activity className="h-4 w-4 text-text-muted" /> <span>{isRtl ? "النشاط" : "Activity"}</span>
                  </Link>
                  <Link href="/settings" onClick={() => setShowProfileMenu(false)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-text-primary hover:bg-bg-tertiary transition-all">
                    <Settings className="h-4 w-4 text-text-muted" /> <span>{isRtl ? "الإعدادات" : "Settings"}</span>
                  </Link>
                  <Link href="/help" onClick={() => setShowProfileMenu(false)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-text-primary hover:bg-bg-tertiary transition-all">
                    <HelpCircle className="h-4 w-4 text-text-muted" /> <span>{isRtl ? "مركز المساعدة" : "Help Center"}</span>
                  </Link>
                </div>
                
                <div className="border-t border-border-clean mt-1 pt-2 flex items-center justify-between">
                  <div className="px-2" onClick={(e) => e.stopPropagation()}>
                    <ThemeToggle />
                  </div>
                  <button onClick={() => { setShowProfileMenu(false); router.push("/api/auth/signout"); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-status-danger hover:bg-status-danger/10 transition-all text-left">
                    <LogOut className="h-4 w-4" /> <span>{isRtl ? "تسجيل الخروج" : "Logout"}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
         {/* CMD+K Global Search Overlay (Command Palette) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm">
          <div 
            className="fixed inset-0" 
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery("");
            }} 
          />
          
          <div className="relative w-full max-w-xl rounded-2xl bg-bg-primary border border-border-clean shadow-2xl overflow-hidden animate-in fade-in duration-200 font-poppins">
            {/* Search Input Box */}
            <div className="flex items-center gap-3 border-b border-border-clean px-4 py-3">
              <Search className="h-5 w-5 text-text-muted shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? "ابحث عن مهام، موظفين، أقسام، مشاريع..." : "Search tasks, employees, departments, projects..."}
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="rounded-lg bg-bg-secondary px-2 py-1 text-[10px] font-bold text-text-secondary hover:bg-bg-tertiary transition-all shrink-0"
              >
                ESC
              </button>
            </div>
 
            {/* Results Grid */}
            <div className="max-h-[28rem] overflow-y-auto p-4 space-y-4">
              {searchQuery.trim() === "" ? (
                <div className="space-y-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black text-text-muted uppercase tracking-wider">
                        <span>{isRtl ? "عمليات البحث الأخيرة" : "Recent Searches"}</span>
                        <button 
                          onClick={clearRecentSearches} 
                          className="hover:text-brand-primary transition-colors cursor-pointer normal-case font-bold"
                        >
                          {isRtl ? "مسح" : "Clear All"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSearchQuery(term)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border-clean bg-bg-secondary px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all cursor-pointer"
                          >
                            <History className="h-3.5 w-3.5 text-text-muted" />
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-brand-secondary" />
                      <span>{isRtl ? "اقتراحات سريعة" : "Search Suggestions"}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { label: isRtl ? "مهامي المفتوحة" : "My Open Tasks", path: "/tasks", desc: isRtl ? "عرض قائمة مهامك الخاصة" : "View your active assignations" },
                        { label: isRtl ? "المهام عالية الأهمية" : "High Priority Work", path: "/tasks?priority=HIGH", desc: isRtl ? "عرض المهام العاجلة" : "Inspect escalated workflows" },
                        { label: isRtl ? "التقارير التنفيذية" : "Executive Reports", path: "/reports", desc: isRtl ? "مؤشرات أداء العمل والإنتاجية" : "Performance and productivity statistics" },
                        { label: isRtl ? "إعدادات المنصة" : "System Settings", path: "/settings", desc: isRtl ? "تعديل الملف والمظهر" : "Manage profile and notification scopes" },
                      ].map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearchItemClick(sug.path, sug.label)}
                          className="flex flex-col text-left p-3 rounded-xl border border-border-clean bg-bg-secondary/40 hover:bg-bg-secondary hover:border-brand-primary/20 transition-all focus:outline-none cursor-pointer"
                        >
                          <span className="text-xs font-bold text-text-primary">{sug.label}</span>
                          <span className="text-[10px] text-text-muted mt-0.5 font-medium leading-tight">{sug.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Tasks Section */}
                  {filteredTasks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        {t.navTasks}
                      </h4>
                      <div className="space-y-1">
                        {filteredTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleSearchItemClick(`/tasks/${task.id}`)}
                            className="flex items-center justify-between rounded-xl p-2.5 hover:bg-bg-secondary cursor-pointer transition-all border border-transparent hover:border-border-clean"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText className="h-4 w-4 text-brand-primary shrink-0" />
                              <span className="text-xs font-bold text-text-primary truncate">
                                {task.title}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-text-muted uppercase shrink-0">
                              {task.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Employees Section */}
                  {filteredEmployees.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        {t.navEmployees}
                      </h4>
                      <div className="space-y-1">
                        {filteredEmployees.map((emp) => (
                          <div
                            key={emp.id}
                            onClick={() => handleSearchItemClick(`/employees/${emp.id}`)}
                            className="flex items-center justify-between rounded-xl p-2.5 hover:bg-bg-secondary cursor-pointer transition-all border border-transparent hover:border-border-clean"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={emp.avatarUrl}
                                alt={emp.name}
                                className="h-6 w-6 rounded-full object-cover shrink-0 border border-border-clean"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-text-primary block truncate">
                                  {emp.name}
                                </span>
                                <span className="text-[9px] text-text-secondary block truncate">
                                  {emp.title}
                                </span>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-brand-primary shrink-0">
                              {emp.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Departments Section */}
                  {filteredDepartments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        {t.navDepartments}
                      </h4>
                      <div className="space-y-1">
                        {filteredDepartments.map((dept) => (
                          <div
                            key={dept.id}
                            onClick={() => handleSearchItemClick(`/departments`)}
                            className="flex items-center justify-between rounded-xl p-2.5 hover:bg-bg-secondary cursor-pointer transition-all border border-transparent hover:border-border-clean"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Building2 className="h-4 w-4 text-brand-primary shrink-0" />
                              <span className="text-xs font-bold text-text-primary truncate">
                                {dept.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-text-muted uppercase shrink-0">
                              {isRtl ? "مؤسسة" : "Dept"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teams Section */}
                  {filteredTeams.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        {t.navTeams}
                      </h4>
                      <div className="space-y-1">
                        {filteredTeams.map((team) => (
                          <div
                            key={team.id}
                            onClick={() => handleSearchItemClick(`/teams`)}
                            className="flex items-center justify-between rounded-xl p-2.5 hover:bg-bg-secondary cursor-pointer transition-all border border-transparent hover:border-border-clean"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Users className="h-4 w-4 text-brand-primary shrink-0" />
                              <span className="text-xs font-bold text-text-primary truncate">
                                {team.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-text-muted uppercase shrink-0">
                              {isRtl ? "فريق" : "Team"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects Section */}
                  {filteredProjects.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        {t.navProjects}
                      </h4>
                      <div className="space-y-1">
                        {filteredProjects.map((proj) => (
                          <div
                            key={proj.id}
                            onClick={() => handleSearchItemClick(`/projects`)}
                            className="flex items-center justify-between rounded-xl p-2.5 hover:bg-bg-secondary cursor-pointer transition-all border border-transparent hover:border-border-clean"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <FolderKanban className="h-4 w-4 text-brand-primary shrink-0" />
                              <span className="text-xs font-bold text-text-primary truncate">
                                {proj.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-text-muted uppercase shrink-0">
                              {isRtl ? "مشروع" : "Project"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results Empty State */}
                  {filteredTasks.length === 0 && 
                   filteredEmployees.length === 0 && 
                   filteredDepartments.length === 0 && 
                   filteredTeams.length === 0 && 
                   filteredProjects.length === 0 && (
                    <div className="py-12 text-center text-xs text-text-muted space-y-2">
                      <AlertCircle className="h-8 w-8 mx-auto text-text-muted opacity-60" />
                      <p className="font-bold">{isRtl ? "لا توجد نتائج تطابق بحثك." : "No records found matching query filter."}</p>
                      <p className="text-[10px] font-medium text-text-muted/80">{isRtl ? "جرب استخدام مصطلحات بحث أخرى أو مراجعة التهجئة." : "Try validating spelling or broadening the term."}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
