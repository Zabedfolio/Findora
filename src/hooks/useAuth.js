"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "@/lib/toast";

/**
 * Synchronize authentication cookies for Next.js middleware and proxy guards
 */
function syncAuthCookies(u) {
  if (typeof document === "undefined") return;
  if (u) {
    document.cookie = "findora_session=1; path=/; max-age=604800; SameSite=Lax";
    document.cookie = `findora_role=${u.role || "user"}; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = "findora_session=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "findora_role=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "my_app_v2.session_token=; path=/; max-age=0; SameSite=Lax";
  }
}

/**
 * Custom authentication hook integrating with Better-Auth client.
 * Provides user profile, session state, loading indicator, admin role detection,
 * and a centralized logout handler.
 */
export function useAuth() {
  const router = useRouter();

  // Better-Auth reactive session query
  const sessionResult = authClient?.useSession
    ? authClient.useSession()
    : { data: null, isPending: false };
  const { data: sessionData, isPending, error } = sessionResult || {};

  const [demoUser, setDemoUser] = useState(null);
  const [authHydrated, setAuthHydrated] = useState(false);

  const refreshUser = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const isLoggedOut = localStorage.getItem("findora_logged_out") === "true";
      if (isLoggedOut) {
        setDemoUser(null);
        syncAuthCookies(null);
        setAuthHydrated(true);
        return;
      }

      const stored = localStorage.getItem("findora_demo_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setDemoUser((prev) => {
          if (
            prev &&
            prev.id === parsed.id &&
            prev.email === parsed.email &&
            prev.role === parsed.role &&
            prev.image === parsed.image &&
            prev.name === parsed.name
          ) {
            return prev;
          }
          return parsed;
        });
        syncAuthCookies(parsed);
      } else {
        // Default initial session for local developer workspace
        const defaultDevUser = {
          id: "user_current",
          name: "Zabed Mahmud",
          email: "zabedfolio@gmail.com",
          phone: "+880 1712-345678",
          image: "/default-avatar.png",
          role: "admin",
        };
        localStorage.setItem("findora_demo_user", JSON.stringify(defaultDevUser));
        setDemoUser((prev) => {
          if (prev && prev.id === defaultDevUser.id && prev.email === defaultDevUser.email) return prev;
          return defaultDevUser;
        });
        syncAuthCookies(defaultDevUser);
      }
    } catch {
      // Fallback
    } finally {
      setAuthHydrated(true);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    const handleUpdate = () => refreshUser();
    if (typeof window !== "undefined") {
      window.addEventListener("findora_user_updated", handleUpdate);
      return () => window.removeEventListener("findora_user_updated", handleUpdate);
    }
  }, [refreshUser]);

  const [dbRole, setDbRole] = useState(null);
  const [dbImage, setDbImage] = useState(null);
  const lastFetchedEmailRef = useRef(null);

  // Synchronize role and avatar image directly from MongoDB database
  useEffect(() => {
    const targetEmail = sessionData?.user?.email || demoUser?.email;
    if (!targetEmail) return;
    if (lastFetchedEmailRef.current === targetEmail && dbRole) return;
    lastFetchedEmailRef.current = targetEmail;

    let isMounted = true;
    fetch(`/api/user/role?email=${encodeURIComponent(targetEmail)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.success) {
          if (data?.role) {
            setDbRole((prev) => (prev !== data.role ? data.role : prev));
            if (typeof document !== "undefined") {
              document.cookie = `findora_role=${data.role}; path=/; max-age=604800; SameSite=Lax`;
            }
          }
          if (data?.user?.image) {
            setDbImage((prev) => (prev !== data.user.image ? data.user.image : prev));
          }
        }
      })
      .catch((err) => {
        console.warn("Live DB role sync fallback:", err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [sessionData?.user?.email, demoUser?.email, dbRole]);

  const isLoggedOut =
    typeof window !== "undefined" &&
    localStorage.getItem("findora_logged_out") === "true";

  const rawUser = isLoggedOut
    ? null
    : sessionData?.user || demoUser || null;

  // Memoize user object with stable reference based on primitives to stop infinite re-render cascades
  const user = useMemo(() => {
    if (isLoggedOut || !rawUser) return null;
    return {
      ...rawUser,
      role: dbRole || rawUser?.role || "user",
      image: dbImage || rawUser?.image || "/default-avatar.png",
    };
  }, [
    isLoggedOut,
    rawUser?.id,
    rawUser?._id,
    rawUser?.name,
    rawUser?.email,
    rawUser?.phone,
    rawUser?.role,
    rawUser?.image,
    dbRole,
    dbImage,
  ]);

  const session = useMemo(() => {
    if (!user) return null;
    return sessionData?.session || { id: "demo-session" };
  }, [user, sessionData?.session]);

  // Hydration + Better-auth session query loading state
  const loading = isPending || !authHydrated;

  // Check if current user has administrator privileges
  const isAdmin = useMemo(() => {
    return Boolean(user?.role === "admin" || user?.isAdmin === true);
  }, [user?.role, user?.isAdmin]);

  /**
   * Quick demo login for role testing (admin vs regular member)
   */
  const loginDemoUser = (targetRole = "user") => {
    const isTargetAdmin = targetRole === "admin";
    const newUser = {
      id: isTargetAdmin ? "user_admin" : "user_member",
      name: isTargetAdmin ? "Zabed Mahmud (Admin)" : "Rahim Ahmed (Member)",
      email: isTargetAdmin ? "zabedfolio@gmail.com" : "rahim.member@findora.app",
      phone: "+880 1712-345678",
      image: "/default-avatar.png",
      role: targetRole,
    };
    if (typeof window !== "undefined") {
      localStorage.removeItem("findora_logged_out");
      localStorage.setItem("findora_demo_user", JSON.stringify(newUser));
      syncAuthCookies(newUser);
      setDemoUser(newUser);
      setDbRole(targetRole);
      window.dispatchEvent(new Event("findora_user_updated"));
    }
    return newUser;
  };

  /**
   * Update current user profile and sync role with MongoDB
   */
  const updateProfile = async (updates) => {
    try {
      if (!user) return { success: false };

      // If role is updated, persist directly into MongoDB database
      if (updates?.role && user?.email) {
        try {
          const res = await fetch("/api/user/role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              role: updates.role,
            }),
          });
          if (res.ok) {
            setDbRole(updates.role);
          }
        } catch (dbErr) {
          console.warn("Failed to persist role to MongoDB:", dbErr.message);
        }
      }

      const updatedUser = {
        ...(user || {}),
        ...updates,
      };

      if (typeof window !== "undefined") {
        localStorage.removeItem("findora_logged_out");
        localStorage.setItem("findora_demo_user", JSON.stringify(updatedUser));
        syncAuthCookies(updatedUser);
        window.dispatchEvent(new Event("findora_user_updated"));
      }

      setDemoUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error("Update profile error:", err);
      throw err;
    }
  };

  /**
   * Change user password
   */
  const changePassword = async ({ currentPassword, newPassword }) => {
    if (currentPassword === "wrong" || (user?.password && user.password !== currentPassword)) {
      throw new Error("Current password is incorrect.");
    }

    if (user && typeof window !== "undefined") {
      const updatedUser = { ...user, password: newPassword };
      localStorage.setItem("findora_demo_user", JSON.stringify(updatedUser));
      setDemoUser(updatedUser);
      window.dispatchEvent(new Event("findora_user_updated"));
    }

    return { success: true };
  };

  /**
   * Log out the current user, clear session cookies, and notify with toast
   */
  const logout = async (customRedirect) => {
    try {
      let currentPath = "";
      if (typeof window !== "undefined") {
        currentPath = window.location.pathname + window.location.search;
        localStorage.removeItem("findora_demo_user");
        localStorage.setItem("findora_logged_out", "true");
        syncAuthCookies(null);
        setDemoUser(null);
        setDbRole(null);
        setDbImage(null);
        window.dispatchEvent(new Event("findora_user_updated"));
        window.dispatchEvent(new Event("findora_user_logged_out"));
      }
      if (authClient?.signOut) {
        await authClient.signOut();
      }
      toast.success("Logged out successfully");

      let redirectSource = customRedirect;
      if (!redirectSource && typeof window !== "undefined") {
        const p = window.location.pathname;
        const s = window.location.search;
        // If user logged out while on a protected route or details page, preserve return path
        if (
          p.startsWith("/dashboard") ||
          p.startsWith("/admin") ||
          p.startsWith("/reports/") ||
          p.startsWith("/profile") ||
          p.startsWith("/match-radar") ||
          (p !== "/" && !p.startsWith("/login") && !p.startsWith("/register"))
        ) {
          redirectSource = p + s;
        }
      }

      const targetUrl = redirectSource
        ? `/login?redirect=${encodeURIComponent(redirectSource)}`
        : "/login";

      if (typeof window !== "undefined") {
        window.location.href = targetUrl;
      } else {
        router.push(targetUrl);
      }
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
    loginDemoUser,
    updateProfile,
    changePassword,
    refreshUser,
    error,
    authClient,
  };
}

export default useAuth;
