"use client";

import React from "react";
import { Spinner } from "@heroui/react";

/**
 * Centered loading indicator.
 * @param {"sm" | "md" | "lg" | "xl"} size - Spinner size
 * @param {boolean} fullPage - true = fills the screen height
 * @param {string} className - extra classes for the wrapper
 */
export default function Loader({ size = "lg", fullPage = false, className = "" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`flex w-full items-center justify-center ${
        fullPage ? "min-h-screen" : "py-10"
      } ${className}`}
    >
      <Spinner size={size} color="accent" />
    </div>
  );
}