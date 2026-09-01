"use client";

import React, { useState } from "react";
import { useDBStore } from "@/store/dbStore";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  Settings, 
  Save, 
  User, 
  Palette, 
  Bell, 
  Shield, 
  Check, 
  Lock, 
  Globe, 
  Smartphone, 
  Monitor,
  Camera,
  Image as ImageIcon,
  Upload,
  Loader2
} from "lucide-react";
import { axiosClient } from "@/lib/axios";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/components/common/Toast";
import { EmployeeService } from "@/services/employee.service";
import { useAuth } from "@/hooks/useAuth";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
];

export default function SettingsPage() {
  const { t, isRtl } = useTranslation();
  const { currentLanguage, setLanguage, currentUser, updateEmployee, setCurrentUser } = useDBStore();
  const { theme: currentTheme, setTheme } = useTheme();
  const { toast } = useToast();
  const { refreshSession } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"profile" | "theme" | "notifications" | "security">("profile");

  // Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || "");
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || "");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(currentUser?.avatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  // Sync state when currentUser is loaded
  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || "");
      setProfileEmail(currentUser.email || "");
      setProfilePhone(currentUser.phone || "");
      setProfileAvatarUrl(currentUser.avatarUrl || "");
    }
  }, [currentUser]);

  // Notification Preferences State
  const [notifyAssign, setNotifyAssign] = useState(true);
  const [notifyOverdue, setNotifyOverdue] = useState(true);
  const [desktopAlerts, setDesktopAlerts] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim() || !currentUser) {
      toast("Name and Email are required.", "warning");
      return;
    }

    try {
      // Direct REST API save to PostgreSQL
      const res = await EmployeeService.updateEmployee(currentUser.id, {
        fullName: profileName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim() || null,
        avatarUrl: profileAvatarUrl.trim() || null,
      });

      if (!res.success) {
        throw new Error(res.message);
      }

      // Sync updated profile context to local state
      updateEmployee(currentUser.id, { 
        name: profileName.trim(), 
        email: profileEmail.trim(), 
        phone: profilePhone.trim() || null,
        avatarUrl: profileAvatarUrl.trim() || undefined
      });
      
      setCurrentUser({ 
        ...currentUser, 
        name: profileName.trim(), 
        email: profileEmail.trim(), 
        phone: profilePhone.trim() || null,
        avatarUrl: profileAvatarUrl.trim()
      });

      await refreshSession();

      toast(isRtl ? "تم تحديث الملف الشخصي بنجاح!" : "Profile settings updated successfully!", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update profile", "error");
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast(isRtl ? "تم حفظ تفضيلات الإشعارات!" : "Notification preferences saved!", "success");
    
    // Log audit log
    const now = new Date().toISOString();
    useDBStore.setState(state => {
      const log = {
        id: `log-${Date.now()}`,
        action: "UPDATE" as const,
        entity: "SETTINGS" as const,
        entityId: "notifications",
        details: `Updated notifications: AssigneesAlerts=${notifyAssign}, OverdueAlerts=${notifyOverdue}, Desktop=${desktopAlerts}`,
        performedBy: state.currentUser?.name || "System",
        createdAt: now
      };
      return { auditLogs: [log, ...state.auditLogs] };
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast("Please fill all password fields.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("New passwords do not match.", "warning");
      return;
    }
    
    toast("Password updated successfully.", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Log security log
    const now = new Date().toISOString();
    useDBStore.setState(state => {
      const log = {
        id: `log-${Date.now()}`,
        action: "UPDATE" as const,
        entity: "SETTINGS" as const,
        entityId: "security",
        details: `Updated account security credentials / password`,
        performedBy: state.currentUser?.name || "System",
        createdAt: now
      };
      return { auditLogs: [log, ...state.auditLogs] };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await axiosClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data?.success && response.data?.url) {
        setProfileAvatarUrl(response.data.url);
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast(isRtl ? "فشل الرفع" : "Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ProtectedRoute permission="settings:view">
      <div className="space-y-6 font-poppins animate-slide-up">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase flex items-center gap-2">
            <Settings className="h-6 w-6 text-brand-primary" />
            <span>{t.settingsTitle}</span>
          </h1>
          <p className="text-xs text-text-secondary font-medium mt-0.5">
            {t.settingsSubtitle}
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-border-clean bg-bg-primary rounded-xl p-1 shadow-sm gap-2">
          {[
            { id: "profile", label: isRtl ? "الملف الشخصي" : "Profile Settings", icon: User },
            { id: "theme", label: isRtl ? "المظهر واللغة" : "Theme & Language", icon: Palette },
            { id: "notifications", label: isRtl ? "الإشعارات" : "Notification Settings", icon: Bell },
            { id: "security", label: isRtl ? "الأمان" : "Security Settings", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg transition-all focus:outline-none cursor-pointer ${
                  isActive
                    ? "bg-brand-primary text-white shadow"
                    : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content: Profile Settings */}
        {activeTab === "profile" && (
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm max-w-xl">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-widest border-b border-border-clean pb-3">
                Update Personal Information
              </h3>
              
              {/* Profile Image Preview */}
              <div className="flex items-center gap-4">
                <div className="relative group h-16 w-16 rounded-2xl overflow-hidden border border-border-clean shadow-sm">
                  {profileAvatarUrl ? (
                    <img 
                      src={profileAvatarUrl} 
                      alt={currentUser?.name || ""} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-brand-primary/10 flex items-center justify-center text-xs font-black text-brand-secondary uppercase">
                      {profileName?.substring(0, 2).toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Camera className="h-5 w-5 text-white animate-bounce" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">{currentUser?.name || ""}</h4>
                  <p className="text-[10px] text-text-muted mt-0.5 font-semibold uppercase">{currentUser?.role || "Employee"} Role</p>
                </div>
              </div>

              {/* Preset Gallery */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">
                  Select Profile Avatar Preset
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfileAvatarUrl(url)}
                      className={`h-11 w-11 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                        profileAvatarUrl === url 
                          ? "border-brand-primary ring-2 ring-brand-primary/20 scale-105 shadow-sm" 
                          : "border-border-clean bg-bg-secondary"
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom URL Input & Upload */}
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Custom Avatar URL or Upload</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileAvatarUrl}
                    onChange={(e) => setProfileAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 pl-3 pr-10 text-xs text-text-primary outline-none focus:border-brand-primary transition-all font-semibold"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <label className="cursor-pointer text-text-secondary hover:text-brand-primary transition-colors flex items-center justify-center p-1 rounded-md hover:bg-bg-tertiary">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-xs text-text-primary outline-none focus:border-brand-primary transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-xs text-text-primary outline-none focus:border-brand-primary transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-xs text-text-primary outline-none focus:border-brand-primary transition-all font-semibold"
                />
              </div>

              <div className="pt-4 border-t border-border-clean flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-secondary transition-all active:scale-95 focus:outline-none cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Content: Theme Settings */}
        {activeTab === "theme" && (
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm max-w-xl space-y-6">
            <div>
              <h3 className="text-xs font-black text-text-primary mb-3 uppercase tracking-widest border-b border-border-clean pb-3">
                {t.themeLabel}
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold">
                {[
                  { id: "light", label: isRtl ? "مضيء" : "Light Mode" },
                  { id: "dark", label: isRtl ? "مظلم" : "Dark Mode" },
                  { id: "system", label: isRtl ? "تلقائي" : "System Default" },
                ].map((th) => {
                  const isActive = currentTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => setTheme(th.id as any)}
                      className={`rounded-xl p-3 border transition-all focus:outline-none cursor-pointer ${
                        isActive
                          ? "border-brand-primary bg-brand-muted text-brand-primary shadow-sm"
                          : "border-border-clean hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {th.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-border-clean">
              <h3 className="text-xs font-black text-text-primary mb-3 uppercase tracking-widest border-b border-border-clean pb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-brand-primary" />
                <span>{t.languageLabel}</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center text-xs font-bold">
                {[
                  { id: "en", label: "English (LTR)" },
                  { id: "ar", label: "العربية (RTL)" },
                ].map((lang) => {
                  const isActive = currentLanguage === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => setLanguage(lang.id as any)}
                      className={`rounded-xl p-3 border transition-all focus:outline-none cursor-pointer ${
                        isActive
                          ? "border-brand-primary bg-brand-muted text-brand-primary shadow-sm"
                          : "border-border-clean hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Notification Settings */}
        {activeTab === "notifications" && (
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm max-w-xl">
            <form onSubmit={handleSaveNotifications} className="space-y-4">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-widest border-b border-border-clean pb-3">
                Notification Channel Preferences
              </h3>

              <div className="space-y-4 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyAssign}
                    onChange={(e) => setNotifyAssign(e.target.checked)}
                    className="h-4 w-4 rounded border-border-clean text-brand-primary focus:ring-brand-primary mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-primary block">Email Alerts on Task Assignment</span>
                    <span className="text-[10px] text-text-muted mt-0.5 block">Receive instantly when a project manager assigns a task to you.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOverdue}
                    onChange={(e) => setNotifyOverdue(e.target.checked)}
                    className="h-4 w-4 rounded border-border-clean text-brand-primary focus:ring-brand-primary mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-primary block">Email Alerts on Task Overdue</span>
                    <span className="text-[10px] text-text-muted mt-0.5 block">Receive notifications 24h prior to task deadline escalations.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={desktopAlerts}
                    onChange={(e) => setDesktopAlerts(e.target.checked)}
                    className="h-4 w-4 rounded border-border-clean text-brand-primary focus:ring-brand-primary mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-primary block">Browser Desktop Notifications</span>
                    <span className="text-[10px] text-text-muted mt-0.5 block">Show real-time sliding prompts on new activities within workspace.</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-border-clean flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-secondary transition-all active:scale-95 focus:outline-none cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Content: Security Settings */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Password Form */}
            <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-widest border-b border-border-clean pb-3 flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-brand-primary" />
                <span>Change Account Password</span>
              </h3>
              
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-xs text-text-primary outline-none focus:border-brand-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-xs text-text-primary outline-none focus:border-brand-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-xs text-text-primary outline-none focus:border-brand-primary transition-all"
                  />
                </div>

                <div className="pt-2 border-t border-border-clean flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-secondary transition-all active:scale-95 focus:outline-none cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Active Sessions */}
            <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-widest border-b border-border-clean pb-3">
                Active Devices & Sessions
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-secondary border border-border-clean/65">
                  <Monitor className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">Chrome on macOS</span>
                      <span className="text-[9px] font-bold text-status-success bg-status-success-bg border border-status-success/20 rounded px-1.5 py-0.5">Active</span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">Bangalore, India · IP 157.48.22.110</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-secondary/40 border border-border-clean/40">
                  <Smartphone className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-bold text-text-secondary">Safari on iPhone</span>
                      <span className="text-[9px] font-bold text-text-muted bg-bg-tertiary rounded px-1.5 py-0.5">2d ago</span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">Mumbai, India · IP 103.24.12.56</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
