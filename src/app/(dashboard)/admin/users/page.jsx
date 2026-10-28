"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Shield,
  UserCheck,
  UserX,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  X,
  Check,
  Edit,
  ArrowRightLeft,
  FileText,
  Handshake,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import useAuth from "@/hooks/useAuth";
import toast from "@/lib/toast";

const STORAGE_USERS_KEY = "findora_admin_users_v1";

export default function AdminUsersPage() {
  const { user: currentUser, updateProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'admin' | 'moderator' | 'user'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'suspended'

  // Edit Role Modal State
  const [editingRoleUser, setEditingRoleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("user");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Clear any legacy mock cache on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_USERS_KEY);
      }
    } catch {}
  }, []);

  // Fetch only real users from MongoDB database
  const fetchDbUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.users) {
          setUsers(data.users);
          return;
        }
      }
      setUsers([]);
    } catch (err) {
      console.warn("Could not fetch database users:", err.message);
      toast.error("Could not fetch user directory from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDbUsers();
  }, [fetchDbUsers]);

  // Toggle Suspend / Activate directly in MongoDB
  const handleToggleStatus = async (id) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    const nextStatus = target.status === "active" ? "suspended" : "active";

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
    );

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: nextStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status on server");
      }

      if (nextStatus === "suspended") {
        toast.warning(`User ${target.name} has been suspended in database`);
      } else {
        toast.success(`User ${target.name} account re-activated in database`);
      }
    } catch (err) {
      console.error("Failed to update user status in DB:", err);
      toast.error("Failed to update status in database. Reverting.");
      // Rollback
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: target.status } : u))
      );
    }
  };

  // Save Role Change directly to MongoDB database and local state
  const handleSaveRole = async () => {
    if (!editingRoleUser) return;
    const targetId = editingRoleUser.id;
    const targetEmail = editingRoleUser.email;

    try {
      setIsUpdatingRole(true);

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetId,
          email: targetEmail,
          role: selectedRole,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update role in database");
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetId ? { ...u, role: selectedRole } : u
        )
      );

      // Also notify auth context if changing role of logged in user
      if (
        editingRoleUser.email === currentUser?.email ||
        editingRoleUser.id === currentUser?.id
      ) {
        updateProfile({ role: selectedRole });
      }

      toast.success(
        `Role for ${editingRoleUser.name} updated to "${selectedRole}" in database`
      );
      setEditingRoleUser(null);
    } catch (err) {
      console.error("Failed to update role in DB:", err);
      toast.error("Failed to update user role in database.");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.phone || "").includes(q) ||
          (u.id || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Role Filter
      if (roleFilter !== "all" && u.role !== roleFilter) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter !== "all" && u.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Overall KPIs calculated from real database users
  const metrics = useMemo(() => {
    let active = 0;
    let suspended = 0;
    let admins = 0;

    for (const u of users) {
      if (u.status === "active") active++;
      if (u.status === "suspended") suspended++;
      if (u.role === "admin" || u.role === "moderator") admins++;
    }

    return { total: users.length, active, suspended, admins };
  }, [users]);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-950 dark:text-white">
            User Directory &amp; Access Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real database members registered on Findora with role permissions and access security.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDbUsers}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-[#9ae600] transition-colors shadow-xs"
        >
          <RefreshCw
            size={13}
            className={loading ? "animate-spin text-[#72a800] dark:text-[#9ae600]" : "text-slate-400"}
          />
          <span>Sync Database</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Total Accounts
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : metrics.total}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Registered Findora members
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Active Accounts
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {loading ? "..." : metrics.active}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            In good standing
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-500">
            Suspended Users
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-rose-500">
            {loading ? "..." : metrics.suspended}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Access restricted
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-500">
            Staff &amp; Admins
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-purple-500">
            {loading ? "..." : metrics.admins}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Privileged operators
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or phone number…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9ae600]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#9ae600] cursor-pointer"
            >
              <option value="all">Role: All</option>
              <option value="admin">Administrators</option>
              <option value="moderator">Moderators</option>
              <option value="user">Regular Users</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#9ae600] cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] text-slate-400 font-mono">
                <th className="py-3 px-4 font-bold uppercase">User</th>
                <th className="py-3 px-4 font-bold uppercase">Role</th>
                <th className="py-3 px-4 font-bold uppercase">Contact</th>
                <th className="py-3 px-4 font-bold uppercase">Activity</th>
                <th className="py-3 px-4 font-bold uppercase">Status</th>
                <th className="py-3 px-4 font-bold uppercase text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#72a800] dark:text-[#9ae600] mb-2" />
                    <p className="font-semibold text-xs">Loading database members...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">No database users match your criteria</p>
                    <p className="text-xs mt-1">Try resetting the role filter or search query</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => {
                  const isActive = item.status === "active";
                  const isAdminRole = item.role === "admin";
                  const isModRole = item.role === "moderator";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10 shrink-0 border border-slate-200 dark:border-white/10">
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-[190px]">
                            <p className="font-bold text-slate-950 dark:text-white truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate font-mono">
                              {item.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border",
                            isAdminRole
                              ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30"
                              : isModRole
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30"
                              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10"
                          )}
                        >
                          <Shield size={10} />
                          {item.role}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          <p className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[180px]">
                            {item.email}
                          </p>
                          <p className="text-slate-400 font-mono">
                            {item.phone}
                          </p>
                        </div>
                      </td>

                      {/* Activity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                          <span title="Reports posted">
                            <strong>{item.listingsCount}</strong> posts
                          </span>
                          <span>•</span>
                          <span title="Claims made">
                            <strong>{item.claimsCount}</strong> claims
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border",
                            isActive
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              isActive ? "bg-emerald-500" : "bg-rose-500"
                            )}
                          />
                          {item.status}
                        </span>
                      </td>

                      {/* Access Controls */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Change Role Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRoleUser(item);
                              setSelectedRole(item.role);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200 dark:border-white/10 flex items-center gap-1"
                            title="Change user access role"
                          >
                            <ArrowRightLeft size={11} />
                            <span>Role</span>
                          </button>

                          {/* Suspend / Activate Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item.id)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1",
                              isActive
                                ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            )}
                            title={isActive ? "Suspend user access" : "Re-activate user"}
                          >
                            {isActive ? (
                              <>
                                <UserX size={11} />
                                <span>Suspend</span>
                              </>
                            ) : (
                              <>
                                <UserCheck size={11} />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {editingRoleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#070b04] border border-[#9ae600]/30 p-6 shadow-2xl relative text-slate-900 dark:text-white">
            <button
              type="button"
              onClick={() => setEditingRoleUser(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <span className="p-2.5 rounded-2xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h4 className="font-display font-bold text-base text-slate-950 dark:text-white">
                  Change Account Role
                </h4>
                <p className="text-xs text-slate-500">
                  Target: {editingRoleUser.name} ({editingRoleUser.email})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Select the administrative authorization level for this member:
            </p>

            <div className="space-y-2 mb-5">
              {[
                {
                  key: "admin",
                  label: "Administrator",
                  desc: "Full unrestricted control over listings, users, fraud telemetry, and system configuration.",
                },
                {
                  key: "moderator",
                  label: "Community Moderator",
                  desc: "Can verify listings and moderate reported inappropriate reviews.",
                },
                {
                  key: "user",
                  label: "Standard User",
                  desc: "Standard citizen account with report submission and item claiming capabilities.",
                },
              ].map((r) => (
                <label
                  key={r.key}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-all",
                    selectedRole === r.key
                      ? "bg-[#9ae600]/10 border-[#9ae600]/50 text-slate-950 dark:text-white shadow-xs"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  )}
                >
                  <input
                    type="radio"
                    name="roleSelection"
                    checked={selectedRole === r.key}
                    onChange={() => setSelectedRole(r.key)}
                    className="accent-[#9ae600] mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{r.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      {r.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setEditingRoleUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingRole}
                onClick={handleSaveRole}
                className="btn-primary-glow px-4 py-2 rounded-xl text-xs font-bold text-slate-950 shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isUpdatingRole ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                <span>Save Role Permissions</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
