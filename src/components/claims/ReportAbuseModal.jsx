"use client";

import React, { useState } from "react";
import { Modal, Button, Spinner } from "@heroui/react";
import {
  Flag,
  FileWarning,
  MessageSquareWarning,
  UserRoundX,
  CircleHelp,
  AlertCircle,
} from "lucide-react";
import toast from "@/lib/toast";

/** Reason categories shown in the modal. `other` requires written details. */
export const ABUSE_REASONS = [
  {
    key: "fake_proof",
    label: "Fake proof",
    description: "Fabricated or edited photos, documents or identifying details.",
    icon: FileWarning,
  },
  {
    key: "false_ownership",
    label: "False ownership",
    description: "Claiming an item that clearly belongs to someone else.",
    icon: UserRoundX,
  },
  {
    key: "harassment",
    label: "Harassment",
    description: "Threats, abusive messages or pressure during the handover.",
    icon: MessageSquareWarning,
  },
  {
    key: "other",
    label: "Something else",
    description: "Any other suspicious or fraudulent behaviour.",
    icon: CircleHelp,
  },
];

const MAX_DETAILS = 500;
const MIN_OTHER_DETAILS = 10;

/**
 * Default submit: POSTs to the backend when NEXT_PUBLIC_API_URL is set,
 */
async function defaultSubmit(payload) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    const res = await fetch(`${apiBase}/abuse-reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Could not submit your report. Please try again.");
    return res.json().catch(() => ({}));
  }
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { demo: true };
}

/**
 * ReportAbuseModal: flag a suspicious claim or a fraudulent user.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose - Cancel, Esc, outside click (blocked while submitting)
 * @param {'claim' | 'user'} [props.targetType='claim']
 * @param {string} props.targetId - id of the claim or user being reported
 * @param {string} [props.targetName] - shown in the description (e.g. the user's name)
 * @param {(payload: { targetType: string, targetId: string, reason: string, details: string }) => Promise<any>} [props.onSubmit]
 * @param {(payload) => void} [props.onSuccess] - called after a successful submit
 */
export default function ReportAbuseModal({
  isOpen = false,
  onClose,
  targetType = "claim",
  targetId,
  targetName,
  onSubmit,
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Start fresh every time the modal opens. Resetting during render (instead of in an effect) is React's recommended pattern for reacting to a prop change.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setReason("");
      setDetails("");
      setError("");
      setIsSubmitting(false);
    }
  }

  const isClaim = targetType === "claim";
  const heading = isClaim ? "Report suspicious claim" : "Report this user";
  const subject = targetName ? `"${targetName}"` : isClaim ? "this claim" : "this user";

  const handleOpenChange = (open) => {
    if (!open && !isSubmitting) onClose?.();
  };

  const handleSubmit = async () => {
    if (!reason) {
      setError("Please choose a reason for your report.");
      return;
    }
    const trimmed = details.trim();
    if (reason === "other" && trimmed.length < MIN_OTHER_DETAILS) {
      setError(`Please add at least ${MIN_OTHER_DETAILS} characters of detail.`);
      return;
    }

    const payload = { targetType, targetId, reason, details: trimmed };
    setError("");
    setIsSubmitting(true);
    try {
      await (onSubmit || defaultSubmit)(payload);
      toast.success("Report sent. Our team will review it.");
      onSuccess?.(payload);
      onClose?.();
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable={!isSubmitting}
      isKeyboardDismissDisabled={isSubmitting}
    >
      <Modal.Container size="md" scroll="inside">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>
              <span className="inline-flex items-center gap-2">
                <Flag className="h-5 w-5 text-rose-500" aria-hidden="true" />
                {heading}
              </span>
            </Modal.Heading>
          </Modal.Header>

          <Modal.Body>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              Tell us why you are reporting {subject}. Reports are reviewed by Findora
              admins. A flag is not proof of fraud, and the other person will not see who
              reported them.
            </p>

            <fieldset className="space-y-2" disabled={isSubmitting}>
              <legend className="sr-only">Reason for report</legend>
              {ABUSE_REASONS.map(({ key, label, description, icon: Icon }) => {
                const selected = reason === key;
                return (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors ${
                      selected
                        ? "border-rose-400 bg-rose-50 dark:border-rose-500/60 dark:bg-rose-950/30"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="abuse-reason"
                      value={key}
                      checked={selected}
                      onChange={() => {
                        setReason(key);
                        setError("");
                      }}
                      className="mt-1 h-4 w-4 shrink-0 accent-rose-500"
                    />
                    <Icon
                      className={`mt-0.5 h-5 w-5 shrink-0 ${
                        selected ? "text-rose-500" : "text-slate-400"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        {label}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>

            <div className="mt-4">
              <label
                htmlFor="abuse-details"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Details {reason === "other" ? "(required)" : "(optional)"}
              </label>
              <textarea
                id="abuse-details"
                rows={3}
                maxLength={MAX_DETAILS}
                value={details}
                disabled={isSubmitting}
                onChange={(e) => {
                  setDetails(e.target.value);
                  if (error) setError("");
                }}
                placeholder="What happened? Include anything that helps admins review this."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <div className="mt-1 text-right text-[11px] text-slate-400">
                {details.length}/{MAX_DETAILS}
              </div>
            </div>

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

          <Modal.Footer>
            <Button variant="secondary" onPress={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="danger" onPress={handleSubmit} isPending={isSubmitting}>
              {isSubmitting && <Spinner size="sm" color="current" />}
              Submit report
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}