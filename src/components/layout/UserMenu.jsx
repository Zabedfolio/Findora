"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownPopover,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@heroui/react";
import {
  LayoutDashboard,
  FileText,
  User as UserIcon,
  Bell,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

/**
 * UserMenu Component:
 * Modern HeroUI Dropdown triggered by an Avatar (user profile image or professional vector cartoon).
 * Provides navigation to Dashboard, My Reports, Profile, Notifications, Admin Panel (conditional),
 * and Logout.
 */
export default function UserMenu({ user: propUser, isAdmin: propIsAdmin, logout: propLogout }) {
  const router = useRouter();
  const auth = useAuth();

  const user = propUser || auth.user;
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : auth.isAdmin;
  const logout = propLogout || auth.logout;

  if (!user) return null;

  // Use uploaded profile image, or fallback to Gemini-generated professional vector cartoon avatar
  const avatarSrc = user.image?.trim() ? user.image : "/default-avatar.png";

  // Derive initials for avatar fallback (e.g., "John Doe" -> "JD")
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = user.name || "Findora Member";
  const displayEmail = user.email || "";
  const initials = getInitials(displayName);

  const handleAction = (key) => {
    switch (key) {
      case "dashboard":
        router.push("/reports");
        break;
      case "my-reports":
        router.push("/reports?filter=my-reports");
        break;
      case "profile":
        router.push("/profile");
        break;
      case "notifications":
        router.push("/notifications");
        break;
      case "admin":
        router.push("/admin");
        break;
      case "logout":
        logout();
        break;
      default:
        break;
    }
  };

  return (
    <Dropdown>
      <DropdownTrigger className="p-0.5 bg-transparent border-0 cursor-pointer rounded-full outline-none focus:outline-none transition-transform hover:scale-105 active:scale-95 group">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar size="sm" className="w-9 h-9 rounded-full ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-[#9ae600] transition-all shadow-xs overflow-hidden">
              <AvatarImage
                src={avatarSrc}
                alt={displayName}
                className="w-full h-full object-cover"
              />
              <AvatarFallback className="bg-slate-900 text-[#9ae600] font-bold text-xs flex items-center justify-center w-full h-full">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isAdmin && (
              <span
                title="Admin Account"
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"
              />
            )}
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors hidden sm:block" />
        </div>
      </DropdownTrigger>

      <DropdownPopover
        placement="bottom-end"
        className="w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
      >
        <DropdownMenu
          aria-label="User navigation menu"
          onAction={handleAction}
          className="focus:outline-none space-y-0.5 text-sm"
        >
          {/* Section: User Info Header */}
          <DropdownSection aria-label="User profile information" className="px-2.5 py-2 mb-1 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Avatar size="sm" className="w-9 h-9 rounded-full shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
                <AvatarImage src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                <AvatarFallback className="bg-slate-900 text-[#9ae600] font-bold text-xs flex items-center justify-center w-full h-full">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-950 dark:text-white truncate">
                    {displayName}
                  </p>
                  {isAdmin && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
                {displayEmail && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {displayEmail}
                  </p>
                )}
              </div>
            </div>
          </DropdownSection>

          {/* Section: Core Navigation Items */}
          <DropdownSection aria-label="Main navigation links" className="space-y-0.5">
            <DropdownItem
              id="dashboard"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-xs sm:text-sm">Dashboard</span>
            </DropdownItem>

            <DropdownItem
              id="my-reports"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-xs sm:text-sm">My Reports</span>
            </DropdownItem>

            <DropdownItem
              id="profile"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
            >
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-xs sm:text-sm">Profile</span>
            </DropdownItem>

            <DropdownItem
              id="notifications"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
            >
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-xs sm:text-sm">Notifications</span>
            </DropdownItem>

            {/* Admin Panel Item (Only if isAdmin) */}
            {isAdmin && (
              <DropdownItem
                id="admin"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors focus:bg-emerald-50 focus:outline-none"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-xs sm:text-sm">Admin Panel</span>
              </DropdownItem>
            )}
          </DropdownSection>

          {/* Section: Logout (Red/Danger) */}
          <DropdownSection aria-label="Account actions" className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
            <DropdownItem
              id="logout"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors focus:bg-rose-50 dark:focus:bg-rose-950/40 focus:outline-none"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="font-semibold text-xs sm:text-sm">Logout</span>
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );
}
