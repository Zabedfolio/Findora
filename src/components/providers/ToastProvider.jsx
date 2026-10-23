"use client";

import React from "react";
import { Toaster } from "react-hot-toast";

/**
 * Global Toast Provider wrapping react-hot-toast Toaster
 * with Findora design system styling in bottom-right corner.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children]
 */
export default function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={10}
        containerClassName="toaster-container"
        toastOptions={{
          // Default styling for all toasts
          className: "findora-toast",
          duration: 4000,
          style: {
            background: "#0f172a", // Slate-900
            color: "#f8fafc", // Slate-50
            border: "1px solid rgba(148, 163, 184, 0.2)",
            padding: "12px 16px",
            borderRadius: "14px",
            fontSize: "13.5px",
            fontWeight: "500",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
            maxWidth: "420px",
          },
          // Success Toast Options
          success: {
            duration: 3500,
            iconTheme: {
              primary: "#9ae600", // Findora lime
              secondary: "#0f172a",
            },
            style: {
              border: "1px solid rgba(154, 230, 0, 0.3)",
            },
          },
          // Error Toast Options
          error: {
            duration: 4500,
            iconTheme: {
              primary: "#f43f5e", // Rose-500
              secondary: "#ffffff",
            },
            style: {
              border: "1px solid rgba(244, 63, 94, 0.3)",
            },
          },
          // Loading Toast Options
          loading: {
            iconTheme: {
              primary: "#9ae600",
              secondary: "#334155",
            },
          },
        }}
      />
    </>
  );
}

export { toast } from "@/lib/toast";
