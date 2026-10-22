"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

/**
 * Modern UserMenu Component:
 * - Perfectly positioned relative to the avatar trigger (anchored top-right under the navbar).
 * - Premium card design with user profile summary, glowing badge, rich icons, and subtitles.
 * - Auto-closes on outside click or Escape key.
 * - Supports vector cartoon fallback avatar from Gemini when user hasn't uploaded a photo.
 */
export default function UserMenu({ user: propUser, isAdmin: propIsAdmin, logout: propLogout }) {
  const router = useRouter();
  const auth = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const user = propUser || auth.user;
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : auth.isAdmin;
  const logout = propLogout || auth.logout;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  // Use uploaded profile image, or fallback to Gemini-generated professional vector cartoon avatar
  const avatarSrc = user.image?.trim() ? user.image : "/default-avatar.png";

  // Derive initials for avatar fallback (e.g., "Zabed Mahmud" -> "ZM")
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = user.name || "Findora Member";
  const displayEmail = user.email || "";
  const initials = getInitials(displayName);

  const handleNavigate = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    if (logout) {
      await logout();
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open user profile menu"
        className="flex items-center gap-2 p-1 rounded-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9ae600] group"
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-[#9ae600]/60 transition-all">
          <img
            src={avatarSrc}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If user's custom image fails to load, gracefully fall back to Gemini default vector avatar
              e.currentTarget.src = "/default-avatar.png";
            }}
          />
          {/* Active Status Badge */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#9ae600] border-2 border-white dark:border-slate-900" />
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-transform duration-200 mr-1 hidden sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Menu (Anchored directly under Avatar on the Right) */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2.5 w-76 sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-50 origin-top-right transition-all animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Top Profile Card Summary */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 via-slate-50/80 to-slate-100/60 dark:from-slate-850 dark:via-slate-850/80 dark:to-slate-800/60 border border-slate-200/60 dark:border-slate-750 mb-1.5">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-700 shadow-xs shrink-0">
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-950 dark:text-white truncate font-heading">
                    {displayName}
                  </p>
                </div>
                {displayEmail && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {displayEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-1 space-y-0.5">
            {/* Dashboard */}
            <button
              type="button"
              onClick={() => handleNavigate("/dashboard")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-[#9ae600] group-hover:text-slate-950 transition-colors shrink-0">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white">
                  Dashboard
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  Overview &amp; recent activity
                </p>
              </div>
            </button>

            {/* My Reports */}
            <button
              type="button"
              onClick={() => handleNavigate("/dashboard/my-reports")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-[#9ae600] group-hover:text-slate-950 transition-colors shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white">
                  My Reports
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  Manage lost &amp; found listings
                </p>
              </div>
            </button>

            {/* Profile */}
            <button
              type="button"
              onClick={() => handleNavigate("/profile")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-[#9ae600] group-hover:text-slate-950 transition-colors shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white">
                  Profile
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  Account settings &amp; contact
                </p>
              </div>
            </button>

            {/* Admin Panel (Conditional on isAdmin) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleNavigate("/dashboard")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 transition-colors group cursor-pointer mt-1"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200">
                      Admin Panel
                    </p>
                  </div>
                  <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 truncate">
                    Platform controls &amp; claims review
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Bottom Divider & Logout */}
          <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold">Logout</p>
                <p className="text-[11px] text-rose-400 dark:text-rose-400/80">
                  Sign out of this device
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
