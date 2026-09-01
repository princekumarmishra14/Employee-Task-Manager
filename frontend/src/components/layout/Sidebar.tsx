"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Building2,
  UsersRound,
  FolderKanban,
  BarChart3,
  ScrollText,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  Calendar,
  DollarSign,
  UserPlus,
  LineChart,
  Bell,
  Lock,
  Plug,
  User,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { logoutAction } from "@/app/actions/auth";
import { useAuth } from "@/hooks/useAuth";
import { Permission } from "@/constants/permissions";
import { useDBStore } from "@/store/dbStore";

interface SidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ── Enterprise Logo ──────────────────────────────────────────────────────────
const EnterpriseLogo = ({ collapsed }: { collapsed: boolean }) => (
  <div className="flex items-center gap-3 min-w-0">
    <div className="relative flex-shrink-0">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md"
        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)" }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="4"   width="8" height="1.8" rx="0.9" fill="white" />
          <rect x="3" y="9.1" width="6" height="1.8" rx="0.9" fill="white" fillOpacity="0.85" />
          <rect x="3" y="14.2" width="8" height="1.8" rx="0.9" fill="white" />
          <path d="M13 7.5L16.5 10L13 12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9"/>
        </svg>
      </div>
      <div className="absolute inset-0 rounded-xl bg-brand-primary/20 blur-md -z-10" />
    </div>
    {!collapsed && (
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-black tracking-tight text-text-primary leading-tight truncate">
          Employee Task Manager
        </span>
        <span className="text-[9px] font-bold text-brand-secondary tracking-widest leading-none uppercase mt-0.5">
          Workforce Operations Platform
        </span>
      </div>
    )}
  </div>
);

// ── Nav Item Definition ───────────────────────────────────────────────────────
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  /** "module:action" permission string — matches the DB permission table */
  permission: Permission;
}

// ── Full navigation catalogue — ordered as requested ─────────────────────────
const MAIN_NAV: NavItem[] = [
  { href: "/dashboard",    label: "Dashboard",         icon: LayoutDashboard, permission: "dashboard:view"   },
  { href: "/employees",    label: "Employees",         icon: Users,           permission: "employees:view"   },
  { href: "/tasks",        label: "Tasks",             icon: CheckSquare,     permission: "tasks:view"       },
  { href: "/departments",  label: "Departments",       icon: Building2,       permission: "departments:view" },
  { href: "/teams",        label: "Teams",             icon: UsersRound,      permission: "teams:view"       },
  { href: "/projects",     label: "Projects",          icon: FolderKanban,    permission: "projects:view"    },
];

const SYSTEM_NAV: NavItem[] = [
  { href: "/reports",      label: "Reports",           icon: BarChart3,       permission: "reports:view"     },
  { href: "/analytics",    label: "Analytics",         icon: LineChart,       permission: "reports:view"     },
  { href: "/activity",     label: "Activity Center",   icon: Activity,        permission: "audit_logs:view"  },
  { href: "/audit-logs",   label: "Audit Logs",        icon: ScrollText,      permission: "audit_logs:view"  },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/settings/roles", label: "Roles & Permissions", icon: Shield,      permission: "roles:view"       },
  { href: "/settings",       label: "Organization Settings",icon: Settings,   permission: "settings:view"    },
];

// ── Sidebar Component ─────────────────────────────────────────────────────────
export default function Sidebar({ onCloseMobile, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { t, isRtl } = useTranslation();
  const { user: authUser, can } = useAuth();
  const { employees, currentUser } = useDBStore();

  const currentUserProfile = employees.find(e => e.id === authUser?.id || e.email === authUser?.email) || currentUser || authUser;
  const displayImage = (currentUserProfile as any)?.avatarUrl || (currentUserProfile as any)?.image;

  const renderNavItem = (item: NavItem) => {
    const isAnalyticsForEmployee = item.href === "/analytics" && authUser?.role === "EMPLOYEE";
    if (!can(item.permission) && !isAnalyticsForEmployee) return null;
    const Icon = item.icon;
    const isActive =
      pathname === item.href ||
      (item.href !== "/dashboard" &&
        item.href !== "/settings" &&
        pathname.startsWith(`${item.href}/`));

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onCloseMobile}
        title={item.label}
        tabIndex={0}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        className={`group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ${
          isCollapsed ? "justify-center" : "gap-3"
        } ${
          isActive
            ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-primary/25"
            : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
        }`}
      >
        {isActive && !isCollapsed && (
          <span
            className={`absolute top-2 bottom-2 w-0.5 rounded-full bg-white/50 ${
              isRtl ? "left-1.5" : "right-1.5"
            }`}
          />
        )}
        <Icon
          className={`h-4.5 w-4.5 shrink-0 transition-transform duration-200 ${
            isActive ? "text-white" : "group-hover:scale-110"
          }`}
        />
        {!isCollapsed && <span className="truncate leading-none">{item.label}</span>}

        {/* Collapsed tooltip */}
        {isCollapsed && (
          <div
            className={`pointer-events-none absolute z-50 invisible scale-95 opacity-0 group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 whitespace-nowrap rounded-lg bg-text-primary px-2.5 py-1.5 text-[11px] font-semibold text-bg-primary shadow-lg ${
              isRtl ? "right-14" : "left-14"
            }`}
          >
            {item.label}
            <span
              className={`absolute top-1/2 -translate-y-1/2 border-4 border-transparent ${
                isRtl ? "right-[-8px] border-l-text-primary" : "left-[-8px] border-r-text-primary"
              }`}
            />
          </div>
        )}
      </Link>
    );
  };

  const renderSection = (items: NavItem[]) => {
    const rendered = items.map(renderNavItem).filter(Boolean);
    return rendered.length > 0 ? rendered : null;
  };

  const mainItems   = renderSection(MAIN_NAV);
  const systemItems = renderSection(SYSTEM_NAV);
  const adminItems  = renderSection(ADMIN_NAV);

  return (
    <aside className="flex h-full w-full flex-col border-r border-border-clean bg-bg-primary text-text-secondary select-none font-poppins relative transition-all duration-300 overflow-hidden">

      {/* Brand Header */}
      <div
        className={`flex h-16 items-center border-b border-border-clean px-4 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        <Link href="/dashboard" onClick={onCloseMobile} className="flex items-center min-w-0">
          <EnterpriseLogo collapsed={isCollapsed} />
        </Link>
        {!isCollapsed && (
          <span className="hidden xl:inline-flex ml-2 flex-shrink-0 items-center rounded-full bg-brand-primary/10 px-1.5 py-0.5 text-[8px] font-black text-brand-secondary border border-brand-primary/20 uppercase tracking-wider">
            PRO
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">

        {/* Main section */}
        {mainItems && (
          <>
            {!isCollapsed && (
              <p className="px-3 pb-1 text-[9px] font-black text-text-muted uppercase tracking-widest">
                {isRtl ? "الرئيسية" : "Main"}
              </p>
            )}
            {mainItems}
          </>
        )}

        {/* System section */}
        {systemItems && (
          <>
            <div className={`pt-3 ${isCollapsed ? "px-2" : "px-0"}`}>
              <div className="border-t border-border-clean/60" />
            </div>
            {!isCollapsed && (
              <p className="px-3 pt-2 pb-1 text-[9px] font-black text-text-muted uppercase tracking-widest">
                {isRtl ? "النظام" : "System"}
              </p>
            )}
            {systemItems}
          </>
        )}

        {/* Admin section — only visible to roles with admin permissions */}
        {adminItems && (
          <>
            <div className={`pt-3 ${isCollapsed ? "px-2" : "px-0"}`}>
              <div className="border-t border-border-clean/60" />
            </div>
            {!isCollapsed && (
              <p className="px-3 pt-2 pb-1 text-[9px] font-black text-text-muted uppercase tracking-widest">
                {isRtl ? "الإدارة" : "Administration"}
              </p>
            )}
            {adminItems}
          </>
        )}
      </nav>

      {/* Footer: User Card + Collapse Toggle */}
      <div className="border-t border-border-clean p-3 space-y-2">

        {/* Collapse Toggle (Desktop) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex w-full items-center justify-center rounded-lg border border-border-clean py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}

        {/* User Card */}
        <Link
          href="/profile"
          onClick={onCloseMobile}
          className={`flex items-center gap-3 rounded-xl p-2 bg-bg-secondary border border-border-clean/60 hover:border-brand-primary/30 hover:bg-bg-tertiary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt={currentUserProfile?.name || ""}
              className="h-8 w-8 rounded-full object-cover border border-border-clean shrink-0 shadow-sm"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-xs font-black text-brand-secondary shrink-0 shadow-sm uppercase">
              {currentUserProfile?.name?.substring(0, 2).toUpperCase() || "U"}
            </div>
          )}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-text-primary leading-tight">
                {currentUserProfile?.name}
              </p>
              <p className="text-[9px] text-text-secondary font-semibold truncate mt-0.5">
                {(currentUserProfile as any)?.title || (typeof currentUserProfile?.role === 'string' ? currentUserProfile.role.replace("_", " ") : (currentUserProfile?.role as any)?.name?.replace("_", " ") || "EMPLOYEE")}
              </p>
            </div>
          )}
        </Link>

        {/* Logout */}
        <form action={logoutAction} className="w-full">
          <button
            id="sidebar-logout-btn"
            type="submit"
            aria-label="Sign out"
            className={`flex items-center gap-2 rounded-xl border border-border-clean py-2 text-xs font-bold transition-all duration-200 hover:bg-status-danger-bg hover:border-status-danger/30 hover:text-status-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-status-danger w-full ${
              isCollapsed ? "justify-center px-2" : "justify-start px-3"
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>{t.navLogout}</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
