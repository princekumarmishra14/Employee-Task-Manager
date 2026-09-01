/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import {
  UserCircle,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  MapPin,
  Shield,
  Activity,
  Edit,
  Camera,
  Key,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { connectGoogleAccount, disconnectGoogleAccount } from "@/services/googleAuth";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";
import api from "@/lib/axios";
import { useDBStore } from "@/store/dbStore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { isRtl } = useTranslation();
  const { user: authUser, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "settings">("overview");

  const handleConnectGoogle = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential;
    if (!idToken) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await connectGoogleAccount(idToken);
      if (res.success && res.data) {
        setProfileData({ ...profileData, googleId: res.data.googleId });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to link Google account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await disconnectGoogleAccount();
      if (res.success) {
        setProfileData({ ...profileData, googleId: null });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to disconnect Google account");
    } finally {
      setIsLoading(false);
    }
  };

  const { employees, departments, auditLogs } = useDBStore();
  
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("/me");
        if (res.data.success) {
          setProfileData(res.data.data);
        } else {
          setError(res.data.message || "Failed to load profile");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "An error occurred fetching profile");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <ProtectedRoute permission="dashboard:view">
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !profileData) {
    return (
      <ProtectedRoute permission="dashboard:view">
        <div className="rounded-xl border border-status-danger/30 bg-status-danger-bg p-6 text-center text-status-danger">
          <p className="font-bold">{error || "Failed to load profile data."}</p>
        </div>
      </ProtectedRoute>
    );
  }

  // Get employee details prioritizing the store for rich mock data, fallback to API
  const storeEmployee = employees.find(e => e.id === authUser?.id || e.email === authUser?.email);
  const employee = storeEmployee || profileData.employee || profileData;
  const department = departments.find(d => d.id === (employee as any)?.departmentId) || profileData.department;

  // Mock data for missing fields
  const mockDetails = {
    employeeId: profileData.employee?.employeeCode || "EMP-" + (employee?.id?.substring(0, 5).toUpperCase() || "001"),
    phone: (employee as any)?.phone || profileData.employee?.phone || "+1 (555) 123-4567",
    address: (employee as any)?.location || profileData.employee?.location || "123 Tech Lane, San Francisco, CA",
    manager: "Sarah Jenkins",
    bio: (employee as any)?.bio || profileData.employee?.bio || "Passionate software engineer with over 5 years of experience in full-stack web development. Focused on creating scalable, user-centric enterprise applications.",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "System Architecture", "UI/UX"]
  };

  const userActivities = auditLogs?.filter((a: any) => a.performedById === employee?.id || a.performedBy === employee?.name) || [];
  
  const displayName = profileData.employee?.fullName || profileData.email;
  const displayTitle = profileData.employee?.title || profileData.role?.name || "Employee";
  const displayAvatar = profileData.employee?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

  return (
    <ProtectedRoute permission="dashboard:view">
      <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 font-poppins max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-text-primary">
              {isRtl ? "الملف الشخصي" : "My Profile"}
            </h2>
            <p className="text-sm font-medium text-text-muted mt-1">
              {isRtl ? "إدارة معلوماتك الشخصية وإعدادات حسابك" : "Manage your personal information and account settings"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-xl bg-bg-secondary border border-border-clean px-4 py-2 text-xs font-bold text-text-secondary hover:bg-bg-tertiary transition-all">
              <Key className="h-4 w-4" />
              {isRtl ? "تغيير كلمة المرور" : "Change Password"}
            </button>
            <button 
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20"
            >
              <Edit className="h-4 w-4" />
              {isRtl ? "تعديل الملف" : "Edit Profile"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-border-clean bg-bg-primary shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-brand-primary to-brand-tertiary"></div>
              <div className="px-6 pb-6 relative flex flex-col items-center text-center">
                <div 
                  onClick={() => router.push('/settings')}
                  className="relative -mt-12 mb-4 group cursor-pointer"
                  title={isRtl ? "تغيير الصورة الشخصية" : "Change Profile Picture"}
                >
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="h-24 w-24 rounded-full object-cover border-4 border-bg-primary shadow-md bg-bg-secondary"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-status-success ring-4 ring-bg-primary" />
                </div>

                <h3 className="text-xl font-black text-text-primary">{displayName}</h3>
                <p className="text-sm font-bold text-brand-primary mt-0.5">{displayTitle}</p>
                
                <div className="flex items-center gap-2 mt-4 text-xs font-medium text-text-secondary bg-bg-secondary rounded-lg px-3 py-1.5">
                  <Shield className="h-4 w-4 text-brand-secondary" />
                  <span className="uppercase font-bold">{(profileData.role?.name || "EMPLOYEE").replace("_", " ")}</span>
                </div>
              </div>

              <div className="border-t border-border-clean px-6 py-4 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-text-secondary font-medium truncate">{profileData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-text-secondary font-medium truncate">{mockDetails.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-text-secondary font-medium truncate">{mockDetails.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-text-secondary font-medium truncate">{department?.name || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-text-secondary font-medium truncate">
                    Joined {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "2023-01-01"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-clean bg-bg-primary shadow-sm p-6">
              <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
                {isRtl ? "المهارات" : "Skills"}
              </h4>
              <div className="flex flex-wrap gap-2">
                {mockDetails.skills.map(skill => (
                  <span key={skill} className="bg-brand-muted text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-lg text-xs font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border-clean overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "overview" 
                    ? "border-brand-primary text-brand-primary" 
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                <UserCircle className="h-4 w-4" />
                {isRtl ? "نظرة عامة" : "Overview"}
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "activity" 
                    ? "border-brand-primary text-brand-primary" 
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                <Activity className="h-4 w-4" />
                {isRtl ? "النشاط الأخير" : "Recent Activity"}
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "settings" 
                    ? "border-brand-primary text-brand-primary" 
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                <Shield className="h-4 w-4" />
                {isRtl ? "إعدادات الأمان" : "Settings & Security"}
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-bg-primary rounded-2xl border border-border-clean shadow-sm p-6 min-h-[400px]">
              {activeTab === "overview" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  
                  {/* About */}
                  <section>
                    <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">
                      {isRtl ? "نبذة عني" : "About Me"}
                    </h4>
                    <p className="text-sm text-text-secondary leading-relaxed font-medium">
                      {mockDetails.bio}
                    </p>
                  </section>

                  {/* Info Grid */}
                  <section>
                    <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
                      {isRtl ? "التفاصيل المهنية" : "Professional Details"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-bg-secondary rounded-xl p-4 border border-border-clean">
                        <div className="flex items-center gap-2 text-text-muted mb-1">
                          <Briefcase className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase">{isRtl ? "الرقم الوظيفي" : "Employee ID"}</span>
                        </div>
                        <p className="text-sm font-black text-text-primary">{mockDetails.employeeId}</p>
                      </div>
                      <div className="bg-bg-secondary rounded-xl p-4 border border-border-clean">
                        <div className="flex items-center gap-2 text-text-muted mb-1">
                          <UserCircle className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase">{isRtl ? "المدير المباشر" : "Direct Manager"}</span>
                        </div>
                        <p className="text-sm font-black text-text-primary">{mockDetails.manager}</p>
                      </div>
                      <div className="bg-bg-secondary rounded-xl p-4 border border-border-clean">
                        <div className="flex items-center gap-2 text-text-muted mb-1">
                          <Building className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase">{isRtl ? "القسم" : "Department"}</span>
                        </div>
                        <p className="text-sm font-black text-text-primary">{department?.name || "-"}</p>
                      </div>
                      <div className="bg-bg-secondary rounded-xl p-4 border border-border-clean">
                        <div className="flex items-center gap-2 text-text-muted mb-1">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase">{isRtl ? "حالة الحساب" : "Account Status"}</span>
                        </div>
                        <p className="text-sm font-black text-status-success">
                          {profileData.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </section>

                </div>
              )}

              {activeTab === "activity" && (
                <div className="animate-in fade-in duration-300">
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-6">
                    {isRtl ? "سجل النشاطات" : "Activity Timeline"}
                  </h4>
                  {userActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                      <Activity className="h-12 w-12 opacity-20 mb-4" />
                      <p className="text-sm font-bold">{isRtl ? "لا يوجد نشاط مسجل" : "No recent activity found."}</p>
                    </div>
                  ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-clean before:to-transparent">
                      {userActivities.map((activity: any, index: number) => (
                        <div key={activity.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg-primary bg-brand-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-bg-secondary border border-border-clean p-4 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-bold text-text-primary text-xs">{activity.action} - {activity.entity}</h5>
                              <span className="text-[10px] font-bold text-brand-primary bg-brand-muted px-2 py-0.5 rounded-full">
                                {new Date(activity.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-text-secondary leading-relaxed">
                              {activity.details || "Performed an action in the system."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">
                      {isRtl ? "اتصال الحسابات الخارجية" : "Linked Accounts"}
                    </h4>
                    <p className="text-xs font-semibold text-text-secondary leading-relaxed max-w-xl">
                      {isRtl 
                        ? "قم بربط حساب Google الخاص بك لتسجيل الدخول السريع بنقرة واحدة."
                        : "Connect your enterprise Google account to enable secure single sign-on."
                      }
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-border-clean rounded-2xl bg-bg-secondary gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white border border-border-clean flex items-center justify-center shadow-sm">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.76-2.4 3.6l3.68 2.85c2.15-1.98 3.78-4.9 3.78-8.3z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.9l-3.68-2.85c-1.1.75-2.5 1.18-4.25 1.18-3.27 0-6.05-2.2-7.05-5.18H1.272v3.3C3.26 21.6 7.37 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M4.95 14.25a7.17 7.17 0 0 1 0-4.5V6.45H1.272a11.94 11.94 0 0 0 0 11.1l3.678-3.3z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.63 4.6 1.8l3.42-3.42C17.93 1.19 14.89 0 12 0 7.37 0 3.26 2.4 1.272 6.45l3.678 3.3c1-2.98 3.78-5 7.05-5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-black text-text-primary">Google Integration</p>
                        <p className="text-xs font-semibold text-text-muted mt-0.5">
                          {profileData.googleId 
                            ? `Connected (ID: ${profileData.googleId.slice(0, 10)}...)` 
                            : "Disconnected"
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {profileData.googleId ? (
                        <button
                          onClick={handleDisconnectGoogle}
                          disabled={isLoading}
                          className="px-4 py-2 border border-status-danger/40 rounded-xl bg-status-danger-bg/20 hover:bg-status-danger-bg/40 text-status-danger text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          Disconnect Account
                        </button>
                      ) : (
                        <div className="relative">
                          <GoogleLogin
                            onSuccess={handleConnectGoogle}
                            onError={() => setError("Google link failed.")}
                            theme="outline"
                            shape="pill"
                            size="medium"
                            text="signup_with"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
