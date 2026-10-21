"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "@/lib/toast";

/**
 * Custom authentication hook integrating with Better-Auth client.
 * Provides user profile, session state, loading indicator, admin role detection,
 * and a centralized logout handler.
 */
export function useAuth() {
  const router = useRouter();

  // Better-Auth reactive session query
  const sessionResult = authClient?.useSession ? authClient.useSession() : { data: null, isPending: false };
  const { data: sessionData, isPending, error } = sessionResult || {};

  const [demoUser, setDemoUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("findora_demo_user");
      if (stored) {
        setDemoUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const user = sessionData?.user || demoUser || null;
  const session = sessionData?.session || (demoUser ? { id: "demo-session" } : null);
  const loading = isPending ?? false;

  // Check if current user has administrator privileges
  const isAdmin = Boolean(
    user?.role === "admin" ||
    user?.isAdmin === true ||
    (typeof user?.email === "string" && user.email.toLowerCase().includes("admin"))
  );

  /**
   * Log out the current user, clear session cookies, and notify with toast
   */
  const logout = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("findora_demo_user");
        setDemoUser(null);
      }
      if (authClient?.signOut) {
        await authClient.signOut();
      }
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      toast.error(err?.message || "Failed to log out");
    }
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    logout,
    error,
    authClient,
  };
}

export default useAuth;
