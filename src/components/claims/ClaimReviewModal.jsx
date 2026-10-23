"use client";

import React, { useState } from "react";
import { Modal, Button, Spinner } from "@heroui/react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  Calendar,
  MapPin,
  User,
  Image as ImageIcon,
  Sparkles,
  Info,
  Maximize2,
  X,
  FileCheck,
} from "lucide-react";
import toast from "@/lib/toast";
import { approveClaim, rejectClaim } from "@/services/claimService";

const APPROVAL_TEMPLATES = [
  "Serial number confirmed match.",
  "Engraved initial / unique marks match.",
  "Provided valid purchase receipt.",
];

const REJECTION_TEMPLATES = [
  "Serial number or model did not match.",
  "Physical color and specifications differ.",
  "Insufficient identifying proof.",
];

/**
 * ClaimReviewModal Component:
 * Allows a finder to inspect private ownership proof submitted by a claimant,
 * and click Approve Claim or Reject Claim with an optional decision note.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {() => void} props.onClose - Dismiss callback
 * @param {Object} props.claim - The claim object containing claimantProof, itemTitle, claimant details
 * @param {(claimId: string, note: string) => Promise<any>} [props.onApprove] - Custom approval handler
 * @param {(claimId: string, note: string) => Promise<any>} [props.onReject] - Custom rejection handler
 * @param {(result: { action: 'approve' | 'reject', claimId: string, note: string }) => void} [props.onSuccess] - Callback after approval/rejection
 */
export default function ClaimReviewModal({
  isOpen = false,
  onClose,
  claim,
  onApprove,
  onReject,
  onSuccess,
}) {
  const [decisionNote, setDecisionNote] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState(null); // 'approve' | 'reject' | null
  const [previewImage, setPreviewImage] = useState(null);

  // Reset form when modal opens with a new claim
  const [lastClaimId, setLastClaimId] = useState(claim?.id);
  if (claim?.id !== lastClaimId) {
    setLastClaimId(claim?.id);
    setDecisionNote("");
    setError("");
    setIsSubmitting(false);
    setActiveAction(null);
    setPreviewImage(null);
  }

  if (!claim) return null;

  const handleOpenChange = (open) => {
    if (!open && !isSubmitting) {
      onClose?.();
    }
  };

  const handleApprove = async () => {
    setError("");
    setIsSubmitting(true);
    setActiveAction("approve");
    const note = decisionNote.trim();

    try {
      if (onApprove) {
        await onApprove(claim.id, note);
      } else {
        await approveClaim(claim.id, note);
      }
      toast.success("Claim approved! Handover hub and verification code activated.");
      onSuccess?.({ action: "approve", claimId: claim.id, note });
      onClose?.();
    } catch (err) {
      setError(err?.message || "Failed to approve claim. Please try again.");
    } finally {
      setIsSubmitting(false);
      setActiveAction(null);
    }
  };

  const handleReject = async () => {
    setError("");
    setIsSubmitting(true);
    setActiveAction("reject");
    const note = decisionNote.trim();

    try {
      if (onReject) {
        await onReject(claim.id, note);
      } else {
        await rejectClaim(claim.id, note);
      }
      toast("Claim rejected. Claimant has been notified.");
      onSuccess?.({ action: "reject", claimId: claim.id, note });
      onClose?.();
    } catch (err) {
      setError(err?.message || "Failed to reject claim. Please try again.");
    } finally {
      setIsSubmitting(false);
      setActiveAction(null);
    }
  };

  const proof = claim.claimantProof || {};
  const claimant = claim.claimant || {
    name: claim.claimantName || "Verified Claimant",
    avatar:
      claim.claimantAvatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    trustScore: claim.claimantTrust || "Community Member",
  };

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable={!isSubmitting}
      isKeyboardDismissDisabled={isSubmitting}
    >
      <Modal.Container size="lg" scroll="inside">
        <Modal.Dialog>
          {/* Header */}
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#9ae600]/20 text-[#639400] dark:bg-[#9ae600]/20 dark:text-[#9ae600]">
                  <FileCheck className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      Review Ownership Claim
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                      {claim.claimNumber || claim.id}
                    </span>
                  </div>
                  <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    Verify private identifying details against the item in your possession.
                  </p>
                </div>
              </div>
            </Modal.Heading>
          </Modal.Header>

          {/* Modal Body */}
          <Modal.Body>
            {/* Top Overview: Item & Claimant Banner */}
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                {claim.imageUrl && (
                  <img
                    src={claim.imageUrl}
                    alt={claim.itemTitle}
                    className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-900/10 dark:ring-white/10"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    {claim.itemTitle}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400" />
                      <span className="truncate">{claim.location}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-slate-400" />
                      <span>{claim.claimedDateFormatted || "Recently"}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Claimant Profile Info */}
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/80 px-3 py-1.5 dark:border-white/5 dark:bg-ink-800">
                <img
                  src={claimant.avatar}
                  alt={claimant.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <div className="text-left text-[11.5px]">
                  <p className="font-bold text-slate-900 dark:text-white">{claimant.name}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {claimant.trustScore}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Proof Container (Private Proof Showcase) */}
            <div className="mb-4 overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/30 p-4 dark:border-indigo-800/60 dark:from-indigo-950/30 dark:via-ink-900 dark:to-indigo-950/20 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300">
                    <Lock size={13} strokeWidth={2.4} />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                    Claimant's Private Identifying Proof
                  </h4>
                </div>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                  Confidential
                </span>
              </div>

              {/* Proof Description Text */}
              <div className="rounded-xl border border-indigo-100 bg-white/90 p-3.5 text-xs text-slate-800 dark:border-white/10 dark:bg-ink-900/90 dark:text-slate-200 leading-relaxed">
                {proof.description ? (
                  <p className="whitespace-pre-line font-mono text-[12px] leading-relaxed">
                    {proof.description}
                  </p>
                ) : (
                  <p className="italic text-slate-400">
                    No specific textual proof provided with this claim.
                  </p>
                )}
              </div>

              {/* Additional Proof (if claimant responded to more info request) */}
              {proof.additionalProof && (
                <div className="mt-3 rounded-xl border border-purple-200 bg-purple-50/80 p-3 text-xs text-purple-950 dark:border-purple-800/50 dark:bg-purple-950/30 dark:text-purple-200">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Sparkles size={12} className="text-purple-600 dark:text-purple-400" />
                    <span>Claimant's Follow-up Response:</span>
                  </div>
                  <p className="font-mono text-[12px]">{proof.additionalProof}</p>
                </div>
              )}

              {/* Attached Proof Image / Evidence Document */}
              {proof.hasProofPhoto && proof.proofPhotoUrl && (
                <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-white/5">
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ImageIcon size={13} className="text-indigo-500" />
                      <span>Attached Verification Photo / Receipt</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewImage(proof.proofPhotoUrl)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      <Maximize2 size={11} />
                      <span>Enlarge</span>
                    </button>
                  </div>
                  <div className="relative inline-block overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 group">
                    <img
                      src={proof.proofPhotoUrl}
                      alt="Claimant Proof Document"
                      className="h-28 w-44 object-cover transition duration-200 group-hover:scale-105"
                    />
                    <div
                      onClick={() => setPreviewImage(proof.proofPhotoUrl)}
                      className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-semibold"
                    >
                      Click to view
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Decision Note Textarea */}
            <div className="mb-3">
              <label
                htmlFor="decision-note"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Decision Note <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <textarea
                id="decision-note"
                rows={3}
                value={decisionNote}
                disabled={isSubmitting}
                onChange={(e) => {
                  setDecisionNote(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Add a confirmation note or instructions for the claimant..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400"
              />

              {/* Quick Template Chips */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10.5px] font-semibold text-slate-400">Quick inserts:</span>
                {[...APPROVAL_TEMPLATES, ...REJECTION_TEMPLATES].map((text) => (
                  <button
                    key={text}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setDecisionNote(text)}
                    className="rounded-lg bg-slate-100 px-2 py-1 text-[10.5px] font-medium text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            {/* Finder Safety Guidance Tip */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300 flex items-start gap-2">
              <Info size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="text-[11.5px] leading-relaxed">
                <span className="font-bold">Finder Protection Tip:</span> Only approve if the
                claimant provided distinguishing details (serial numbers, hidden markings, or lock
                credentials) that were <span className="underline">not disclosed</span> in your
                public report.
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </Modal.Body>

          {/* Modal Footer with Actions */}
          <Modal.Footer>
            <div className="flex w-full flex-wrap items-center justify-between gap-2.5">
              <Button
                variant="secondary"
                onPress={onClose}
                isDisabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                {/* Reject Claim Action */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleReject}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800/80 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && activeAction === "reject" ? (
                    <Spinner size="sm" color="current" />
                  ) : (
                    <XCircle size={14} strokeWidth={2.2} />
                  )}
                  <span>Reject Claim</span>
                </button>

                {/* Approve Claim Action */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#9ae600] px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#88cc00] shadow-[0_2px_10px_rgba(154,230,0,0.35)] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && activeAction === "approve" ? (
                    <Spinner size="sm" color="current" />
                  ) : (
                    <CheckCircle2 size={14} strokeWidth={2.4} />
                  )}
                  <span>Approve Claim</span>
                </button>
              </div>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>

      {/* Proof Photo Zoom Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl dark:bg-ink-900">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-slate-900/60 text-white hover:bg-slate-900"
            >
              <X size={16} />
            </button>
            <img
              src={previewImage}
              alt="Enlarged Proof"
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </Modal.Backdrop>
  );
}
