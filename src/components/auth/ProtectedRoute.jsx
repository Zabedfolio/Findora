"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Loader from "@/components/ui/Loader";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";

/**
 * ProtectedRoute Component:
 * - Client component with props `children` and optional `roles` (e.g. ['admin']).
 * - While auth is loading, renders `<Loader fullPage />`.
 * - If no user is authenticated, redirects to `/login?redirect=${pathname}`.
 * - If `roles` is specified and `user.role` is not included in `roles`, displays a 403 'Not authorised' screen
 *   with an intuitive "Back to home" button.
 * - Used in layout files (e.g. dashboard and admin layouts) so child pages do not repeat checks.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.roles] - Optional array of authorized roles, e.g. ['admin']
 */
export default function ProtectedRoute({ children, roles }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleLogout = () => {
      window.location.href = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
    };

    const handleStorage = (e) => {
      if (e.key === "findora_logged_out" && e.newValue === "true") {
        window.location.href = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
      }
    };

    window.addEventListener("findora_user_logged_out", handleLogout);
    window.addEventListener("storage", handleStorage);

    if (!loading && !user) {
      const redirectUrl = pathname
        ? `/login?redirect=${encodeURIComponent(pathname)}`
        : "/login";
      router.replace(redirectUrl);
    }

    return () => {
      window.removeEventListener("findora_user_logged_out", handleLogout);
      window.removeEventListener("storage", handleStorage);
    };
  }, [Boolean(user), loading, router, pathname]);

  // While auth state is loading, display the full page centered loader
  if (loading) {
    return <Loader fullPage />;
  }

  // If no authenticated user, hold rendering while redirection takes place
  if (!user) {
    return <Loader fullPage />;
  }

  // If roles restriction is specified, verify user.role is included
  const hasRequiredRole =
    !roles ||
    roles.length === 0 ||
    (user?.role && roles.includes(user.role));

  if (!hasRequiredRole) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070905] text-slate-900 dark:text-white flex items-center justify-center p-4 sm:p-6 transition-colors">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#090e06] border border-rose-500/20 dark:border-rose-500/30 p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center">
          {/* Ambient Background Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          {/* 403 Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-3">
            <Lock className="w-3 h-3" />
            <span>403 · Access Forbidden</span>
          </div>

          {/* 403 Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-950 dark:text-white">
            Not authorised
          </h1>

          {/* Explanation */}
          <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            You do not have permission to view this page. This section requires{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {roles.join(" or ")}
            </span>{" "}
            privileges.
          </p>

          {/* Current User Session Status */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300">
            <span>Signed in as: </span>
            <strong className="text-slate-900 dark:text-white">
              {user.email || user.name || "Member"}
            </strong>
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
              {user.role || "user"}
            </span>
          </div>

          {/* Action: Back to Home Button */}
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold bg-[#9ae600] text-slate-950 hover:bg-[#86c800] active:scale-[0.99] transition-all shadow-md cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Back to home</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go to user dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and possesses the required role
  return <>{children}</>;
}
