import React from "react";
import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient";

/**
 * Opt-out of instant navigation validation for protected dashboard & admin routes
 * since child segments are conditionally authorized and guarded behind authentication.
 */
export const instant = false;

export default function DashboardLayout({ children }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
