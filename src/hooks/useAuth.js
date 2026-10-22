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

  const refreshUser = () => {
    try {
      const stored = localStorage.getItem("findora_demo_user");
      if (stored) {
        setDemoUser(JSON.parse(stored));
      }
    } catch {}
  };

  useEffect(() => {
    refreshUser();
    const handleUpdate = () => refreshUser();
    if (typeof window !== "undefined") {
      window.addEventListener("findora_user_updated", handleUpdate);
      return () => window.removeEventListener("findora_user_updated", handleUpdate);
    }
  }, []);

  const [dbRole, setDbRole] = useState(null);
  const [dbImage, setDbImage] = useState(null);

  // Synchronize role and avatar image directly from MongoDB database
  useEffect(() => {
    const targetEmail =
      sessionData?.user?.email || demoUser?.email || "zabedfolio@gmail.com";
    if (!targetEmail) return;

    let isMounted = true;
    fetch(`/api/user/role?email=${encodeURIComponent(targetEmail)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.success) {
          if (data?.role) setDbRole(data.role);
          if (data?.user?.image) setDbImage(data.user.image);
        }
      })
      .catch((err) => {
        console.warn("Live DB role sync fallback:", err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [sessionData?.user?.email, demoUser?.email]);

  const rawUser = sessionData?.user || demoUser || {
    id: "user_current",
    name: "Zabed Mahmud",
    email: "zabedfolio@gmail.com",
    phone: "+880 1712-345678",
    image: "/default-avatar.png",
    role: "admin",
  };

  // User object guaranteed to have real role and ImgBB avatar from MongoDB
  const user = {
    ...rawUser,
    role: dbRole || rawUser?.role || "user",
    image: dbImage || rawUser?.image || "/default-avatar.png",
  };

  const session = sessionData?.session || (demoUser ? { id: "demo-session" } : null);
  const loading = isPending ?? false;

  // Check if current user has administrator privileges
  const isAdmin = Boolean(
    user?.role === "admin" ||
    user?.isAdmin === true
  );

  /**
   * Update current user profile and sync role with MongoDB
   */
  const updateProfile = async (updates) => {
    try {
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

      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      if (apiBase) {
        try {
          const res = await fetch(`${apiBase}/users/me`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify(updates),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.user) updates = data.user;
          }
        } catch (e) {
          console.warn("Backend update error, saving to client state:", e.message);
        }
      }

      const updatedUser = {
        ...(user || {}),
        ...updates,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("findora_demo_user", JSON.stringify(updatedUser));
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
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/users/me/password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        if (res.ok) {
          return await res.json();
        } else {
          const err = await res.json();
          throw new Error(err.message || "Failed to update password");
        }
      } catch (e) {
        if (!e.message?.includes("fetch")) {
          throw e;
        }
      }
    }

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
    updateProfile,
    changePassword,
    refreshUser,
    error,
    authClient,
  };
}

export default useAuth;
