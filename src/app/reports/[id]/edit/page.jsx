"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ReportForm from "@/components/reports/ReportForm";
import { getReportById, createReport } from "@/services/reportService";
import useAuth from "@/hooks/useAuth";
import toast from "@/lib/toast";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, PackageSearch, ShieldCheck } from "lucide-react";

function EditReportContent() {
  const router = useRouter();
  const rawParams = useParams();
  const id = rawParams?.id;

  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  // Fetch existing report
  const {
    data: report,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => getReportById(id),
    enabled: Boolean(id),
  });

  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      // Simulate/perform update
      await new Promise((r) => setTimeout(r, 600));
      return { id };
    },
    onSuccess: () => {
      toast.success("Listing updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["report", id] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      router.push(`/reports/${id}`);
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to update listing");
    },
  });

  const handleSubmit = (formData) => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <Loader size="lg" />
        </div>
      </ProtectedRoute>
    );
  }

  if (isError || !report) {
    return (
      <ProtectedRoute>
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
          <EmptyState
            icon={PackageSearch}
            title="Report Not Found"
            description="The report you want to edit does not exist or has been removed."
            actionLabel="Back to Browse Reports"
            actionHref="/reports"
          />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8 sm:py-12 bg-slate-50/50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href={`/reports/${id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Listing</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white font-heading">
              Edit Report
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
              Update the details, location, or status of your report.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/40 dark:shadow-none">
            <ReportForm
              initialValues={report}
              onSubmit={handleSubmit}
              isLoading={updateMutation.isPending}
              submitLabel="Save Changes"
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function EditReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <Loader size="lg" />
        </div>
      }
    >
      <EditReportContent />
    </Suspense>
  );
}
