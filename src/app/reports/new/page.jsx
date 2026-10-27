"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ReportForm from "@/components/reports/ReportForm";
import { createReport } from "@/services/reportService";
import useAuth from "@/hooks/useAuth";
import toast from "@/lib/toast";
import { ArrowLeft, ShieldCheck, FilePlus } from "lucide-react";

export default function NewReportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // React Query mutation to publish new report
  const createMutation = useMutation({
    mutationFn: async (formDataPayload) => {
      return await createReport(formDataPayload, user);
    },
    onSuccess: (newReport) => {
      toast.success(
        newReport.type === "found"
          ? "Found item report published! Thank you for your honesty."
          : "Lost report published! We will notify you of any matching items."
      );

      // Invalidate active reports queries so Browse Reports and lists refresh immediately
      queryClient.invalidateQueries({ queryKey: ["reports"] });

      const newId = newReport.id || newReport._id;
      router.push(`/reports/${newId}`);
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to publish report. Please try again.");
    },
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8 sm:py-12 bg-slate-50/50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation Link */}
          <div className="mb-6">
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Browse Reports</span>
            </Link>
          </div>

          {/* Form Header Card */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9ae600]/15 border border-[#9ae600]/30 text-[#4b7a00] dark:text-[#9ae600] text-xs font-semibold mb-3">
              <FilePlus className="w-3.5 h-3.5" />
              <span>Community Lost &amp; Found Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white font-heading">
              Publish a New Report
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              Fill out the details below. Findora uses automated matching to connect owners with finders safely and quickly.
            </p>
          </div>

          {/* Form Container Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/40 dark:shadow-none">
            <ReportForm
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending}
              submitLabel="Publish Report"
            />
          </div>

          {/* Trust Guarantee Note */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#73ad00] dark:text-[#9ae600]" />
            <span>Protected by Findora Verification &amp; Privacy Safeguards</span>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
