"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Loader2, ShieldCheck } from "lucide-react";

/**
 * ProtectedRoute Component:
 * Guards client-side routes, ensuring only authenticated users can access.
 * Displays a sleek loading state while session hydrates, and redirects unauthenticated
 * visitors to the login page.
 */
export default function ProtectedRoute({ children, fallback = null }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
      router.replace(redirectUrl);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      fallback || (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center mb-4">
            <Loader2 className="w-7 h-7 text-[#9ae600] animate-spin" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Checking session...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Please wait while we secure your session
          </p>
        </div>
      )
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
