"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "@/hooks/useAuth";
import { resolveReport, deleteReport } from "@/services/reportService";
import ConfirmModal from "@/components/ui/ConfirmModal";
import toast from "@/lib/toast";
import {
  MoreVertical,
  Edit3,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";

/**
 * ReportActions Component:
 * Three-dot menu providing Edit, Mark as Resolved, and Delete actions.
 * Only rendered if current user is the owner (user._id === report.owner._id) or admin.
 * Interacts with ConfirmModal and invalidates queries upon completion.
 */
export default function ReportActions({ report, onUpdate }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRef = useRef(null);

  // Close dropdown menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  if (!report) return null;

  const reportId = report.id || report._id;
  const currentUserId = user?.id || user?._id;
  const ownerId = report.owner?._id || report.owner?.id;

  // Visible only if user is owner or admin
  const isOwner = Boolean(
    currentUserId && ownerId && String(currentUserId) === String(ownerId)
  );
  const canManage = isOwner || isAdmin;

  if (!canManage) return null;

  const isResolved = report.status === "resolved";

  const handleEdit = () => {
    setIsOpen(false);
    router.push(`/reports/${reportId}/edit`);
  };

  const handleConfirmResolve = async () => {
    setIsResolving(true);
    try {
      await resolveReport(reportId);
      toast.success("Listing marked as resolved!");
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setShowResolveModal(false);
      onUpdate?.();
    } catch (err) {
      toast.error(err?.message || "Failed to mark as resolved");
    } finally {
      setIsResolving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteReport(reportId);
      toast.success("Report deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setShowDeleteModal(false);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err?.message || "Failed to delete report");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Manage report actions"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-40 origin-top-right animate-in fade-in zoom-in-95 duration-100">
            {/* Edit */}
            <button
              type="button"
              onClick={handleEdit}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-left"
            >
              <Edit3 className="w-4 h-4 text-slate-400" />
              <span>Edit Listing</span>
            </button>

            {/* Mark as Resolved */}
            {!isResolved && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowResolveModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors cursor-pointer text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Mark as Resolved</span>
              </button>
            )}

            {/* Delete */}
            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowDeleteModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer text-left"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Delete Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirm Resolve Modal */}
      <ConfirmModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        onConfirm={handleConfirmResolve}
        title="Mark Item as Reunited/Resolved?"
        description="This marks the report as completed and lets the community know the item has been returned safely."
        confirmLabel="Mark as Resolved"
        cancelLabel="Keep Active"
        variant="primary"
        isLoading={isResolving}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete this Report?"
        description="Are you sure you want to delete this listing? All claims and details will be permanently removed."
        confirmLabel="Delete Listing"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
