"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "./LanguageSwitcher";
import UserMenu from "./UserMenu";
import { Skeleton } from "@heroui/react";
import {
  ArrowUpRight,
  LayoutDashboard,
  FileText,
  User as UserIcon,
  Bell,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function NavAuthButtons({
  isMobile = false,
  onActionClick,
  user: propUser,
  loading: propLoading,
  isAdmin: propIsAdmin,
  logout: propLogout,
}) {
  const { t } = useTranslation();
  const auth = useAuth();

  const user = propUser !== undefined ? propUser : auth.user;
  const loading = propLoading !== undefined ? propLoading : auth.loading;
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : auth.isAdmin;
  const logout = propLogout || auth.logout;

  if (isMobile) {
    return (
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
        {/* Report an Item Action */}
        <Link
          href="/reports/new"
          onClick={onActionClick}
          className="flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 bg-[#F2FCE2] dark:bg-[#9ae600]/15 hover:bg-[#E5F9C9] dark:hover:bg-[#9ae600]/25 rounded-xl border border-[#9ae600]/40 transition-colors"
        >
          <span>{t("nav.report")}</span>
          <span className="text-[10px] bg-[#9ae600] text-slate-950 font-black px-2 py-0.5 rounded-md">
            {t("nav.reportBadge")}
          </span>
        </Link>

        {/* Language Selection */}
        <div className="flex items-center justify-between px-1 py-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Language
          </span>
          <LanguageSwitcher />
        </div>

        {/* Mobile Auth State */}
        {loading ? (
          <div className="py-2 flex items-center justify-center">
            <Skeleton className="w-full h-10 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        ) : user ? (
          <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <div className="px-2 py-1 mb-2">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Signed In As</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name || "Member"}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>

            <Link
              href="/reports"
              onClick={onActionClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/reports?filter=my-reports"
              onClick={onActionClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>My Reports</span>
            </Link>

            <Link
              href="/profile"
              onClick={onActionClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span>Profile</span>
            </Link>

            <Link
              href="/notifications"
              onClick={onActionClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Notifications</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={onActionClick}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Admin Panel</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                onActionClick?.();
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onActionClick}
              className="w-full text-center py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {t("nav.login")}
            </Link>

            <Link
              href="/register"
              onClick={onActionClick}
              className="inline-flex items-center justify-center gap-2.5 w-full py-2.5 bg-[#9ae600] hover:bg-[#88cc00] active:scale-95 text-slate-950 font-bold rounded-full text-sm tracking-tight transition-all duration-200 shadow-[0_0_20px_rgba(154,230,0,0.45)] group"
            >
              <span>{t("nav.register")}</span>
              <span className="w-6 h-6 rounded-full bg-slate-950 text-[#9ae600] flex items-center justify-center transition-transform duration-200 group-hover:rotate-45 shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-4 shrink-0">
      {/* Highlighted Report Item Badge Pill */}
      <Link
        href="/reports/new"
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#457300] bg-[#F2FCE2] hover:bg-[#E5F9C9] border border-[#9ae600]/40 rounded-xl transition-all hover:scale-[1.02] whitespace-nowrap shrink-0 shadow-2xs"
      >
        <span>{t("nav.report")}</span>
        <span className="bg-[#9ae600] text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md">
          {t("nav.reportBadge")}
        </span>
      </Link>

      <div className="h-4 w-px bg-slate-200 mx-0.5 shrink-0" />

      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Auth state: Skeleton while loading, UserMenu if logged in, Login/Register if guest */}
      {loading ? (
        <Skeleton className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
      ) : user ? (
        <UserMenu user={user} isAdmin={isAdmin} logout={logout} />
      ) : (
        <>
          {/* Sign in text button */}
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            {t("nav.login")}
          </Link>

          {/* Primary Action Button */}
          <Link
            href="/register"
            className="inline-flex items-center gap-2.5 bg-[#9ae600] hover:bg-[#88cc00] active:scale-95 text-slate-950 font-bold pl-4 sm:pl-5 pr-2 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm tracking-tight transition-all duration-200 shadow-[0_0_20px_rgba(154,230,0,0.45)] hover:shadow-[0_0_30px_rgba(154,230,0,0.7)] group shrink-0"
          >
            <span>{t("nav.register")}</span>
            <span className="w-6 h-6 rounded-full bg-slate-950 text-[#9ae600] flex items-center justify-center transition-transform duration-200 group-hover:rotate-45 shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </>
      )}
    </div>
  );
}
