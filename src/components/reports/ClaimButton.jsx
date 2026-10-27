"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Handshake, HelpCircle, Check, Loader2, ShieldCheck, X, ShieldAlert, Lock } from "lucide-react";
import toast from "@/lib/toast";
import useAuth from "@/hooks/useAuth";
import { createClaim, getMyClaims } from "@/services/claimService";

/**
 * ClaimButton Component:
 * Interactive claim action allowing visitors to claim a found item or report finding a lost item.
 * Strictly requires authentication; guests are prompted and redirected to login.
 */
export default function ClaimButton({ report }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [claimProof, setClaimProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  // Check if current user already claimed this item
  useEffect(() => {
    if (!user || !report) return;
    const reportId = String(report._id || report.id || "");
    if (!reportId) return;

    getMyClaims({ type: "outgoing" }, user).then((res) => {
      if (res && res.claims) {
        const alreadyClaimed = res.claims.some(
          (c) => String(c.reportId) === reportId
        );
        if (alreadyClaimed) {
          setHasClaimed(true);
        }
      }
    }).catch(() => {});
  }, [user, report]);

  if (!report) return null;

  const isFound = report.type === "found";
  const isResolved = report.status === "resolved";

  if (isResolved) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
          This report has been resolved &amp; reunited.
        </p>
      </div>
    );
  }

  const handleOpenClaim = () => {
    if (!user) {
      toast.error("Please sign in to submit a claim or notification.");
      const redirectUrl = pathname
        ? `/login?redirect=${encodeURIComponent(pathname)}`
        : "/login";
      router.push(redirectUrl);
      return;
    }
    setIsOpen(true);
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to submit a claim.");
      const redirectUrl = pathname
        ? `/login?redirect=${encodeURIComponent(pathname)}`
        : "/login";
      router.push(redirectUrl);
      return;
    }

    if (!claimProof.trim()) {
      toast.error("Please provide verification details to prove ownership.");
      return;
    }

    setIsSubmitting(true);
    try {
      const loc =
        report.location?.city ||
        report.location?.area ||
        report.location?.address ||
        (typeof report.location === "string" ? report.location : "Dhaka");

      await createClaim({
        reportId: report._id || report.id,
        itemTitle: report.title || "Found Item",
        itemThumbnail: report.images?.[0] || report.thumbnail || "",
        category: report.category || "General",
        location: loc,
        claimant: {
          id: user.id || user._id,
          name: user.name || "Claimant",
          email: user.email,
          avatar: user.avatar || user.image || "",
        },
        finder: {
          id: report.postedBy?.userId || report.postedBy?.id || report.postedBy?._id || report.user?.id || report.user?._id || "finder",
          userId: report.postedBy?.userId || report.postedBy?.id || report.postedBy?._id || report.user?.id || report.user?._id || "finder",
          name: report.postedBy?.name || report.contact?.name || report.user?.name || "Item Finder",
          email: report.postedBy?.email || report.contact?.email || report.user?.email || "finder@findora.app",
          phone: report.contact?.phone || "",
          avatar: report.postedBy?.image || report.postedBy?.avatar || report.user?.avatar || "",
        },
        proofText: claimProof.trim(),
      });

      setHasClaimed(true);
      setIsOpen(false);
      setClaimProof("");
      toast.success(
        isFound
          ? "Claim request submitted! It now appears in your dashboard."
          : "Match alert sent! The owner has been notified."
      );
    } catch (err) {
      console.error("Error creating claim:", err);
      toast.error("Could not submit claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#9ae600]/10 via-[#9ae600]/5 to-transparent border border-[#9ae600]/30 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-[#7cb800] dark:text-[#9ae600]" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
            {isFound ? "Is this your item?" : "Have you seen this item?"}
          </h4>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          {isFound
            ? "Submit a claim with proof of ownership to safely coordinate a handover with the finder."
            : "If you found or spotted this item, notify the owner instantly to help reunite them."}
        </p>

        {hasClaimed ? (
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <Check className="w-4 h-4" />
            <span>Request Sent to {isFound ? "Finder" : "Owner"}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleOpenClaim}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#9ae600] hover:bg-[#88cc00] active:scale-98 text-slate-950 font-bold text-sm transition-all shadow-[0_4px_18px_rgba(154,230,0,0.35)] cursor-pointer flex items-center justify-center gap-2"
          >
            {user ? (
              <>
                <Handshake className="w-4 h-4" />
                <span>{isFound ? "Claim This Item" : "I Found This Item"}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In to {isFound ? "Claim Item" : "Report Finding"}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Claim Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-950 dark:text-white font-heading">
              {isFound ? "Submit Ownership Claim" : "Report Found Match"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              For security, provide distinguishing details that only the true owner would know.
            </p>

            <form onSubmit={handleSubmitClaim} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Proof / Distinguishing Marks
                </label>
                <textarea
                  rows={4}
                  required
                  value={claimProof}
                  onChange={(e) => setClaimProof(e.target.value)}
                  placeholder="e.g. Serial number, wallpaper image, exact secret contents, purchase receipt info..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#9ae600]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#9ae600] text-slate-950 font-bold text-xs rounded-xl hover:bg-[#88cc00] flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Claim</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
