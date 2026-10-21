"use client";

import React from "react";
import { Modal, Button, Spinner } from "@heroui/react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Confirmation popup for destructive actions (delete report, reject claim...).
 * @param {boolean} isOpen
 * @param {() => void} onClose - called on Cancel, Esc, or outside click (blocked while loading)
 * @param {() => void} onConfirm
 * @param {string} title
 * @param {string} message
 * @param {string} confirmText
 * @param {string} cancelText
 * @param {"danger" | "primary"} variant - colour of the confirm button
 * @param {boolean} isLoading - shows a spinner on Confirm and blocks closing
 */
export default function ConfirmModal({
  isOpen = false,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmText,
  confirmLabel: confirmLabelProp,
  cancelText,
  cancelLabel: cancelLabelProp,
  variant = "danger",
  isLoading = false,
}) {
  const { t } = useLanguage();

  // t() returns fallback when a translation is missing
  const heading = title ?? t("confirmModal.title", "Are you sure?");
  const body = description ?? message ?? t("confirmModal.message", "This action cannot be undone.");
  const confirmLabel = confirmLabelProp ?? confirmText ?? t("confirmModal.confirm", "Confirm");
  const cancelLabel = cancelLabelProp ?? cancelText ?? t("confirmModal.cancel", "Cancel");

  const handleOpenChange = (open) => {
    if (!open && !isLoading) onClose?.();
  };

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable={!isLoading}
      isKeyboardDismissDisabled={isLoading}
    >
      <Modal.Container size="sm">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>{heading}</Modal.Heading>
          </Modal.Header>

          <Modal.Body>
            <p className="text-sm text-slate-600 dark:text-slate-300">{body}</p>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onPress={onClose} isDisabled={isLoading}>
              {cancelLabel}
            </Button>
            <Button
              variant={variant === "danger" ? "danger" : "primary"}
              onPress={onConfirm}
              isDisabled={isLoading}
              isPending={isLoading}
            >
              {isLoading && <Spinner size="sm" color="current" />}
              {confirmLabel}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}